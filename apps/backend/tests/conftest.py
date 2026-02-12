import asyncio
import os
import pathlib

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

# Anchor to apps/backend/ so alembic.ini is found regardless of where pytest is invoked from.
_BACKEND_ROOT = pathlib.Path(__file__).parent.parent

# Set the test database URL BEFORE importing any app modules so that
# pydantic-settings picks it up and all engines point at the test DB.
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://cityhero:cityhero@localhost:5432/cityhero_test",
)
os.environ.setdefault("TESTING", "1")
os.environ.setdefault("SECRET_KEY", "test-cityhero-secret-key-for-tests-only-not-real!")
os.environ.setdefault("APP_ADMIN_PASSWORD", "TestAdminPass1!")
os.environ.setdefault("APP_USERS_PASSWORD", "TestUsersPass1!")
os.environ["DATABASE_URL"] = TEST_DATABASE_URL

from app.core.database import Base, get_db  # noqa: E402
from main import app  # noqa: E402

# NullPool ensures each DB operation creates a fresh connection rather than reusing
# pooled connections. This is required in tests because pytest-asyncio 1.4+ uses
# separate event loops for session-scoped and function-scoped fixtures. A pooled
# asyncpg connection is tied to the event loop that created it and cannot be reused
# in a different loop, causing InterfaceError. NullPool sidesteps this entirely.
_engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)
_session_factory = async_sessionmaker(_engine, class_=AsyncSession, expire_on_commit=False)


async def _override_get_db():
    async with _session_factory() as session:
        yield session


app.dependency_overrides[get_db] = _override_get_db


# RBAC reference tables seeded by migration 003 — preserved between tests.
# The users table is NOT here: migration 005 seed users are intentionally wiped
# by _clean_tables so each test starts from a clean state. Tests that need an
# authenticated user should use the admin_user fixture below.
_SEED_TABLES = {"roles", "permissions", "role_permissions"}


def _alembic(command: str, *args: str) -> None:
    """Run an Alembic command synchronously. Safe to call from run_in_executor."""
    from alembic.config import Config
    from alembic import command as alembic_command
    cfg = Config(str(_BACKEND_ROOT / "alembic.ini"))
    cfg.set_main_option("script_location", str(_BACKEND_ROOT / "alembic"))
    getattr(alembic_command, command)(cfg, *args)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def _setup_schema():
    """Apply all Alembic migrations once per test session (includes RBAC seed data).

    Also warms the RBAC cache here because ASGITransport (httpx 0.28+) does not
    trigger FastAPI lifespan events, so the startup handler never runs during tests.
    """
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, _alembic, "upgrade", "head")
    from app.core.rbac_cache import load_permission_cache
    async with _session_factory() as db:
        await load_permission_cache(db)
    yield
    await loop.run_in_executor(None, _alembic, "downgrade", "base")


@pytest_asyncio.fixture(autouse=True)
async def _clean_tables():
    """Delete transactional rows between tests. Reference tables are preserved."""
    yield
    async with _engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            if table.name not in _SEED_TABLES:
                await conn.execute(table.delete())


@pytest_asyncio.fixture
async def admin_user():
    """Create a fresh admin user and return it. Cleaned up by _clean_tables after each test."""
    from app.core.security import hash_password
    from app.core.rbac_cache import get_role_id, load_permission_cache
    from app.models.user import User
    async with _session_factory() as session:
        # The RBAC cache is populated by the app lifespan, but that only runs when
        # the client fixture creates an HTTP connection. Warm it explicitly here so
        # get_role_id("admin") works regardless of fixture ordering.
        await load_permission_cache(session)
        user = User(
            email="test-admin@cityhero.com",
            name="Test Admin",
            hashed_password=hash_password("Admin123!"),
            role="admin",
            role_id=get_role_id("admin"),
            auth_provider="email",
            is_active=True,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user


@pytest.fixture
def conftest_session_factory():
    """Expose the test session factory so test files can write directly to the DB."""
    return _session_factory


@pytest_asyncio.fixture
async def client() -> AsyncClient:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
