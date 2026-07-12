import pytest

from datetime import UTC, datetime, timedelta
from jose import jwt
from httpx import AsyncClient

from app.core.config import settings


PREFIX = '/api/v1/auth/'


# ТЕСТ REGISTER
@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    response = await client.post(PREFIX + 'register', json={
        "email": "test@test.com",
        "password": "123456789",
    })
    assert response.status_code == 201
    data = response.json()
    assert 'access_token' in data
    assert 'refresh_token' in data
    assert data['token_type'] == 'bearer'


@pytest.mark.asyncio
async def test_register_missing_password(client: AsyncClient):
    response = await client.post("/api/v1/auth/register", json={
        "email": "test@test.com",
    })
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_unique_email(client: AsyncClient):
    await client.post(PREFIX + 'register', json={
        "email": "test@test.com",
        "password": "123456789",
    })
    response = await client.post(PREFIX + 'register', json={
        "email": "test@test.com",
        "password": "1827391919",
    })
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_invalid_email_register(client: AsyncClient):
    response = await client.post(
        PREFIX + 'register',
        json={
            'email': 'iii.iek',
            'password': '123123123'
        }
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_empty_body_register(client: AsyncClient):
    response = await client.post(
        PREFIX + 'register',
        json={}
    )
    assert response.status_code == 422


# ТЕСТ LOGIN
@pytest.mark.asyncio
async def test_login_success(registered_user, client: AsyncClient):
    response = await client.post(
        PREFIX + 'login', json={
            'email': registered_user['email'],
            'password': registered_user['password'],
        }
    )
    assert response.status_code == 200
    assert 'access_token' in response.json()


@pytest.mark.asyncio
async def test_login_wrong_password(registered_user, client: AsyncClient):
    response = await client.post(
        PREFIX + 'login', json={
            'email': registered_user['email'],
            'password': '1111111111'
        }
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistence_user(registered_user, client: AsyncClient):
    response = await client.post(
        PREFIX + 'login', json={
            'email': 'test_email@ya.com',
            'password': '111111111'
        }
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_empty_body(client: AsyncClient):
    response = await client.post(
        PREFIX + 'login',
        json={}
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_invalid_email_login(client: AsyncClient):
    response = await client.post(
        PREFIX + 'login',
        json={
            'email': 'iii.iek',
            'password': '123123123'
        }
    )
    assert response.status_code == 422


# ТОКЕНЫ
@pytest.mark.asyncio
async def test_access_token_works(registered_user, client: AsyncClient):
    headers = {"Authorization": f"Bearer {registered_user['access_token']}"}
    response = await client.get('/api/v1/users/me', headers=headers)
    assert response.status_code == 200
    assert response.json()['email'] == registered_user['email']


@pytest.mark.asyncio
async def test_expired_token(registered_user, client: AsyncClient):
    payload = jwt.decode(
        registered_user["access_token"],
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )
    user_id = payload["sub"]

    expire = datetime.now(UTC) - timedelta(minutes=1)
    expired_payload = {"sub": user_id, "exp": expire, "type": "access"}
    expired_token = jwt.encode(expired_payload,
                               settings.JWT_SECRET_KEY,
                               algorithm=settings.JWT_ALGORITHM)

    headers = {"Authorization": f"Bearer {expired_token}"}
    response = await client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_malformed_token(client: AsyncClient):
    headers = {"Authorization": "Bearer some_garbage_123"}
    response = await client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_no_token(client: AsyncClient):
    response = await client.get("/api/v1/users/me")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_token_without_bearer(client: AsyncClient):
    headers = {"Authorization": "some_token_without_bearer_prefix"}
    response = await client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 403
