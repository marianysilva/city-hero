from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

# Defense-in-depth headers with no dependency on response content, so they're
# safe to apply unconditionally to every response (JSON API responses and the
# dev-only /docs Swagger UI alike). CSP is deliberately NOT set here — Swagger
# UI's default HTML loads inline scripts/styles and CDN-hosted assets, and a
# misconfigured CSP would break /docs without a corresponding security win
# for a JSON API that has no HTML to inject into.
_SECURITY_HEADERS = {
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
}


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        for name, value in _SECURITY_HEADERS.items():
            response.headers[name] = value
        return response
