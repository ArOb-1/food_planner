import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),
                                          primary_key=True,
                                          default=uuid.uuid4)
    name: Mapped[str | None] = mapped_column(String, nullable=True)
    email: Mapped[str] = mapped_column(String,
                                       unique=True,
                                       nullable=False,
                                       index=True)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    allergies: Mapped[list] = mapped_column(JSON, default=list)
    hated_products: Mapped[list] = mapped_column(JSON, default=list)
    disliked_products: Mapped[list] = mapped_column(JSON, default=list)
    liked_products: Mapped[list] = mapped_column(JSON, default=list)
    location: Mapped[str | None] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime,
                                                 default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime,
                                                 default=datetime.utcnow,
                                                 onupdate=datetime.utcnow)

    owned_groups = relationship("Group", back_populates="owner")
    meal_plans = relationship("MealPlan", back_populates="user",
                              foreign_keys="MealPlan.user_id")
