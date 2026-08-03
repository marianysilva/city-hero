import re

from pydantic_core import PydanticCustomError

# Stable, per-rule `type` codes instead of a single generic ValueError — a
# plain `raise ValueError(msg)` collapses every rule under Pydantic's own
# generic "value_error" type, leaving the frontend nothing to key an
# i18n translation off of except parsing this English sentence. Per
# Google's/Microsoft's API guidelines (server sends a stable code + params,
# client owns the localized message — the message here is only an English
# fallback for callers with no translation for a given code.
_MIN_LENGTH = 8
_MAX_LENGTH = 128


def validate_password_strength(v: str) -> str:
    if len(v) < _MIN_LENGTH:
        raise PydanticCustomError(
            "password_too_short",
            "Password must be at least {min_length} characters",
            {"min_length": _MIN_LENGTH},
        )
    if len(v) > _MAX_LENGTH:
        raise PydanticCustomError(
            "password_too_long",
            "Password must be at most {max_length} characters",
            {"max_length": _MAX_LENGTH},
        )
    if not re.search(r"[A-Z]", v):
        raise PydanticCustomError(
            "password_missing_uppercase",
            "Password must contain at least one uppercase letter",
        )
    if not re.search(r"[a-z]", v):
        raise PydanticCustomError(
            "password_missing_lowercase",
            "Password must contain at least one lowercase letter",
        )
    if not re.search(r"\d", v):
        raise PydanticCustomError(
            "password_missing_digit",
            "Password must contain at least one digit",
        )
    if not re.search(r"[^a-zA-Z0-9]", v):
        raise PydanticCustomError(
            "password_missing_special_char",
            "Password must contain at least one special character",
        )
    return v


def validate_name(v: str) -> str:
    """Reject a name that's empty or all whitespace; return it trimmed."""
    if not v.strip():
        raise PydanticCustomError("name_empty", "Name cannot be empty")
    return v.strip()


def validate_role_slug(v: str | None) -> str | None:
    """Reject a role slug that isn't a known RBAC role; `None` passes through."""
    if v is None:
        return v
    from app.core.rbac_cache import get_role_data

    role_data = get_role_data(v)
    if role_data is None:
        raise PydanticCustomError("role_unknown", "Unknown role: {role}", {"role": v})
    return v


# Kept in sync with packages/i18n's SUPPORTED_LOCALES (00-foundation/13-i18n.md).
_SUPPORTED_LANGUAGES = {"pt-BR", "en-US"}


def validate_language_code(v: str | None) -> str | None:
    """Reject a language code outside `_SUPPORTED_LANGUAGES`; `None` passes through."""
    if v is None:
        return v
    if v not in _SUPPORTED_LANGUAGES:
        raise PydanticCustomError(
            "language_unsupported",
            "Unsupported language: {language}",
            {"language": v},
        )
    return v
