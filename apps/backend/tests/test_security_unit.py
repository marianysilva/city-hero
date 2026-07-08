"""Unit tests for the security module — no database required."""
import base64
import json
from datetime import datetime, timezone
from uuid import uuid4

import jwt
import pytest

from app.core.config import settings
from app.core.security import DUMMY_PASSWORD_HASH, create_access_token, hash_password, verify_password

# ── Password hashing ──────────────────────────────────────────────────────────

def test_hash_password_produces_bcrypt_string():
    assert hash_password("mypassword").startswith("$2b$")


def test_hash_password_uses_different_salts():
    h1 = hash_password("password")
    h2 = hash_password("password")
    assert h1 != h2


def test_verify_password_correct():
    hashed = hash_password("correcthorse")
    assert verify_password("correcthorse", hashed) is True


def test_verify_password_wrong():
    hashed = hash_password("correcthorse")
    assert verify_password("wrong", hashed) is False


def test_verify_password_empty_string():
    hashed = hash_password("correcthorse")
    assert verify_password("", hashed) is False


def test_verify_password_case_sensitive():
    hashed = hash_password("Password123")
    assert verify_password("password123", hashed) is False


# ── Dummy hash (timing-safe login) ────────────────────────────────────────────

def test_dummy_hash_is_valid_bcrypt():
    assert DUMMY_PASSWORD_HASH.startswith("$2b$")


def test_dummy_hash_does_not_crash_verify():
    result = verify_password("any_user_input", DUMMY_PASSWORD_HASH)
    assert isinstance(result, bool)


def test_dummy_hash_does_not_match_common_passwords():
    for pw in ["password", "123456", "admin", "", "secret", "cityhero"]:
        assert verify_password(pw, DUMMY_PASSWORD_HASH) is False


# ── JWT token creation ────────────────────────────────────────────────────────

def test_create_access_token_is_decodable():
    user_id = uuid4()
    token = create_access_token(user_id, "citizen")
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    assert payload["sub"] == str(user_id)


def test_create_access_token_has_expiry():
    token = create_access_token(uuid4(), "citizen")
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    assert "exp" in payload


def test_create_access_token_expiry_within_configured_window():
    user_id = uuid4()
    before = datetime.now(timezone.utc)
    token = create_access_token(user_id, "citizen")

    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)

    expected_seconds = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    delta = (exp - before).total_seconds()
    assert expected_seconds - 5 <= delta <= expected_seconds + 5


def test_token_signed_with_wrong_key_is_rejected():
    token = jwt.encode({"sub": str(uuid4())}, "wrong-secret", algorithm="HS256")
    with pytest.raises(jwt.InvalidTokenError):
        jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])


def test_token_with_wrong_algorithm_is_rejected():
    token = jwt.encode({"sub": str(uuid4())}, settings.SECRET_KEY, algorithm="HS256")
    with pytest.raises(jwt.InvalidTokenError):
        jwt.decode(token, settings.SECRET_KEY, algorithms=["HS512"])


def test_tampered_payload_is_rejected():
    """Changing the payload without re-signing must invalidate the signature."""
    token = create_access_token(uuid4(), "citizen")
    header_b64, payload_b64, sig = token.split(".")

    padded = payload_b64 + "=" * (4 - len(payload_b64) % 4)
    payload = json.loads(base64.urlsafe_b64decode(padded))
    payload["sub"] = str(uuid4())  # change the user id

    new_payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).rstrip(b"=").decode()
    tampered = f"{header_b64}.{new_payload_b64}.{sig}"

    with pytest.raises(jwt.InvalidTokenError):
        jwt.decode(tampered, settings.SECRET_KEY, algorithms=["HS256"])
