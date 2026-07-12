import pytest
from httpx import AsyncClient
from datetime import datetime, timedelta, UTC
from jose import jwt
from app.core.config import settings


@pytest.mark.asyncio
async def test_get_me_unauthorized(client: AsyncClient):
    response = await client.get('/api/v1/users/me')
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_get_me_authorized(registered_user, client: AsyncClient):
    headers = {"Authorization": f"Bearer {registered_user['access_token']}"}
    response = await client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == registered_user["email"]
    assert data["allergies"] == []
    assert data["liked_products"] == []
    assert data["hated_products"] == []
    assert data["disliked_products"] == []
    assert data["location"] is None


@pytest.mark.asyncio
async def test_update_profile_full(registered_user, client: AsyncClient):
    headers = {"Authorization": f"Bearer {registered_user['access_token']}"}
    response = await client.put("/api/v1/users/me/profile",
                                headers=headers,
                                json={
                                    "allergies": ["орехи", "молоко"],
                                    "liked_products": ["курица", "рис"],
                                    "hated_products": ["рыба"],
                                    "disliked_products": ["брокколи"],
                                    "location": "Москва",
                                })
    assert response.status_code == 200
    data = response.json()
    assert data["allergies"] == ["орехи", "молоко"]
    assert data["liked_products"] == ["курица", "рис"]
    assert data["hated_products"] == ["рыба"]
    assert data["disliked_products"] == ["брокколи"]
    assert data["location"] == "Москва"


@pytest.mark.asyncio
async def test_update_profile_partial(registered_user, client: AsyncClient):
    headers = {"Authorization": f"Bearer {registered_user['access_token']}"}

    await client.put("/api/v1/users/me/profile", headers=headers, json={
        "allergies": ["орехи"],
        "liked_products": ["курица"],
        "hated_products": ["рыба"],
        "location": "Москва",
    })

    response = await client.put("/api/v1/users/me/profile",
                                headers=headers,
                                json={
                                    "allergies": ["молоко"],
                                })
    assert response.status_code == 200
    data = response.json()
    assert data["allergies"] == ["молоко"]
    assert data["liked_products"] == ["курица"]
    assert data["hated_products"] == ["рыба"]
    assert data["location"] == "Москва"


@pytest.mark.asyncio
async def test_update_profile_unauthorized(client: AsyncClient):
    response = await client.put("/api/v1/users/me/profile", json={
        "allergies": ["орехи"],
    })
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_update_profile_empty_body(registered_user, client: AsyncClient):
    headers = {"Authorization": f"Bearer {registered_user['access_token']}"}
    response = await client.put("/api/v1/users/me/profile",
                                headers=headers,
                                json={})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == registered_user["email"]


@pytest.mark.asyncio
async def test_update_profile_invalid_data(registered_user,
                                           client: AsyncClient):
    headers = {"Authorization": f"Bearer {registered_user['access_token']}"}
    response = await client.put("/api/v1/users/me/profile",
                                headers=headers,
                                json={
                                    "allergies": "не_список_а_строка",
                                })
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_update_profile_invalid_token(client: AsyncClient):
    headers = {"Authorization": "Bearer garbage_token"}
    response = await client.put("/api/v1/users/me/profile",
                                headers=headers,
                                json={
                                    "allergies": ["орехи"],
                                })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_update_profile_expired_token(registered_user,
                                            client: AsyncClient):
    payload = jwt.decode(
        registered_user["access_token"],
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )
    expire = datetime.now(UTC) - timedelta(minutes=1)
    expired_payload = {"sub": payload["sub"], "exp": expire, "type": "access"}
    expired_token = jwt.encode(expired_payload,
                               settings.JWT_SECRET_KEY,
                               algorithm=settings.JWT_ALGORITHM)

    headers = {"Authorization": f"Bearer {expired_token}"}
    response = await client.put("/api/v1/users/me/profile",
                                headers=headers,
                                json={
                                    "allergies": ["орехи"],
                                })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_update_profile_allergies_not_a_list(registered_user,
                                                   client: AsyncClient):
    headers = {"Authorization": f"Bearer {registered_user['access_token']}"}
    response = await client.put("/api/v1/users/me/profile",
                                headers=headers,
                                json={
                                    "allergies": "орехи",
                                })
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_update_profile_unknown_field(registered_user,
                                            client: AsyncClient):
    headers = {"Authorization": f"Bearer {registered_user['access_token']}"}
    response = await client.put("/api/v1/users/me/profile",
                                headers=headers,
                                json={
                                    "some_unknown_field": "value",
                                })
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_update_profile_overwrite(registered_user, client: AsyncClient):
    headers = {"Authorization": f"Bearer {registered_user['access_token']}"}

    await client.put("/api/v1/users/me/profile", headers=headers, json={
        "allergies": ["орехи"],
    })
    await client.put("/api/v1/users/me/profile", headers=headers, json={
        "allergies": ["молоко"],
    })

    response = await client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["allergies"] == ["молоко"]
