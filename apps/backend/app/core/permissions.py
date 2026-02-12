from enum import Enum

from fastapi import Depends, HTTPException, status

from app.core.rbac_cache import has_permission as _has_permission
from app.core.security import get_current_user
from app.models.user import User


class RoleSlug(str, Enum):
    """Compile-time constants for role name strings.

    Renamed from `Role` to `RoleSlug` to avoid collision with the
    SQLAlchemy model `app.models.role.Role`. Values must match the
    `name` column in the roles table.
    """
    CITIZEN    = "citizen"
    FIELD_TEAM = "field_team"
    DISPATCHER = "dispatcher"
    SECRETARY  = "secretary"
    MAYOR      = "mayor"
    ADMIN      = "admin"


def require_permission(permission: str):
    """FastAPI dependency that enforces a specific permission string."""
    async def _check(current_user: User = Depends(get_current_user)) -> User:
        if not _has_permission(current_user.role, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user
    return _check


def require_role(*roles: RoleSlug):
    """FastAPI dependency that enforces one of the given roles."""
    async def _check(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in {r.value for r in roles}:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user
    return _check
