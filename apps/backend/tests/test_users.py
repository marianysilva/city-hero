import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import UserRole
from app.core.security import create_access_token, hash_password
from app.models.city import City
from app.models.user import User

pytestmark = pytest.mark.asyncio(loop_scope="session")


async def _make_city(db: AsyncSession, name: str = "Testville") -> City:
    city = City(name=name, state="SP", country="BR")
    db.add(city)
    await db.commit()
    await db.refresh(city)
    return city


async def _make_user(
    db: AsyncSession,
    *,
    email: str,
    role: UserRole = UserRole.CITIZEN,
    city_id: uuid.UUID | None = None,
    is_active: bool = True,
) -> User:
    user = User(
        email=email,
        name=email.split("@")[0],
        hashed_password=hash_password("securepassword123"),
        role=role,
        city_id=city_id,
        is_active=is_active,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


def _auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def test_citizen_cannot_get_other_user(client: AsyncClient, db: AsyncSession):
    citizen = await _make_user(db, email="citizen@example.com")
    target = await _make_user(db, email="target@example.com")
    token = create_access_token(citizen.id)

    response = await client.get(f"/users/{target.id}", headers=_auth(token))
    assert response.status_code == 403


async def test_manager_same_city_can_get_user(client: AsyncClient, db: AsyncSession):
    city = await _make_city(db, "City A")
    manager = await _make_user(
        db, email="mgr-a@example.com", role=UserRole.MANAGER, city_id=city.id
    )
    target = await _make_user(db, email="target-a@example.com", city_id=city.id)
    token = create_access_token(manager.id)

    response = await client.get(f"/users/{target.id}", headers=_auth(token))
    assert response.status_code == 200
    assert response.json()["email"] == "target-a@example.com"


async def test_manager_cross_tenant_isolation(client: AsyncClient, db: AsyncSession):
    city_a = await _make_city(db, "City A")
    city_b = await _make_city(db, "City B")
    manager = await _make_user(
        db, email="mgr-cross@example.com", role=UserRole.MANAGER, city_id=city_a.id
    )
    target = await _make_user(db, email="target-b@example.com", city_id=city_b.id)
    token = create_access_token(manager.id)

    response = await client.get(f"/users/{target.id}", headers=_auth(token))
    assert response.status_code == 404


async def test_admin_can_get_any_user(client: AsyncClient, db: AsyncSession):
    city = await _make_city(db, "Some City")
    admin = await _make_user(db, email="admin@example.com", role=UserRole.ADMIN)
    target = await _make_user(db, email="target-admin@example.com", city_id=city.id)
    token = create_access_token(admin.id)

    response = await client.get(f"/users/{target.id}", headers=_auth(token))
    assert response.status_code == 200


async def test_manager_without_city_forbidden(client: AsyncClient, db: AsyncSession):
    manager = await _make_user(
        db, email="mgr-nocity@example.com", role=UserRole.MANAGER, city_id=None
    )
    target = await _make_user(db, email="target-nocity@example.com")
    token = create_access_token(manager.id)

    response = await client.get(f"/users/{target.id}", headers=_auth(token))
    assert response.status_code == 403


async def test_inactive_user_cannot_login(client: AsyncClient, db: AsyncSession):
    await _make_user(db, email="inactive@example.com", is_active=False)

    response = await client.post(
        "/auth/login",
        json={"email": "inactive@example.com", "password": "securepassword123"},
    )
    assert response.status_code == 401


async def test_token_rejected_after_deactivation(client: AsyncClient, db: AsyncSession):
    user = await _make_user(db, email="deactivate@example.com")
    token = create_access_token(user.id)

    ok = await client.get("/users/me", headers=_auth(token))
    assert ok.status_code == 200

    user.is_active = False
    db.add(user)
    await db.commit()

    blocked = await client.get("/users/me", headers=_auth(token))
    assert blocked.status_code == 401
