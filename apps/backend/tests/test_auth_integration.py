"""Integration tests for /auth and /users endpoints.

Requires a running PostgreSQL instance. Configure via TEST_DATABASE_URL env var,
or use the default: postgresql+asyncpg://cityhero:cityhero@localhost:5432/cityhero_test
"""
import base64
import json
import time
from uuid import uuid4

import jwt
from httpx import AsyncClient

from app.core.config import settings

_VALID_USER = {
    "email": "hero@example.com",
    "name": "City Hero",
    "password": "SecurePass1!",
}


# ── POST /auth/register ───────────────────────────────────────────────────────

async def test_register_success(client: AsyncClient):
    resp = await client.post("/auth/register", json=_VALID_USER)
    assert resp.status_code == 201
    data = resp.json()
    assert "accessToken" in data
    assert data["tokenType"] == "bearer"
    assert data["user"]["email"] == _VALID_USER["email"]


async def test_register_returns_citizen_role_by_default(client: AsyncClient):
    resp = await client.post("/auth/register", json=_VALID_USER)
    assert resp.json()["user"]["role"] == "citizen"


async def test_register_duplicate_email_returns_409(client: AsyncClient):
    await client.post("/auth/register", json=_VALID_USER)
    resp = await client.post("/auth/register", json=_VALID_USER)
    assert resp.status_code == 409


async def test_register_short_password_returns_422(client: AsyncClient):
    resp = await client.post("/auth/register", json={**_VALID_USER, "password": "short"})
    assert resp.status_code == 422


async def test_register_empty_password_returns_422(client: AsyncClient):
    resp = await client.post("/auth/register", json={**_VALID_USER, "password": ""})
    assert resp.status_code == 422


async def test_register_7_char_password_returns_422(client: AsyncClient):
    resp = await client.post("/auth/register", json={**_VALID_USER, "password": "1234567"})
    assert resp.status_code == 422


async def test_register_8_char_password_with_complexity_is_accepted(client: AsyncClient):
    resp = await client.post("/auth/register", json={**_VALID_USER, "password": "Secure1!"})
    assert resp.status_code == 201


async def test_register_no_uppercase_returns_422(client: AsyncClient):
    resp = await client.post("/auth/register", json={**_VALID_USER, "password": "securepass1"})
    assert resp.status_code == 422


async def test_register_no_lowercase_returns_422(client: AsyncClient):
    resp = await client.post("/auth/register", json={**_VALID_USER, "password": "SECUREPASS1"})
    assert resp.status_code == 422


async def test_register_no_digit_returns_422(client: AsyncClient):
    resp = await client.post("/auth/register", json={**_VALID_USER, "password": "SecurePass"})
    assert resp.status_code == 422


async def test_register_invalid_email_returns_422(client: AsyncClient):
    resp = await client.post("/auth/register", json={**_VALID_USER, "email": "not-an-email"})
    assert resp.status_code == 422


async def test_register_empty_name_returns_422(client: AsyncClient):
    resp = await client.post("/auth/register", json={**_VALID_USER, "name": "   "})
    assert resp.status_code == 422


async def test_register_password_not_returned_in_response(client: AsyncClient):
    resp = await client.post("/auth/register", json=_VALID_USER)
    body_str = resp.text
    assert _VALID_USER["password"] not in body_str
    assert "hashed_password" not in body_str


# ── POST /auth/login ──────────────────────────────────────────────────────────

async def test_login_success(client: AsyncClient):
    await client.post("/auth/register", json=_VALID_USER)
    resp = await client.post(
        "/auth/login",
        json={"email": _VALID_USER["email"], "password": _VALID_USER["password"]},
    )
    assert resp.status_code == 200
    assert "accessToken" in resp.json()


async def test_login_wrong_password_returns_401(client: AsyncClient):
    await client.post("/auth/register", json=_VALID_USER)
    resp = await client.post(
        "/auth/login",
        json={"email": _VALID_USER["email"], "password": "wrongpassword"},
    )
    assert resp.status_code == 401


async def test_login_unknown_email_returns_401(client: AsyncClient):
    resp = await client.post(
        "/auth/login",
        json={"email": "ghost@example.com", "password": "anypassword"},
    )
    assert resp.status_code == 401


async def test_login_unknown_email_and_wrong_password_return_identical_error(client: AsyncClient):
    """Both failure modes must return the same status and message to prevent user enumeration."""
    await client.post("/auth/register", json=_VALID_USER)

    wrong_pw = await client.post(
        "/auth/login", json={"email": _VALID_USER["email"], "password": "wrongpassword"}
    )
    unknown_email = await client.post(
        "/auth/login", json={"email": "ghost@example.com", "password": "wrongpassword"}
    )

    assert wrong_pw.status_code == unknown_email.status_code == 401
    assert wrong_pw.json()["detail"] == unknown_email.json()["detail"]


async def test_login_timing_bcrypt_always_runs(client: AsyncClient):
    """
    Unknown email must take comparable time to wrong password.
    If bcrypt is skipped for unknown emails, the response is ~100x faster,
    creating a timing oracle that reveals registered email addresses.
    """
    await client.post("/auth/register", json=_VALID_USER)

    N = 3

    start = time.monotonic()
    for _ in range(N):
        await client.post("/auth/login", json={"email": "ghost@example.com", "password": "x"})
    unknown_avg = (time.monotonic() - start) / N

    start = time.monotonic()
    for _ in range(N):
        await client.post("/auth/login", json={"email": _VALID_USER["email"], "password": "x"})
    wrong_pw_avg = (time.monotonic() - start) / N

    slower = max(unknown_avg, wrong_pw_avg)
    faster = min(unknown_avg, wrong_pw_avg)
    ratio = slower / faster
    assert ratio < 3.0, (
        f"Timing ratio {ratio:.2f}x suggests bcrypt is skipped for unknown emails "
        f"(unknown={unknown_avg:.3f}s, wrong_pw={wrong_pw_avg:.3f}s). "
        "This enables user enumeration via timing."
    )


async def test_login_sql_injection_in_email_returns_422(client: AsyncClient):
    resp = await client.post("/auth/login", json={"email": "' OR '1'='1", "password": "pw"})
    assert resp.status_code == 422


async def test_login_sql_injection_in_password_does_not_bypass_auth(client: AsyncClient):
    await client.post("/auth/register", json=_VALID_USER)
    resp = await client.post(
        "/auth/login",
        json={"email": _VALID_USER["email"], "password": "' OR '1'='1' --"},
    )
    assert resp.status_code == 401


async def test_login_returns_valid_jwt(client: AsyncClient):
    await client.post("/auth/register", json=_VALID_USER)
    resp = await client.post(
        "/auth/login",
        json={"email": _VALID_USER["email"], "password": _VALID_USER["password"]},
    )
    token = resp.json()["accessToken"]
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    assert "sub" in payload
    assert "exp" in payload


# ── GET /users/me ─────────────────────────────────────────────────────────────

async def test_get_me_with_valid_token(client: AsyncClient):
    reg = await client.post("/auth/register", json=_VALID_USER)
    token = reg.json()["accessToken"]
    resp = await client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == _VALID_USER["email"]


async def test_get_me_without_token_returns_401(client: AsyncClient):
    """FastAPI 0.100+ returns 401 (not 403) when the Authorization header is missing."""
    resp = await client.get("/users/me")
    assert resp.status_code == 401


async def test_get_me_with_garbage_token_returns_401(client: AsyncClient):
    resp = await client.get("/users/me", headers={"Authorization": "Bearer not.a.jwt"})
    assert resp.status_code == 401


async def test_get_me_with_tampered_payload_returns_401(client: AsyncClient):
    reg = await client.post("/auth/register", json=_VALID_USER)
    token = reg.json()["accessToken"]

    header_b64, payload_b64, sig = token.split(".")
    padded = payload_b64 + "=" * (4 - len(payload_b64) % 4)
    payload = json.loads(base64.urlsafe_b64decode(padded))
    payload["sub"] = str(uuid4())  # point to a different user
    new_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).rstrip(b"=").decode()

    tampered = f"{header_b64}.{new_b64}.{sig}"
    resp = await client.get("/users/me", headers={"Authorization": f"Bearer {tampered}"})
    assert resp.status_code == 401


async def test_get_me_with_token_signed_by_wrong_secret_returns_401(client: AsyncClient):
    forged = jwt.encode({"sub": str(uuid4())}, "attacker-secret", algorithm="HS256")
    resp = await client.get("/users/me", headers={"Authorization": f"Bearer {forged}"})
    assert resp.status_code == 401


async def test_get_me_with_nonexistent_user_sub_returns_401(client: AsyncClient):
    """Token with a valid signature but unknown user_id must be rejected."""
    fake_token = jwt.encode(
        {"sub": str(uuid4())},
        settings.SECRET_KEY,
        algorithm="HS256",
    )
    resp = await client.get("/users/me", headers={"Authorization": f"Bearer {fake_token}"})
    assert resp.status_code == 401


# ── GET /users/{user_id} ──────────────────────────────────────────────────────

async def test_get_user_by_id_requires_authentication(client: AsyncClient):
    """FastAPI 0.100+ returns 401 (not 403) when the Authorization header is missing."""
    reg = await client.post("/auth/register", json=_VALID_USER)
    user_id = reg.json()["user"]["id"]
    resp = await client.get(f"/users/{user_id}")
    assert resp.status_code == 401


async def test_get_user_by_id_with_auth(client: AsyncClient, admin_user):
    """Requires user:read permission — use admin who has all permissions."""
    from app.core.security import create_access_token
    reg = await client.post("/auth/register", json=_VALID_USER)
    user_id = reg.json()["user"]["id"]
    token = create_access_token(admin_user.id, admin_user.role)
    resp = await client.get(f"/users/{user_id}", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["id"] == user_id


async def test_get_nonexistent_user_returns_404(client: AsyncClient, admin_user):
    """Requires user:read permission — use admin who has all permissions."""
    from app.core.security import create_access_token
    token = create_access_token(admin_user.id, admin_user.role)
    resp = await client.get(f"/users/{uuid4()}", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 404
