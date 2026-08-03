"""Add language column to users

Revision ID: 006
Revises: 005
Create Date: 2026-07-22

Part of 00-foundation/13-i18n.md. English is the app-wide default per product
decision (2026-07-22, see the task file's Status) — new rows default to
'en-US'; the mobile client resolves a per-device default (system locale, or
an explicit user choice) independently and may pass a different value at
registration.
"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "006"
down_revision: Union[str, None] = "005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("language", sa.String(5), nullable=False, server_default="en-US"),
    )


def downgrade() -> None:
    op.drop_column("users", "language")
