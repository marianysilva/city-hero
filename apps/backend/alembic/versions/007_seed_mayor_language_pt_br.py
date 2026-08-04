"""Set the seeded Mayor user's language to pt-BR

Revision ID: 007
Revises: 006
Create Date: 2026-08-03

Data-only migration. Migration 005 seeded default users before the
`language` column existed (006), so every seed user — including Mayor —
ended up on 006's `en-US` server default. Product wants the seeded Mayor
account to demonstrate a non-default locale out of the box; every other
seed user keeps `en-US`.

Both directions are guarded by the pre-migration value (`AND language =
'en-US'` / `AND language = 'pt-BR'`), matching migration 005's own
`ON CONFLICT DO NOTHING` idempotency: `language` became admin-editable via
the manager dashboard's Users screen after this migration was written, so an
unguarded UPDATE would silently clobber a real operator edit on any later
downgrade/upgrade replay (e.g. `alembic downgrade base && alembic upgrade
head` during a test run, or a manual rollback).
"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "007"
down_revision: Union[str, None] = "006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.get_bind().execute(
        sa.text(
            "UPDATE users SET language = 'pt-BR' "
            "WHERE email = 'mayor@cityhero.com' AND language = 'en-US'"
        )
    )


def downgrade() -> None:
    op.get_bind().execute(
        sa.text(
            "UPDATE users SET language = 'en-US' "
            "WHERE email = 'mayor@cityhero.com' AND language = 'pt-BR'"
        )
    )
