import re


def validate_password_strength(v: str) -> str:
    if len(v) < 8:
        raise ValueError("Password must be at least 8 characters")
    if len(v) > 128:
        raise ValueError("Password must be at most 128 characters")
    if not re.search(r"[A-Z]", v):
        raise ValueError("Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", v):
        raise ValueError("Password must contain at least one lowercase letter")
    if not re.search(r"\d", v):
        raise ValueError("Password must contain at least one digit")
    if not re.search(r"[^a-zA-Z0-9]", v):
        raise ValueError("Password must contain at least one special character")
    return v


def validate_name(v: str) -> str:
    if not v.strip():
        raise ValueError("Name cannot be empty")
    return v.strip()


def validate_role_slug(v: str | None) -> str | None:
    if v is None:
        return v
    from app.core.rbac_cache import get_role_data
    role_data = get_role_data(v)
    if role_data is None:
        raise ValueError(f"Unknown role: {v!r}")
    return v
