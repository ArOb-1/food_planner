import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Group(Base):
    __tablename__ = "groups"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),
                                          primary_key=True,
                                          default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String,
                                      nullable=False)
    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),
                                                ForeignKey("users.id"),
                                                nullable=False)
    member_ids: Mapped[list] = mapped_column(JSONB,
                                             default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime,
                                                 default=datetime.utcnow)

    owner = relationship("User",
                         back_populates="owned_groups")
    meal_plans = relationship("MealPlan",
                              back_populates="group",
                              foreign_keys="MealPlan.group_id")
