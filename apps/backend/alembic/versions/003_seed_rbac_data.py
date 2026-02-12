"""Seed initial roles and permissions

Revision ID: 003
Revises: 002
Create Date: 2026-06-28
"""
from datetime import datetime, timezone
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Fixed UUIDs make this migration idempotent across downgrade/upgrade cycles.
# A dynamic uuid4() would generate different IDs on each upgrade, breaking any
# external table that cached a role or permission UUID.
_ROLES = [
    ("00000000-0000-4000-a000-000000000001", "admin",      0, True),
    ("00000000-0000-4000-a000-000000000002", "mayor",      1, False),
    ("00000000-0000-4000-a000-000000000003", "secretary",  2, False),
    ("00000000-0000-4000-a000-000000000004", "dispatcher", 3, False),
    ("00000000-0000-4000-a000-000000000005", "field_team", 4, False),
    ("00000000-0000-4000-a000-000000000006", "citizen",    5, False),
]

_PERMISSIONS = [
    ("00000000-0000-4000-b000-000000000001", "report:create",        "Create a new report"),
    ("00000000-0000-4000-b000-000000000002", "report:read",          "Read reports"),
    ("00000000-0000-4000-b000-000000000003", "report:update_status", "Update report status"),
    ("00000000-0000-4000-b000-000000000004", "report:checkin",       "Check in to a report location"),
    ("00000000-0000-4000-b000-000000000005", "report:assign",        "Assign report to a team"),
    ("00000000-0000-4000-b000-000000000006", "report:merge",         "Merge duplicate reports"),
    ("00000000-0000-4000-b000-000000000007", "report:close",         "Close a resolved report"),
    ("00000000-0000-4000-b000-000000000008", "comment:create",       "Post a comment on a report"),
    ("00000000-0000-4000-b000-000000000009", "team:read",            "View team members"),
    ("00000000-0000-4000-b000-000000000010", "team:manage",          "Manage team composition"),
    ("00000000-0000-4000-b000-000000000011", "user:read",            "View user profiles"),
    ("00000000-0000-4000-b000-000000000012", "user:create",          "Create new users"),
    ("00000000-0000-4000-b000-000000000013", "user:edit",            "Edit or deactivate users"),
    ("00000000-0000-4000-b000-000000000014", "analytics:read",       "View analytics dashboards"),
    ("00000000-0000-4000-b000-000000000015", "analytics:export",     "Export analytics data"),
]

# admin has is_superuser=True so needs no explicit permission rows
_ROLE_PERMISSIONS: dict[str, list[str]] = {
    "citizen":    ["report:create", "report:read", "comment:create"],
    "field_team": ["report:read", "report:update_status", "report:checkin", "comment:create"],
    "dispatcher": ["report:read", "report:assign", "report:merge", "report:update_status",
                   "comment:create", "team:read", "user:read"],
    "secretary":  ["report:read", "report:assign", "report:merge", "report:close",
                   "report:update_status", "comment:create", "analytics:read",
                   "team:read", "team:manage", "user:read", "user:create", "user:edit"],
    "mayor":      ["report:read", "report:assign", "report:merge", "report:close",
                   "report:update_status", "comment:create", "analytics:read", "analytics:export",
                   "team:read", "user:read", "user:create", "user:edit"],
}


def upgrade() -> None:
    conn = op.get_bind()
    now = datetime.now(timezone.utc)

    role_ids: dict[str, str] = {}
    for rid, name, rank, is_su in _ROLES:
        role_ids[name] = rid
        conn.execute(
            sa.text(
                "INSERT INTO roles (id, name, rank, is_superuser, created_at) "
                "VALUES (:id, :name, :rank, :is_superuser, :created_at) "
                "ON CONFLICT DO NOTHING"
            ),
            {"id": rid, "name": name, "rank": rank, "is_superuser": is_su, "created_at": now},
        )

    perm_ids: dict[str, str] = {}
    for pid, name, desc in _PERMISSIONS:
        perm_ids[name] = pid
        conn.execute(
            sa.text(
                "INSERT INTO permissions (id, name, description, created_at) "
                "VALUES (:id, :name, :description, :created_at) "
                "ON CONFLICT DO NOTHING"
            ),
            {"id": pid, "name": name, "description": desc, "created_at": now},
        )

    for role_name, perms in _ROLE_PERMISSIONS.items():
        for perm_name in perms:
            conn.execute(
                sa.text(
                    "INSERT INTO role_permissions (role_id, permission_id) "
                    "VALUES (:role_id, :perm_id) "
                    "ON CONFLICT DO NOTHING"
                ),
                {"role_id": role_ids[role_name], "perm_id": perm_ids[perm_name]},
            )


def downgrade() -> None:
    conn = op.get_bind()
    role_ids = [r[0] for r in _ROLES]
    perm_ids = [p[0] for p in _PERMISSIONS]
    conn.execute(
        sa.text("DELETE FROM role_permissions WHERE role_id = ANY(:ids)"),
        {"ids": role_ids},
    )
    conn.execute(
        sa.text("DELETE FROM permissions WHERE id = ANY(:ids)"),
        {"ids": perm_ids},
    )
    conn.execute(
        sa.text("DELETE FROM roles WHERE id = ANY(:ids)"),
        {"ids": role_ids},
    )
