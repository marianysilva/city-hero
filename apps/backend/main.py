from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIASGIMiddleware

from app.core.config import settings
from app.core.limiter import limiter
from app.graphql.schema import graphql_router
from app.routers import auth, users
import app.models  # noqa: F401 — registers all SQLAlchemy models with Base.metadata


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Migrations run before startup via `alembic upgrade head` (see Dockerfile/docker-compose).
    # Lifespan is only for runtime initialisation: loading caches, seeding runtime data.
    from app.core.rbac_cache import load_permission_cache
    from app.core.database import async_session
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
# Rate limiting for /graphql must be configured at the infrastructure level
# (nginx limit_req / Cloudflare WAF) — slowapi decorators don't reach Strawberry's
# internal ASGI handler. Introspection and GraphiQL are disabled via schema.py.
app.include_router(graphql_router, prefix="/graphql", tags=["graphql"])


@app.get("/health")
async def health_check():
    return {"status": "ok"}
