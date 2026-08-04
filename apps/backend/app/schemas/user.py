from pydantic import EmailStr, field_validator

from app.schemas._validators import (
    validate_language_code,
    validate_name,
    validate_password_strength,
    validate_role_slug,
)
from app.schemas.auth import UserOut
from app.schemas.base import CamelBase


class AdminUserCreateRequest(CamelBase):
    email: EmailStr
    name: str
    password: str
    role: str = "citizen"
    # Optional: defaults to the User model's "en-US" if omitted. See
    # RegisterRequest.language (schemas/auth.py) for the same pattern.
    language: str | None = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        return validate_password_strength(v)

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        return validate_name(v)

    @field_validator("role")
    @classmethod
    def role_must_be_valid(cls, v: str) -> str:
        return validate_role_slug(v)

    @field_validator("language")
    @classmethod
    def language_supported(cls, v: str | None) -> str | None:
        return validate_language_code(v)


class UserUpdateRequest(CamelBase):
    name: str | None = None
    role: str | None = None
    is_active: bool | None = None
    language: str | None = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str | None) -> str | None:
        if v is not None and not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip() if v else v

    @field_validator("role")
    @classmethod
    def role_must_be_valid(cls, v: str | None) -> str | None:
        return validate_role_slug(v)

    @field_validator("language")
    @classmethod
    def language_supported(cls, v: str | None) -> str | None:
        return validate_language_code(v)


class ResetPasswordRequest(CamelBase):
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        return validate_password_strength(v)


class UsersListResponse(CamelBase):
    users: list[UserOut]
    total: int
    page: int
    page_size: int
