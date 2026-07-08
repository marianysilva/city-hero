"""Seed default users: admin and one user per non-admin role

Revision ID: 005
Revises: 004
Create Date: 2026-06-28

Reads credentials from environment variables (all required — no defaults):
  APP_ADMIN          — admin email (e.g. admin@cityhero.com)
  APP_ADMIN_PASSWORD — admin password (strong password required)
  APP_USERS_PASSWORD — password for all role seed users (strong password required)

Set these in your .env file before running migrations.
ON CONFLICT DO NOTHING makes this idempotent.
"""
import os
import uuid
from datetime import datetime, timezone
from typing import Sequence, Union

import bcrypt
import sqlalchemy as sa

from alembic import op

revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Role UUIDs fixed in migration 003 — must stay in sync.
_ROLE_IDS = {
    "admin":      "00000000-0000-4000-a000-000000000001",
    "mayor":      "00000000-0000-4000-a000-000000000002",
    "secretary":  "00000000-0000-4000-a000-000000000003",
    "dispatcher": "00000000-0000-4000-a000-000000000004",
    "field_team": "00000000-0000-4000-a000-000000000005",
    "citizen":    "00000000-0000-4000-a000-000000000006",
}


def _hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12)).decode()


def upgrade() -> None:
    admin_email = os.getenv("APP_ADMIN", "admin@cityhero.com")
    admin_pwd = os.getenv("APP_ADMIN_PASSWORD", "")
    users_pwd = os.getenv("APP_USERS_PASSWORD", "")

    if not admin_pwd or not users_pwd:
        raise RuntimeError(
            "APP_ADMIN_PASSWORD and APP_USERS_PASSWORD must be set before running migration 005. "
            "Add them to your .env file. Generate a secure password with: openssl rand -base64 24"
        )

    now = datetime.now(timezone.utc)
    conn = op.get_bind()

    seed_users = [
        (admin_email,               "Admin",      "admin"),
        ("mayor@cityhero.com",      "Mayor",      "mayor"),
        ("secretary@cityhero.com",  "Secretary",  "secretary"),
        ("dispatcher@cityhero.com", "Dispatcher", "dispatcher"),
        ("field_team@cityhero.com", "Field Team", "field_team"),
        ("citizen@cityhero.com",    "Citizen",    "citizen"),
    ]

    # Hash the shared password once; only admin gets its own hash.
    users_hash = _hash(users_pwd)
    admin_hash = _hash(admin_pwd)

    for email, name, role in seed_users:
        hashed = admin_hash if role == "admin" else users_hash
        conn.execute(
            sa.text("""
                INSERT INTO users
                    (id, email, name, hashed_password, role, role_id, auth_provider, is_active, created_at)
                VALUES
                    (:id, :email, :name, :hashed, :role, :role_id, 'email', true, :now)
                ON CONFLICT (email) DO NOTHING
            """),
            {
                "id": str(uuid.uuid4()),
                "email": email,
                "name": name,
                "hashed": hashed,
                "role": role,
                "role_id": _ROLE_IDS[role],
                "now": now,
            },
        )


def downgrade() -> None:
    admin_email = os.getenv("APP_ADMIN", "admin@cityhero.com")
    conn = op.get_bind()
    emails = [
        admin_email,
        "mayor@cityhero.com",
        "secretary@cityhero.com",
        "dispatcher@cityhero.com",
        "field_team@cityhero.com",
        "citizen@cityhero.com",
    ]
    conn.execute(
        sa.text("DELETE FROM users WHERE email = ANY(:emails)"),
        {"emails": emails},
    )
