import os
import time

from limits import parse
from limits.storage import MemoryStorage
from limits.strategies import FixedWindowRateLimiter
from slowapi.util import get_remote_address
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

# slowapi's @limiter.limit() decorator can't reach /graphql — Strawberry's
# GraphQLRouter owns its own internal routing, not a plain path-operation
# function slowapi's decorator wraps (see app/graphql/schema.py). ASGI
# middleware runs in front of routing regardless of which router eventually
# handles a path, so it works where the decorator can't. Built directly on
# `limits` — the same underlying package slowapi itself uses — since slowapi
# has no public "check an arbitrary request" entry point outside the
# decorator/route flow.
_RATE = parse("30/minute")
_strategy = FixedWindowRateLimiter(MemoryStorage())


class GraphQLRateLimitMiddleware(BaseHTTPMiddleware):
    # Read at request time (not import time) so tests can flip this via
    # monkeypatch without reimporting the module.
    enabled = os.getenv("TESTING") != "1"

    async def dispatch(self, request: Request, call_next):
        if self.enabled and request.url.path.startswith("/graphql"):
            key = get_remote_address(request)
            if not _strategy.hit(_RATE, key):
                stats = _strategy.get_window_stats(_RATE, key)
                retry_after = max(1, round(stats.reset_time - time.time()))
                return JSONResponse(
                    {"error": f"Rate limit exceeded: {_RATE.amount} per 1 minute"},
                    status_code=429,
                    headers={"Retry-After": str(retry_after)},
                )
        return await call_next(request)
