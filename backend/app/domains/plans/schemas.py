from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class PlanGenerateRequest(BaseModel):
    model_config = {"extra": "forbid"}

    days: int = 7
    is_group: bool = False
    group_id: UUID | None = None
    cooking_time: int | None = None
    meals: list[str] = ["breakfast", "lunch", "dinner"]
    available_products: str | None = None
    cuisine: str | None = None
    correction_prompt: str | None = None


class MealPlanOut(BaseModel):
    id: UUID
    user_id: UUID | None = None
    group_id: UUID | None = None
    plan_data: dict
    days: int
    status: str
    cooking_time: int | None = None
    meals: list[str] = []
    available_products: str | None = None
    cuisine: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
