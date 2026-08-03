"""Add a CHECK constraint on users.language

Revision ID: 008
Revises: 007
Create Date: 2026-08-03

Pydantic's `validate_language_code` (app/schemas/_validators.py) is the only
thing enforcing `language IN ('en-US', 'pt-BR')` today — there was no
DB-level backstop, unlike most other enumerated columns in this schema.
A CHECK constraint doesn't replace that validation (API callers still get a
friendly 422 with a stable error code), it just closes the gap for any write
path that doesn't go through the Pydantic layer (a raw migration, a future
admin script, direct DB access).
"""
from typing import Sequence, Union

from alembic import op

revision: str = "008"
down_revision: Union[str, None] = "007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_CONSTRAINT_NAME = "ck_users_language_supported"
_CONSTRAINT_SQL = "language IN ('en-US', 'pt-BR')"


def upgrade() -> None:
    op.create_check_constraint(_CONSTRAINT_NAME, "users", _CONSTRAINT_SQL)


def downgrade() -> None:
    op.drop_constraint(_CONSTRAINT_NAME, "users", type_="check")
