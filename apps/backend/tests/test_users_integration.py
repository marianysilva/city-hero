"""Integration tests for /users endpoints (CRUD, RBAC enforcement, soft-delete, restore).

Requires a running PostgreSQL instance. Configure via TEST_DATABASE_URL env var,
or use the default: postgresql+asyncpg://cityhero:cityhero@localhost:5432/cityhero_test
"""
from uuid import uuid4

import pytest
from httpx import AsyncClient

from app.core.security import create_access_token

# ── Helpers ───────────────────────────────────────────────────────────────────

def _auth(user) -> dict:
    return {"Authorization": f"Bearer {create_access_token(user.id, user.role)}"}


async def _make_user(session_factory, role: str, email: str, name: str):
    """Create a user with the given role and return the ORM object."""
    from app.core.rbac_cache import get_role_id
    from app.core.security import hash_password
    from app.models.user import User
    async with session_factory() as session:
        user = User(
            email=email,
            name=name,
            hashed_password=hash_password("SecurePass1!"),
            role=role,
            role_id=get_role_id(role),
            auth_provider="email",
            is_active=True,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
async def secretary(conftest_session_factory):
    return await _make_user(
        conftest_session_factory, "secretary", "secretary@test.com", "Secretary"
    )


@pytest.fixture
async def dispatcher(conftest_session_factory):
    return await _make_user(
        conftest_session_factory, "dispatcher", "dispatcher@test.com", "Dispatcher"
    )


@pytest.fixture
async def citizen(conftest_session_factory):
    return await _make_user(
        conftest_session_factory, "citizen", "citizen@test.com", "Citizen"
    )


@pytest.fixture
async def target_citizen(conftest_session_factory):
    """A second citizen used as the target of CRUD operations."""
    return await _make_user(
        conftest_session_factory, "citizen", "target@test.com", "Target Citizen"
    )


# ── GET /users ────────────────────────────────────────────────────────────────

async def test_list_users_admin_gets_200(client: AsyncClient, admin_user):
    resp = await client.get("/users", headers=_auth(admin_user))
    assert resp.status_code == 200
    data = resp.json()
    assert "users" in data
    assert "total" in data
    assert "page" in data


async def test_list_users_citizen_gets_403(client: AsyncClient, citizen):
    resp = await client.get("/users", headers=_auth(citizen))
    assert resp.status_code == 403


async def test_list_users_unauthenticated_gets_401(client: AsyncClient):
    resp = await client.get("/users")
    assert resp.status_code == 401


async def test_list_users_default_status_is_active(client: AsyncClient, admin_user, target_citizen):
    resp = await client.get("/users", headers=_auth(admin_user))
    assert resp.status_code == 200
    users = resp.json()["users"]
    assert all(u["isActive"] for u in users if u["deletedAt"] is None)


async def test_list_users_deleted_tab_returns_only_deleted(client: AsyncClient, admin_user, target_citizen):
    # Soft-delete the target
    await client.delete(f"/users/{target_citizen.id}", headers=_auth(admin_user))

    resp = await client.get("/users?status=deleted", headers=_auth(admin_user))
    assert resp.status_code == 200
    users = resp.json()["users"]
    assert all(u["deletedAt"] is not None for u in users)


async def test_list_users_search_filters_by_name(client: AsyncClient, admin_user, target_citizen):
    resp = await client.get(f"/users?q={target_citizen.name[:4]}", headers=_auth(admin_user))
    assert resp.status_code == 200
    users = resp.json()["users"]
    assert any(u["name"] == target_citizen.name for u in users)


async def test_list_users_invalid_status_falls_back_to_active(client: AsyncClient, admin_user):
    resp = await client.get("/users?status=invalid", headers=_auth(admin_user))
    # FastAPI validates the Literal type — should return 422
    assert resp.status_code == 422


async def test_list_users_pagination(client: AsyncClient, admin_user):
    resp = await client.get("/users?page=1&page_size=1", headers=_auth(admin_user))
    assert resp.status_code == 200
    data = resp.json()
    assert data["pageSize"] == 1
    assert data["page"] == 1


async def test_list_users_invalid_sort_field_returns_422(client: AsyncClient, admin_user):
    resp = await client.get("/users?sort=invalid_field", headers=_auth(admin_user))
    assert resp.status_code == 422


async def test_list_users_dispatcher_can_read(client: AsyncClient, dispatcher):
    resp = await client.get("/users", headers=_auth(dispatcher))
    assert resp.status_code == 200


# ── GET /users/{id} ───────────────────────────────────────────────────────────

async def test_get_user_by_id_admin_gets_200(client: AsyncClient, admin_user, target_citizen):
    resp = await client.get(f"/users/{target_citizen.id}", headers=_auth(admin_user))
    assert resp.status_code == 200
    assert resp.json()["id"] == str(target_citizen.id)


async def test_get_user_by_id_citizen_gets_403(client: AsyncClient, citizen, target_citizen):
    resp = await client.get(f"/users/{target_citizen.id}", headers=_auth(citizen))
    assert resp.status_code == 403


async def test_get_user_by_id_nonexistent_returns_404(client: AsyncClient, admin_user):
    resp = await client.get(f"/users/{uuid4()}", headers=_auth(admin_user))
    assert resp.status_code == 404


async def test_get_user_by_id_deleted_user_returns_404(client: AsyncClient, admin_user, target_citizen):
    await client.delete(f"/users/{target_citizen.id}", headers=_auth(admin_user))
    resp = await client.get(f"/users/{target_citizen.id}", headers=_auth(admin_user))
    assert resp.status_code == 404


# ── POST /users ───────────────────────────────────────────────────────────────

_NEW_CITIZEN = {"email": "new@test.com", "name": "New User", "password": "NewPass1!", "role": "citizen"}


async def test_create_user_admin_gets_201(client: AsyncClient, admin_user):
    resp = await client.post("/users", json=_NEW_CITIZEN, headers=_auth(admin_user))
    assert resp.status_code == 201
    assert resp.json()["email"] == _NEW_CITIZEN["email"]


async def test_create_user_citizen_gets_403(client: AsyncClient, citizen):
    resp = await client.post("/users", json=_NEW_CITIZEN, headers=_auth(citizen))
    assert resp.status_code == 403


async def test_create_user_unauthenticated_gets_401(client: AsyncClient):
    resp = await client.post("/users", json=_NEW_CITIZEN)
    assert resp.status_code == 401


async def test_create_user_secretary_can_create_citizen(client: AsyncClient, secretary):
    resp = await client.post("/users", json=_NEW_CITIZEN, headers=_auth(secretary))
    assert resp.status_code == 201


async def test_create_user_secretary_cannot_create_admin(client: AsyncClient, secretary):
    resp = await client.post(
        "/users",
        json={**_NEW_CITIZEN, "role": "admin"},
        headers=_auth(secretary),
    )
    assert resp.status_code == 403


async def test_create_user_duplicate_email_returns_409(client: AsyncClient, admin_user, target_citizen):
    resp = await client.post(
        "/users",
        json={**_NEW_CITIZEN, "email": target_citizen.email},
        headers=_auth(admin_user),
    )
    assert resp.status_code == 409


async def test_create_user_weak_password_returns_422(client: AsyncClient, admin_user):
    resp = await client.post(
        "/users",
        json={**_NEW_CITIZEN, "password": "alllower"},
        headers=_auth(admin_user),
    )
    assert resp.status_code == 422


async def test_create_user_weak_password_not_leaked_in_error(client: AsyncClient, admin_user):
    resp = await client.post(
        "/users",
        json={**_NEW_CITIZEN, "password": "alllower"},
        headers=_auth(admin_user),
    )
    assert "alllower" not in resp.text
    assert '"input"' not in resp.text


async def test_create_user_weak_password_has_a_stable_type_code_for_i18n(
    client: AsyncClient, admin_user
):
    """The frontend keys its translated validation messages off `type` (see
    apps/web/app/(dashboard)/users/_api.ts) — a plain ValueError would have
    collapsed this under Pydantic's generic "value_error" type instead."""
    resp = await client.post(
        "/users",
        json={**_NEW_CITIZEN, "password": "alllower"},
        headers=_auth(admin_user),
    )
    assert resp.status_code == 422
    detail = resp.json()["detail"]
    assert detail[0]["type"] == "password_missing_uppercase"


async def test_create_user_invalid_role_returns_422(client: AsyncClient, admin_user):
    resp = await client.post(
        "/users",
        json={**_NEW_CITIZEN, "role": "supervillain"},
        headers=_auth(admin_user),
    )
    assert resp.status_code == 422
    detail = resp.json()["detail"]
    assert detail[0]["type"] == "role_unknown"


async def test_create_user_password_not_in_response(client: AsyncClient, admin_user):
    resp = await client.post("/users", json=_NEW_CITIZEN, headers=_auth(admin_user))
    assert "password" not in resp.text
    assert "hashed_password" not in resp.text


async def test_create_user_defaults_language_to_en_us(client: AsyncClient, admin_user):
    resp = await client.post("/users", json=_NEW_CITIZEN, headers=_auth(admin_user))
    assert resp.status_code == 201
    assert resp.json()["language"] == "en-US"


async def test_create_user_accepts_an_explicit_supported_language(client: AsyncClient, admin_user):
    resp = await client.post(
        "/users",
        json={**_NEW_CITIZEN, "language": "pt-BR"},
        headers=_auth(admin_user),
    )
    assert resp.status_code == 201
    assert resp.json()["language"] == "pt-BR"


async def test_create_user_unsupported_language_returns_422(client: AsyncClient, admin_user):
    resp = await client.post(
        "/users",
        json={**_NEW_CITIZEN, "language": "fr-FR"},
        headers=_auth(admin_user),
    )
    assert resp.status_code == 422
    assert resp.json()["detail"][0]["type"] == "language_unsupported"


# ── PATCH /users/{id} ────────────────────────────────────────────────────────

async def test_update_user_name_admin_gets_200(client: AsyncClient, admin_user, target_citizen):
    resp = await client.patch(
        f"/users/{target_citizen.id}",
        json={"name": "Updated Name"},
        headers=_auth(admin_user),
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "Updated Name"


async def test_update_user_citizen_gets_403(client: AsyncClient, citizen, target_citizen):
    resp = await client.patch(
        f"/users/{target_citizen.id}",
        json={"name": "Hacker"},
        headers=_auth(citizen),
    )
    assert resp.status_code == 403


async def test_update_user_unauthenticated_gets_401(client: AsyncClient, target_citizen):
    resp = await client.patch(f"/users/{target_citizen.id}", json={"name": "X"})
    assert resp.status_code == 401


async def test_update_user_admin_can_change_role(client: AsyncClient, admin_user, target_citizen):
    resp = await client.patch(
        f"/users/{target_citizen.id}",
        json={"role": "dispatcher"},
        headers=_auth(admin_user),
    )
    assert resp.status_code == 200
    assert resp.json()["role"] == "dispatcher"


async def test_update_user_non_admin_cannot_change_role(client: AsyncClient, secretary, target_citizen):
    resp = await client.patch(
        f"/users/{target_citizen.id}",
        json={"role": "field_team"},
        headers=_auth(secretary),
    )
    assert resp.status_code == 403


async def test_update_user_language_admin_gets_200(client: AsyncClient, admin_user, target_citizen):
    resp = await client.patch(
        f"/users/{target_citizen.id}",
        json={"language": "pt-BR"},
        headers=_auth(admin_user),
    )
    assert resp.status_code == 200
    assert resp.json()["language"] == "pt-BR"


async def test_update_user_unsupported_language_returns_422(
    client: AsyncClient, admin_user, target_citizen
):
    resp = await client.patch(
        f"/users/{target_citizen.id}",
        json={"language": "fr-FR"},
        headers=_auth(admin_user),
    )
    assert resp.status_code == 422
    assert resp.json()["detail"][0]["type"] == "language_unsupported"


async def test_update_user_language_secretary_can_change_another_users_language(
    client: AsyncClient, secretary, target_citizen
):
    """Unlike `role`, `language` has no admin-only gate in update_user — a
    secretary managing a citizen can change it, same as `name`/`is_active`."""
    resp = await client.patch(
        f"/users/{target_citizen.id}",
        json={"language": "pt-BR"},
        headers=_auth(secretary),
    )
    assert resp.status_code == 200
    assert resp.json()["language"] == "pt-BR"


async def test_update_user_own_language_succeeds(client: AsyncClient, admin_user):
    """Self-deactivation is blocked (test_update_user_self_deactivation_returns_400)
    but self-language-change is not — it's a personal preference, not a
    privilege escalation."""
    resp = await client.patch(
        f"/users/{admin_user.id}",
        json={"language": "pt-BR"},
        headers=_auth(admin_user),
    )
    assert resp.status_code == 200
    assert resp.json()["language"] == "pt-BR"


async def test_update_user_language_persists_across_get(
    client: AsyncClient, admin_user, target_citizen
):
    patch_resp = await client.patch(
        f"/users/{target_citizen.id}",
        json={"language": "pt-BR"},
        headers=_auth(admin_user),
    )
    assert patch_resp.status_code == 200

    get_resp = await client.get(f"/users/{target_citizen.id}", headers=_auth(admin_user))
    assert get_resp.status_code == 200
    assert get_resp.json()["language"] == "pt-BR"

    list_resp = await client.get(
        f"/users?q={target_citizen.email}", headers=_auth(admin_user)
    )
    assert list_resp.status_code == 200
    [listed] = [u for u in list_resp.json()["users"] if u["id"] == str(target_citizen.id)]
    assert listed["language"] == "pt-BR"


async def test_update_user_mixed_role_and_language_is_rejected_atomically(
    client: AsyncClient, secretary, target_citizen
):
    """A secretary can change language alone (see above) but not role — a
    mixed body must be rejected wholesale (403, before any assignment), not
    partially applied (language silently changed while role is refused)."""
    resp = await client.patch(
        f"/users/{target_citizen.id}",
        json={"role": "dispatcher", "language": "pt-BR"},
        headers=_auth(secretary),
    )
    assert resp.status_code == 403

    get_resp = await client.get(f"/users/{target_citizen.id}", headers=_auth(secretary))
    assert get_resp.json()["language"] == "en-US"
    assert get_resp.json()["role"] == "citizen"


async def test_update_user_self_deactivation_returns_400(client: AsyncClient, admin_user):
    resp = await client.patch(
        f"/users/{admin_user.id}",
        json={"is_active": False},
        headers=_auth(admin_user),
    )
    assert resp.status_code == 400


async def test_update_user_nonexistent_returns_404(client: AsyncClient, admin_user):
    resp = await client.patch(
        f"/users/{uuid4()}",
        json={"name": "Ghost"},
        headers=_auth(admin_user),
    )
    assert resp.status_code == 404


# ── DELETE /users/{id} ────────────────────────────────────────────────────────

async def test_delete_user_admin_gets_204(client: AsyncClient, admin_user, target_citizen):
    resp = await client.delete(f"/users/{target_citizen.id}", headers=_auth(admin_user))
    assert resp.status_code == 204


async def test_delete_user_sets_deleted_at_and_preserves_is_active(
    client: AsyncClient, admin_user, target_citizen, conftest_session_factory
):
    """Deleting is soft (deleted_at is what excludes a user from login/listing —
    see login()'s and list_users()'s deleted_at filters), so it must not also
    clobber is_active: doing so would destroy the pre-delete value that
    restore needs to bring the user back to the right status."""
    await client.delete(f"/users/{target_citizen.id}", headers=_auth(admin_user))

    from uuid import UUID

    from sqlalchemy import select

    from app.models.user import User
    async with conftest_session_factory() as session:
        result = await session.execute(
            select(User).where(User.id == UUID(str(target_citizen.id)))
        )
        user = result.scalar_one()
    assert user.deleted_at is not None
    assert user.is_active is True  # target_citizen fixture is active before delete


async def test_delete_user_preserves_is_active_false_for_an_already_inactive_user(
    client: AsyncClient, admin_user, target_citizen, conftest_session_factory
):
    await client.patch(
        f"/users/{target_citizen.id}", json={"is_active": False}, headers=_auth(admin_user)
    )
    await client.delete(f"/users/{target_citizen.id}", headers=_auth(admin_user))

    from uuid import UUID

    from sqlalchemy import select

    from app.models.user import User
    async with conftest_session_factory() as session:
        result = await session.execute(
            select(User).where(User.id == UUID(str(target_citizen.id)))
        )
        user = result.scalar_one()
    assert user.is_active is False


async def test_delete_user_citizen_gets_403(client: AsyncClient, citizen, target_citizen):
    resp = await client.delete(f"/users/{target_citizen.id}", headers=_auth(citizen))
    assert resp.status_code == 403


async def test_delete_user_unauthenticated_gets_401(client: AsyncClient, target_citizen):
    resp = await client.delete(f"/users/{target_citizen.id}")
    assert resp.status_code == 401


async def test_delete_user_self_delete_returns_400(client: AsyncClient, admin_user):
    resp = await client.delete(f"/users/{admin_user.id}", headers=_auth(admin_user))
    assert resp.status_code == 400


async def test_delete_user_nonexistent_returns_404(client: AsyncClient, admin_user):
    resp = await client.delete(f"/users/{uuid4()}", headers=_auth(admin_user))
    assert resp.status_code == 404


async def test_delete_user_already_deleted_returns_404(client: AsyncClient, admin_user, target_citizen):
    await client.delete(f"/users/{target_citizen.id}", headers=_auth(admin_user))
    resp = await client.delete(f"/users/{target_citizen.id}", headers=_auth(admin_user))
    assert resp.status_code == 404


# ── POST /users/{id}/restore ──────────────────────────────────────────────────

async def test_restore_user_admin_gets_200(client: AsyncClient, admin_user, target_citizen):
    await client.delete(f"/users/{target_citizen.id}", headers=_auth(admin_user))
    resp = await client.post(f"/users/{target_citizen.id}/restore", headers=_auth(admin_user))
    assert resp.status_code == 200
    data = resp.json()
    assert data["deletedAt"] is None
    assert data["isActive"] is True


async def test_restore_user_preserves_is_active_true_for_a_previously_active_user(
    client: AsyncClient, admin_user, target_citizen, conftest_session_factory
):
    await client.delete(f"/users/{target_citizen.id}", headers=_auth(admin_user))
    await client.post(f"/users/{target_citizen.id}/restore", headers=_auth(admin_user))

    from uuid import UUID

    from sqlalchemy import select

    from app.models.user import User
    async with conftest_session_factory() as session:
        result = await session.execute(
            select(User).where(User.id == UUID(str(target_citizen.id)))
        )
        user = result.scalar_one()
    assert user.deleted_at is None
    assert user.is_active is True


async def test_restore_user_preserves_is_active_false_for_a_previously_inactive_user(
    client: AsyncClient, admin_user, target_citizen, conftest_session_factory
):
    """Regression test: restore must bring back the status the user actually
    had before being deleted, not unconditionally force it active. A user
    disabled on purpose (e.g. offboarded, compromised, policy violation) and
    later deleted must not be silently re-enabled by a restore."""
    await client.patch(
        f"/users/{target_citizen.id}", json={"is_active": False}, headers=_auth(admin_user)
    )
    await client.delete(f"/users/{target_citizen.id}", headers=_auth(admin_user))
    resp = await client.post(f"/users/{target_citizen.id}/restore", headers=_auth(admin_user))

    assert resp.status_code == 200
    assert resp.json()["isActive"] is False

    from uuid import UUID

    from sqlalchemy import select

    from app.models.user import User
    async with conftest_session_factory() as session:
        result = await session.execute(
            select(User).where(User.id == UUID(str(target_citizen.id)))
        )
        user = result.scalar_one()
    assert user.deleted_at is None
    assert user.is_active is False


async def test_restore_non_deleted_user_returns_404(client: AsyncClient, admin_user, target_citizen):
    resp = await client.post(f"/users/{target_citizen.id}/restore", headers=_auth(admin_user))
    assert resp.status_code == 404


async def test_restore_user_citizen_gets_403(client: AsyncClient, citizen, admin_user, target_citizen):
    await client.delete(f"/users/{target_citizen.id}", headers=_auth(admin_user))
    resp = await client.post(f"/users/{target_citizen.id}/restore", headers=_auth(citizen))
    assert resp.status_code == 403


async def test_restore_user_unauthenticated_gets_401(client: AsyncClient, target_citizen):
    resp = await client.post(f"/users/{target_citizen.id}/restore")
    assert resp.status_code == 401


async def test_restore_user_nonexistent_returns_404(client: AsyncClient, admin_user):
    resp = await client.post(f"/users/{uuid4()}/restore", headers=_auth(admin_user))
    assert resp.status_code == 404


# ── POST /users/{id}/reset-password ──────────────────────────────────────────

async def test_reset_password_admin_gets_204(client: AsyncClient, admin_user, target_citizen):
    resp = await client.post(
        f"/users/{target_citizen.id}/reset-password",
        json={"new_password": "NewSecure1!"},
        headers=_auth(admin_user),
    )
    assert resp.status_code == 204


async def test_reset_password_secretary_gets_403(client: AsyncClient, secretary, target_citizen):
    resp = await client.post(
        f"/users/{target_citizen.id}/reset-password",
        json={"new_password": "NewSecure1!"},
        headers=_auth(secretary),
    )
    assert resp.status_code == 403


async def test_reset_password_citizen_gets_403(client: AsyncClient, citizen, target_citizen):
    resp = await client.post(
        f"/users/{target_citizen.id}/reset-password",
        json={"new_password": "NewSecure1!"},
        headers=_auth(citizen),
    )
    assert resp.status_code == 403


async def test_reset_password_unauthenticated_gets_401(client: AsyncClient, target_citizen):
    resp = await client.post(
        f"/users/{target_citizen.id}/reset-password",
        json={"new_password": "NewSecure1!"},
    )
    assert resp.status_code == 401


async def test_reset_password_nonexistent_user_returns_404(client: AsyncClient, admin_user):
    resp = await client.post(
        f"/users/{uuid4()}/reset-password",
        json={"new_password": "NewSecure1!"},
        headers=_auth(admin_user),
    )
    assert resp.status_code == 404


async def test_reset_password_new_password_works_for_login(
    client: AsyncClient, admin_user, target_citizen
):
    new_pwd = "UpdatedPass1!"
    await client.post(
        f"/users/{target_citizen.id}/reset-password",
        json={"new_password": new_pwd},
        headers=_auth(admin_user),
    )
    resp = await client.post(
        "/auth/login",
        json={"email": target_citizen.email, "password": new_pwd},
    )
    assert resp.status_code == 200


async def test_reset_password_weak_password_returns_422(client: AsyncClient, admin_user, target_citizen):
    resp = await client.post(
        f"/users/{target_citizen.id}/reset-password",
        json={"new_password": "weak"},
        headers=_auth(admin_user),
    )
    assert resp.status_code == 422


async def test_reset_password_weak_password_not_leaked_in_error(
    client: AsyncClient, admin_user, target_citizen
):
    resp = await client.post(
        f"/users/{target_citizen.id}/reset-password",
        json={"new_password": "weak"},
        headers=_auth(admin_user),
    )
    assert "weak" not in resp.text
    assert '"input"' not in resp.text


# ── GET /users/me ─────────────────────────────────────────────────────────────

async def test_get_me_returns_capabilities(client: AsyncClient, admin_user):
    resp = await client.get("/users/me", headers=_auth(admin_user))
    assert resp.status_code == 200
    data = resp.json()
    assert "capabilities" in data
    assert data["capabilities"]["permissions"] == ["*"]
    assert "assignableRoles" in data["capabilities"]
    assert "manageableRoles" in data["capabilities"]


async def test_get_me_citizen_returns_limited_permissions(client: AsyncClient, citizen):
    resp = await client.get("/users/me", headers=_auth(citizen))
    assert resp.status_code == 200
    perms = resp.json()["capabilities"]["permissions"]
    assert "user:read" not in perms
    assert "user:create" not in perms


async def test_get_me_does_not_return_hashed_password(client: AsyncClient, admin_user):
    resp = await client.get("/users/me", headers=_auth(admin_user))
    assert "hashed_password" not in resp.text
    assert "password" not in resp.text
