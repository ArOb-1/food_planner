import asyncio
import uuid
import warnings
import pytest_asyncio

from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import (
    create_async_engine, async_sessionmaker, AsyncSession
)
from app.core.database import get_db, Base
from app.main import app


warnings.filterwarnings("ignore", category=DeprecationWarning)

TEST_DATABASE_URL = 'sqlite+aiosqlite:///./test.db'

test_engine = create_async_engine(TEST_DATABASE_URL)
TestSessionLocal = async_sessionmaker(test_engine,
                                      class_=AsyncSession,
                                      expire_on_commit=False)


async def override_get_db():
    async with TestSessionLocal() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture(scope='function')
async def client():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport,
                           base_url="http://test") as client:
        yield client

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await asyncio.sleep(0.1)


@pytest_asyncio.fixture(scope='function')
async def registered_user(client: AsyncClient):
    email = f'test_{uuid.uuid4().hex[:8]}@test.com'
    password = '94719478194'
    response = await client.post(
        "/api/v1/auth/register", json={
                                    "email": email,
                                    "password": password,
                                      })
    return {
        'access_token': response.json()['access_token'],
        'refresh_token': response.json()['refresh_token'],
        'email': email,
        'password': password
    }
