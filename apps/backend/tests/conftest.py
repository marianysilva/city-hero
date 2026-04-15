import os

# Disable rate limiting before importing the app: the limiter is constructed
# at import time from this env var. Without this, slowapi's per-IP counters
# persist across requests in a single pytest run and the 7th call to
# /auth/register would return 429.
os.environ.setdefault("RATE_LIMIT_ENABLED", "false")

from collections.abc import AsyncGenerator  # noqa: E402

import pytest_asyncio  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine  # noqa: E402
from sqlalchemy.pool import NullPool  # noqa: E402

from app.core.database import Base, get_db  # noqa: E402
from main import app  # noqa: E402

TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL")
if not TEST_DATABASE_URL:
    raise RuntimeError(
        "TEST_DATABASE_URL environment variable is required. "
        "Set it to a dedicated test database URL."
    )


@pytest_asyncio.fixture(scope="session", loop_scope="session")
async def engine():
    # NullPool avoids asyncpg connection-to-loop binding issues:
    # with pooling, pooled connections stay bound to the loop that
    # created them and break when reused in another test's loop.
    eng = create_async_engine(TEST_DATABASE_URL, echo=False, poolclass=NullPool)
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield eng
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await eng.dispose()


@pytest_asyncio.fixture(loop_scope="session")
async def db(engine) -> AsyncGenerator[AsyncSession, None]:
    # Per-test isolation via outer transaction + SAVEPOINT: the session
    # runs inside a savepoint, session.commit() releases the savepoint,
    # and the outer rollback undoes everything at teardown.
    async with engine.connect() as conn:
        trans = await conn.begin()
        session = AsyncSession(
            bind=conn,
            expire_on_commit=False,
            join_transaction_mode="create_savepoint",
        )
        try:
            yield session
        finally:
            await session.close()
            await trans.rollback()


@pytest_asyncio.fixture(loop_scope="session")
async def client(db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as c:
        yield c
    app.dependency_overrides.clear()
