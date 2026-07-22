from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIASGIMiddleware

import app.models  # noqa: F401 — registers all SQLAlchemy models with Base.metadata
from app.core.config import settings
from app.core.graphql_rate_limit import GraphQLRateLimitMiddleware
from app.core.limiter import limiter
from app.core.security_headers import SecurityHeadersMiddleware
from app.graphql.schema import graphql_router
from app.routers import auth, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Migrations run before startup via `alembic upgrade head` (see Dockerfile/docker-compose).
    # Lifespan is only for runtime initialisation: loading caches, seeding runtime data.
    from app.core.database import async_session
    from app.core.rbac_cache import load_permission_cache
    async with async_session() as db:
        await load_permission_cache(db)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIASGIMiddleware)
app.add_middleware(GraphQLRateLimitMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
# CORSMiddleware must be the last add_middleware() call so it's the
# outermost layer — Starlette wraps middleware in reverse registration
# order, and every response (including 429s from the two middlewares
# above) needs CORS headers or the browser hides the real status/body
# from JS behind an opaque CORS failure.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # FastAPI's default handler echoes the raw rejected value back in every
    # error's `input` field — for password fields (register, admin
    # user-create, reset-password) that means a 422 response leaks the
    # plaintext password the client just submitted. Strip it from every
    # error, not just password ones: no endpoint should echo submitted
    # values back to the client.
    errors = [{k: v for k, v in error.items() if k != "input"} for error in exc.errors()]
    return JSONResponse(status_code=422, content=jsonable_encoder({"detail": errors}))


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
# Rate limiting is handled by GraphQLRateLimitMiddleware above — slowapi's
# own @limiter.limit() decorator can't reach Strawberry's internal ASGI
# handler, so this route can't be decorated directly like auth/users can.
# Introspection, query depth limiting, and GraphiQL are configured in
# app/graphql/schema.py.
app.include_router(graphql_router, prefix="/graphql", tags=["graphql"])


@app.get("/health")
async def health_check():
    return {"status": "ok"}
