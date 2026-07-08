import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class MealPlan(Base):
    __tablename__ = "meal_plans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),
                                          primary_key=True,
                                          default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True),
                                                      ForeignKey("users.id"),
                                                      nullable=True)
    group_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True),
                                                       ForeignKey("groups.id"),
                                                       nullable=True)

    plan_data: Mapped[dict] = mapped_column(JSONB,
                                            default=dict)
    days: Mapped[int] = mapped_column(default=7)
    status: Mapped[str] = mapped_column(String,
                                        default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime,
                                                 default=datetime.utcnow)

    user = relationship("User",
                        back_populates="meal_plans",
                        foreign_keys=[user_id])
    group = relationship("Group",
                         back_populates="meal_plans",
                         foreign_keys=[group_id])
