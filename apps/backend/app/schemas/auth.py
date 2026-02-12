from __future__ import annotations

from typing import TYPE_CHECKING
from uuid import UUID

from pydantic import EmailStr, field_validator

from app.schemas._validators import validate_name, validate_password_strength
from app.schemas.base import CamelBase

if TYPE_CHECKING:
    from app.models.user import User as _UserModel


class RegisterRequest(CamelBase):
    email: EmailStr
    name: str
    password: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        return validate_password_strength(v)

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        return validate_name(v)


class LoginRequest(CamelBase):
    email: EmailStr
    password: str


class UserOut(CamelBase):
    """Lean user representation used in list endpoints and auth responses."""
    id: UUID
    email: str
    name: str
    role: str
    auth_provider: str
    is_active: bool
    avatar_url: str | None = None
    created_at: str
    deleted_at: str | None = None


def user_to_out(user: _UserModel) -> UserOut:
    """Convert a User ORM instance to the lean UserOut schema."""
    return UserOut(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        auth_provider=user.auth_provider,
        is_active=user.is_active,
        avatar_url=user.avatar_url,
        created_at=user.created_at.isoformat(),
        deleted_at=user.deleted_at.isoformat() if user.deleted_at else None,
    )


class AuthResponse(CamelBase):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class RoleInfo(CamelBase):
    name: str
    rank: int
    is_superuser: bool


class Capabilities(CamelBase):
    # ["*"] for superusers; explicit sorted list for all others.
    permissions: list[str]
    # Roles this user may assign when creating a new user.
    assignable_roles: list[str]
    # Roles whose users this user may edit or delete (by rank comparison).
    manageable_roles: list[str]


class MeResponse(UserOut):
    """Extended /me response — UserOut fields plus role details and capabilities."""
    role_info: RoleInfo
    capabilities: Capabilities
