from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings


sync_engine = create_engine(
    settings.DATABASE_URL.replace("+asyncpg", "").replace("postgresql://", "postgresql://")
)
SyncSessionLocal = sessionmaker(sync_engine, class_=Session, expire_on_commit=False)
engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG)

async_session = async_sessionmaker(engine,
                                   class_=AsyncSession,
                                   expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    try:
        async with async_session() as session:
            yield session
    finally:
        await session.close()
