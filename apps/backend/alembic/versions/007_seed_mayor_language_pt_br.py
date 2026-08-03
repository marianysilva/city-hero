"""Set the seeded Mayor user's language to pt-BR

Revision ID: 007
Revises: 006
Create Date: 2026-08-03

Data-only migration. Migration 005 seeded default users before the
`language` column existed (006), so every seed user — including Mayor —
ended up on 006's `en-US` server default. Product wants the seeded Mayor
account to demonstrate a non-default locale out of the box; every other
seed user keeps `en-US`.
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
        sa.text("UPDATE users SET language = 'pt-BR' WHERE email = 'mayor@cityhero.com'")
    )


def downgrade() -> None:
    op.get_bind().execute(
        sa.text("UPDATE users SET language = 'en-US' WHERE email = 'mayor@cityhero.com'")
    )
