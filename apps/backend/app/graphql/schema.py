import strawberry
from strawberry.extensions import DisableIntrospection, QueryDepthLimiter
from strawberry.fastapi import GraphQLRouter
from strawberry.types import Info

from app.core.config import settings
from app.graphql.context import get_graphql_context
from app.graphql.types.user import UserType
from app.models.user import User


def _require_auth(info: Info) -> User:
    user = info.context.get("current_user")
    if user is None:
        raise PermissionError("Authentication required")
    return user


def _to_user_type(user: User) -> UserType:
    return UserType(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        auth_provider=user.auth_provider,
        avatar_url=user.avatar_url,
        is_active=user.is_active,
        language=user.language,
        created_at=user.created_at,
    )


@strawberry.type
class Query:
    @strawberry.field
    async def me(self, info: Info) -> UserType | None:
        user = info.context.get("current_user")
        return _to_user_type(user) if user else None

    @strawberry.field
    async def health(self) -> str:
        return "ok"


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def placeholder(self) -> bool:
        """Placeholder — remove when first real mutation is added."""
        return True


schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    extensions=[
        # Caps nested-selection depth so a query can't force the resolver
        # graph into exponential blowup — cheap to enforce now, before any
        # resolver actually has nested list fields to abuse. 10 is generous
        # for today's flat `me`/`health` schema; tighten as real nested
        # types (reports -> comments -> author, etc.) get added.
        # A factory callable, not a bare instance — Strawberry deprecated
        # passing shared instances so a fresh one is built per request.
        lambda: QueryDepthLimiter(max_depth=10),
        # Disable introspection outside debug mode — prevents attackers from
        # enumerating the full API surface without authentication.
        *([] if settings.DEBUG else [DisableIntrospection]),
    ],
)

graphql_router = GraphQLRouter(
    schema,
    context_getter=get_graphql_context,
    # Block GET-based introspection (e.g. browser URL bar queries).
    allow_queries_via_get=False,
    # Disable GraphiQL IDE in production — it also allows introspection.
    graphql_ide=None if not settings.DEBUG else "graphiql",
)
