from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class PlanGenerateRequest(BaseModel):
    days: int = 7
    is_group: bool = False
    group_id: UUID | None = None


class MealPlanOut(BaseModel):
    id: UUID
    user_id: UUID | None = None
    group_id: UUID | None = None
    plan_data: dict
    days: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
