import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio(loop_scope="session")


async def test_register_success(client: AsyncClient):
    response = await client.post("/auth/register", json={
        "email": "test@example.com",
        "name": "Test User",
        "password": "securepassword123",
    })
    assert response.status_code == 201
    data = response.json()
    assert "accessToken" in data
    assert data["user"]["email"] == "test@example.com"


async def test_register_duplicate_email(client: AsyncClient):
    payload = {
        "email": "dup@example.com",
        "name": "User",
        "password": "securepassword123",
    }
    await client.post("/auth/register", json=payload)
    response = await client.post("/auth/register", json=payload)
    assert response.status_code == 409


async def test_register_weak_password(client: AsyncClient):
    response = await client.post("/auth/register", json={
        "email": "weak@example.com",
        "name": "User",
        "password": "123",
    })
    assert response.status_code == 422


async def test_login_success(client: AsyncClient):
    await client.post("/auth/register", json={
        "email": "login@example.com",
        "name": "Login User",
        "password": "securepassword123",
    })
    response = await client.post("/auth/login", json={
        "email": "login@example.com",
        "password": "securepassword123",
    })
    assert response.status_code == 200
    assert "accessToken" in response.json()


async def test_login_invalid_password(client: AsyncClient):
    await client.post("/auth/register", json={
        "email": "loginbad@example.com",
        "name": "User",
        "password": "securepassword123",
    })
    response = await client.post("/auth/login", json={
        "email": "loginbad@example.com",
        "password": "wrongpassword",
    })
    assert response.status_code == 401


async def test_login_nonexistent_email(client: AsyncClient):
    response = await client.post("/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "securepassword123",
    })
    assert response.status_code == 401


async def test_get_me_authenticated(client: AsyncClient):
    reg = await client.post("/auth/register", json={
        "email": "me@example.com",
        "name": "Me User",
        "password": "securepassword123",
    })
    token = reg.json()["accessToken"]

    response = await client.get("/users/me", headers={
        "Authorization": f"Bearer {token}",
    })
    assert response.status_code == 200
    assert response.json()["email"] == "me@example.com"


async def test_get_me_unauthenticated(client: AsyncClient):
    response = await client.get("/users/me")
    assert response.status_code == 401
