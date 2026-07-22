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
#
# Overridable via .env (GRAPHQL_RATE_LIMIT, e.g. "30/10 second") so local/e2e
# dev doesn't have to wait out the full production window between test runs —
# see docker-compose.override.yml and app/core/limiter.py's LOGIN_RATE_LIMIT
# for the same pattern. Default matches production.
_RATE = parse(os.getenv("GRAPHQL_RATE_LIMIT", "30/minute"))
_strategy = FixedWindowRateLimiter(MemoryStorage())


def _is_graphql_path(path: str) -> bool:
    """True for "/graphql" and anything rooted under it, but not an unrelated
    path that merely shares the prefix (e.g. a hypothetical "/graphqlv2")."""
    return path == "/graphql" or path.startswith("/graphql/")


class GraphQLRateLimitMiddleware(BaseHTTPMiddleware):
    # Read at request time (not import time) so tests can flip this via
    # monkeypatch without reimporting the module.
    enabled = os.getenv("TESTING") != "1"

    async def dispatch(self, request: Request, call_next):
        """Rate-limit /graphql requests; every other path passes through
        untouched. Returns the downstream response, or a 429 JSONResponse
        matching slowapi's own error shape when the limit is exceeded."""
        if self.enabled and _is_graphql_path(request.url.path):
            key = get_remote_address(request)
            if not _strategy.hit(_RATE, key):
                stats = _strategy.get_window_stats(_RATE, key)
                retry_after = max(1, round(stats.reset_time - time.time()))
                # str(_RATE) renders as e.g. "30 per 1 minute" — derived from
                # the actual configured rate, so this can't drift out of sync
                # with the Retry-After header the way a hardcoded window text
                # could if _RATE's granularity ever changes.
                return JSONResponse(
                    {"error": f"Rate limit exceeded: {_RATE}"},
                    status_code=429,
                    headers={"Retry-After": str(retry_after)},
                )
        return await call_next(request)
