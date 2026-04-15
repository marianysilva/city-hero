"""Wait for the database to accept connections before proceeding.

Used by entrypoint.sh so the container doesn't race against the DB on startup
(e.g. during an orchestrator-driven restart where the DB is momentarily absent).

Exits 0 when a real Postgres connection succeeds, 1 after the timeout.
"""
import asyncio
import os
import sys

import asyncpg

TIMEOUT_SECONDS = 30
RETRY_DELAY = 1.0


async def main() -> int:
    raw_url = os.environ.get("DATABASE_URL")
    if not raw_url:
        print("DATABASE_URL is not set", file=sys.stderr)
        return 1

    # asyncpg doesn't understand the SQLAlchemy "+asyncpg" suffix
    url = raw_url.replace("+asyncpg", "")

    for attempt in range(1, TIMEOUT_SECONDS + 1):
        try:
            conn = await asyncpg.connect(url, timeout=2)
            await conn.close()
            print(f"Database ready (attempt {attempt})")
            return 0
        except Exception as exc:
            print(
                f"Waiting for database... ({attempt}/{TIMEOUT_SECONDS}): "
                f"{type(exc).__name__}: {exc}"
            )
            await asyncio.sleep(RETRY_DELAY)

    print(
        f"Database unreachable after {TIMEOUT_SECONDS}s, aborting",
        file=sys.stderr,
    )
    return 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
