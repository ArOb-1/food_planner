from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class GroupCreate(BaseModel):
    name: str
    member_ids: list[UUID] = []


class GroupAddMember(BaseModel):
    user_id: UUID


class GroupOut(BaseModel):
    id: UUID
    name: str
    owner_id: UUID
    member_ids: list[UUID]
    created_at: datetime

    class Config:
        from_attributes = True


class GroupProfileOut(BaseModel):
    forbidden: list[str]
    priority: list[str]
    neutral: list[str]
