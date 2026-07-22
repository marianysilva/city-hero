"""Integration tests for the global security-headers middleware."""


async def test_health_response_has_security_headers(client):
    resp = await client.get("/health")
    assert resp.headers["Strict-Transport-Security"] == "max-age=63072000; includeSubDomains"
    assert resp.headers["X-Content-Type-Options"] == "nosniff"
    assert resp.headers["X-Frame-Options"] == "DENY"
    assert resp.headers["Referrer-Policy"] == "no-referrer"


async def test_security_headers_present_on_404_responses_too(client):
    """The middleware wraps every response, not just 2xx ones."""
    resp = await client.get("/this-route-does-not-exist")
    assert resp.status_code == 404
    assert resp.headers["X-Content-Type-Options"] == "nosniff"
    assert resp.headers["X-Frame-Options"] == "DENY"
