from __future__ import annotations

import uuid
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

_CACHE: dict[str, "_RoleData"] = {}


@dataclass
class _RoleData:
    id: uuid.UUID
    name: str
    rank: int
    is_superuser: bool
    permissions: frozenset[str]


async def load_permission_cache(db: AsyncSession) -> None:
    """Load all roles and their permissions from the DB into the in-process cache.

    Called once at startup. Safe to call again to force a reload after DB changes.
    """
    from app.models.role import Role

    result = await db.execute(
        select(Role).options(selectinload(Role.permissions))
    )
    roles = result.scalars().all()

    new_cache: dict[str, _RoleData] = {}
    for role in roles:
        perms = frozenset(p.name for p in role.permissions)
        new_cache[role.name] = _RoleData(
            id=role.id,
            name=role.name,
            rank=role.rank,
            is_superuser=role.is_superuser,
            permissions=perms,
        )

    global _CACHE
    _CACHE = new_cache


def is_cache_loaded() -> bool:
    """True after load_permission_cache has run at least once and found roles."""
    return bool(_CACHE)


def has_permission(role_name: str, permission: str) -> bool:
    data = _CACHE.get(role_name)
    if data is None:
        return False
    if data.is_superuser:
        return True
    return permission in data.permissions


def get_role_id(role_name: str) -> uuid.UUID | None:
    data = _CACHE.get(role_name)
    return data.id if data else None


def get_role_rank(role_name: str) -> int:
    data = _CACHE.get(role_name)
    return data.rank if data else 99


def is_superuser(role_name: str) -> bool:
    data = _CACHE.get(role_name)
    return data.is_superuser if data else False


def can_manage(operator_role: str, target_role: str) -> bool:
    """True if operator can edit/delete the target (same rank or lower privilege).

    Uses rank <= so peers can manage each other (e.g. a secretary can edit
    another secretary). This is intentionally broader than can_create_role,
    which uses strict < to prevent privilege escalation via creation.

    Returns False when either role is absent from the cache — avoids silently
    granting access to users with stale or corrupted role data.
    """
    op_data = _CACHE.get(operator_role)
    target_data = _CACHE.get(target_role)
    if op_data is None or target_data is None:
        return False
    if op_data.is_superuser:
        return True
    return op_data.rank <= target_data.rank


def can_create_role(operator_role: str, target_role: str) -> bool:
    """True if operator can create a user with the given target role."""
    op_data = _CACHE.get(operator_role)
    target_data = _CACHE.get(target_role)
    if op_data is None or target_data is None:
        return False
    if op_data.is_superuser:
        return True
    return op_data.rank < target_data.rank


def get_all_role_names() -> list[str]:
    return sorted(_CACHE.keys(), key=lambda n: _CACHE[n].rank)


def get_assignable_role_names(operator_role: str) -> list[str]:
    """Roles this user is allowed to assign when creating a new user."""
    op_data = _CACHE.get(operator_role)
    if op_data is None:
        return []
    if op_data.is_superuser:
        return get_all_role_names()
    return [name for name in get_all_role_names() if _CACHE[name].rank > op_data.rank]


def get_manageable_role_names(operator_role: str) -> list[str]:
    """Roles whose users this operator can edit or delete (by rank comparison)."""
    op_data = _CACHE.get(operator_role)
    if op_data is None:
        return []
    if op_data.is_superuser:
        return get_all_role_names()
    return [name for name in get_all_role_names() if _CACHE[name].rank >= op_data.rank]


def get_role_data(role_name: str) -> _RoleData | None:
    return _CACHE.get(role_name)


def resolve_role_id(role: str) -> uuid.UUID:
    """Return the role UUID or raise 503 if the RBAC cache is not yet loaded."""
    from fastapi import HTTPException, status
    role_id = get_role_id(role)
    if role_id is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Role configuration not available — please retry",
        )
    return role_id
