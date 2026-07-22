"""Tests for GraphQL-specific hardening: depth limiting, introspection, and
the rate-limit middleware guarding /graphql."""
import strawberry
from strawberry.extensions import QueryDepthLimiter

import app.core.graphql_rate_limit as graphql_rate_limit
from app.graphql.schema import schema as app_schema


def _resolve_extension_instances():
    for ext in app_schema.extensions:
        if isinstance(ext, type):
            continue  # class-based extensions (e.g. DisableIntrospection) — nothing to inspect
        yield ext()


def test_app_schema_has_a_query_depth_limiter():
    assert any(isinstance(ext, QueryDepthLimiter) for ext in _resolve_extension_instances())


def test_depth_limiter_rejects_queries_deeper_than_the_configured_max():
    """The real app schema (`me`/`health`) has no nested object fields deep
    enough to exceed max_depth=10 today, so this proves the extension's
    *mechanism* against a small local schema shaped the same way the docs
    example is — same usage pattern app/graphql/schema.py relies on, just a
    stricter max_depth so the test doesn't need to build 10 levels of
    nesting to exercise a rejection.
    """

    @strawberry.type
    class Leaf:
        value: str

    @strawberry.type
    class Branch:
        leaf: Leaf

    @strawberry.type
    class Query:
        @strawberry.field
        def branch(self) -> Branch:
            return Branch(leaf=Leaf(value="x"))

        @strawberry.field
        def hello(self) -> str:
            return "hi"

    depth_limited_schema = strawberry.Schema(
        query=Query, extensions=[lambda: QueryDepthLimiter(max_depth=1)]
    )

    too_deep = depth_limited_schema.execute_sync("{ branch { leaf { value } } }")
    assert too_deep.errors is not None
    assert any("exceeds maximum operation depth" in str(e) for e in too_deep.errors)

    within_limit = depth_limited_schema.execute_sync("{ hello }")
    assert within_limit.errors is None
    assert within_limit.data == {"hello": "hi"}


async def test_introspection_is_disabled_outside_debug_mode(client):
    resp = await client.post("/graphql", json={"query": "{ __schema { types { name } } }"})
    body = resp.json()
    assert body["data"] is None
    assert any("introspection has been disabled" in e["message"] for e in body["errors"])


async def test_graphql_rate_limit_returns_429_after_the_configured_max(client, monkeypatch):
    from limits import parse
    from limits.storage import MemoryStorage
    from limits.strategies import FixedWindowRateLimiter

    # Rate limiting is globally disabled under TESTING=1 (see app/core/limiter.py's
    # own `enabled` flag) — flip it on and swap in an isolated strategy/rate so
    # this test doesn't share counters with, or pollute, any other test.
    monkeypatch.setattr(graphql_rate_limit.GraphQLRateLimitMiddleware, "enabled", True)
    monkeypatch.setattr(graphql_rate_limit, "_strategy", FixedWindowRateLimiter(MemoryStorage()))
    monkeypatch.setattr(graphql_rate_limit, "_RATE", parse("3/minute"))

    query = {"query": "{ health }"}
    statuses = [(await client.post("/graphql", json=query)).status_code for _ in range(4)]

    assert statuses == [200, 200, 200, 429]


def test_graphql_path_matcher_does_not_match_an_unrelated_path_with_the_same_prefix():
    """A prefix startswith("/graphql") check would also match a hypothetical
    future "/graphqlv2" route; the matcher must require an exact path or a
    "/graphql/"-rooted one."""
    assert graphql_rate_limit._is_graphql_path("/graphql") is True
    assert graphql_rate_limit._is_graphql_path("/graphql/") is True
    assert graphql_rate_limit._is_graphql_path("/graphqlv2") is False
    assert graphql_rate_limit._is_graphql_path("/graphql-playground") is False


async def test_graphql_rate_limit_message_reflects_the_configured_window(client, monkeypatch):
    """The 429 body's message must describe the actual configured rate, not a
    hardcoded "per 1 minute" that silently goes stale if _RATE's window ever
    changes (e.g. to an hourly limit)."""
    from limits import parse
    from limits.storage import MemoryStorage
    from limits.strategies import FixedWindowRateLimiter

    monkeypatch.setattr(graphql_rate_limit.GraphQLRateLimitMiddleware, "enabled", True)
    monkeypatch.setattr(graphql_rate_limit, "_strategy", FixedWindowRateLimiter(MemoryStorage()))
    monkeypatch.setattr(graphql_rate_limit, "_RATE", parse("1/hour"))

    query = {"query": "{ health }"}
    await client.post("/graphql", json=query)
    resp = await client.post("/graphql", json=query)

    assert resp.status_code == 429
    assert "hour" in resp.json()["error"]
    assert "1 minute" not in resp.json()["error"]


async def test_graphql_rate_limit_response_matches_slowapi_shape(client, monkeypatch):
    """The `apps/web` BFF's errorNormalize.ts already knows how to read
    slowapi's `{"error": "..."}` 429 shape (see packages/api_client) — this
    middleware isn't slowapi, so it must match that shape by hand."""
    from limits import parse
    from limits.storage import MemoryStorage
    from limits.strategies import FixedWindowRateLimiter

    monkeypatch.setattr(graphql_rate_limit.GraphQLRateLimitMiddleware, "enabled", True)
    monkeypatch.setattr(graphql_rate_limit, "_strategy", FixedWindowRateLimiter(MemoryStorage()))
    monkeypatch.setattr(graphql_rate_limit, "_RATE", parse("1/minute"))

    query = {"query": "{ health }"}
    await client.post("/graphql", json=query)
    resp = await client.post("/graphql", json=query)

    assert resp.status_code == 429
    assert "error" in resp.json()
    assert "Retry-After" in resp.headers
