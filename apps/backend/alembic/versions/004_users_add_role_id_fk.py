"""Add role_id FK to users table

Revision ID: 004
Revises: 003
Create Date: 2026-06-28

Adds a nullable role_id FK to users and backfills it from the users.role string column.
Both columns are kept in sync by all write paths. The column remains nullable to
preserve backwards compatibility with any rows that predate the backfill.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("role_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_foreign_key(
        "fk_users_role_id",
        "users", "roles",
        ["role_id"], ["id"],
        ondelete="RESTRICT",
    )
    op.create_index("ix_users_role_id", "users", ["role_id"])

    # Backfill role_id from the existing role string column
    op.execute(sa.text("""
        UPDATE users u
        SET role_id = r.id
        FROM roles r
        WHERE r.name = u.role
    """))


def downgrade() -> None:
    op.drop_index("ix_users_role_id", table_name="users")
    op.drop_constraint("fk_users_role_id", "users", type_="foreignkey")
    op.drop_column("users", "role_id")
