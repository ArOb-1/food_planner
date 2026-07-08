from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime


class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    is_active: bool
    allergies: list[str]
    hated_products: list[str]
    disliked_products: list[str]
    liked_products: list[str]
    location: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    allergies: list[str] | None = None
    liked_products: list[str] | None = None
    disliked_products: list[str] | None = None
    hated_products: list[str] | None = None
    location: str | None = None
