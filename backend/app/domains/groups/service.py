from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, cast, String
from fastapi import HTTPException, status
from app.domains.groups.models import Group
from app.domains.groups.schemas import GroupCreate, GroupProfileOut
from app.domains.users.models import User


class GroupsService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_group(self, owner_id: UUID, data: GroupCreate):
        member_ids = data.member_ids.copy()
        if owner_id not in member_ids:
            member_ids.append(owner_id)

        member_ids_str = [str(m) for m in member_ids]

        group = Group(name=data.name,
                      owner_id=owner_id,
                      member_ids=member_ids_str)
        self.session.add(group)
        await self.session.commit()
        await self.session.refresh(group)
        return group

    async def get_my_groups(self, user_id: UUID) -> list[Group]:
        result = await self.session.execute(
            select(Group).where(
                cast(Group.member_ids, String).like(f'%"{user_id}"%')
            )
        )
        return list(result.scalars().all())

    async def get_group(self, group_id: UUID) -> Group:
        result = await self.session.execute(select(Group).where(Group.id == group_id))
        group = result.scalar_one_or_none()
        if not group:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail="Group not found")
        return group

    async def add_member(self, group_id: UUID, user_id: UUID) -> Group:
        group = await self.get_group(group_id)
        if str(user_id) not in [str(m) for m in group.member_ids]:
            group.member_ids = list(group.member_ids) + [str(user_id)]
            await self.session.commit()
            await self.session.refresh(group)
        return group

    async def remove_member(self, group_id: UUID, user_id: UUID, removed_by: UUID) -> Group:
        group = await self.get_group(group_id)

        if len(group.member_ids) <= 1:
            raise HTTPException(status_code=400, detail="Нельзя удалить последнего участника")

        if str(removed_by) != str(group.owner_id) and str(removed_by) != str(user_id):
            raise HTTPException(status_code=403, detail="Нет прав на удаление")

        group.member_ids = [m for m in group.member_ids if str(m) != str(user_id)]
        await self.session.commit()
        await self.session.refresh(group)
        return group

    async def get_group_profile(self, group_id: UUID):
        group = await self.get_group(group_id)

        result = await self.session.execute(
            select(User).where(User.id.in_([UUID(m) for m in group.member_ids]))
        )
        members = result.scalars().all()

        forbidden = set()
        priority = set()
        all_liked = []

        for m in members:
            forbidden.update(m.allergies)
            forbidden.update(m.hated_products)
            all_liked.extend(m.liked_products)

        from collections import Counter
        liked_counts = Counter(all_liked)
        threshold = len(members) // 2 + 1
        priority = {p for p, c in liked_counts.items() if c >= threshold}

        priority = priority - forbidden

        return GroupProfileOut(
            forbidden=list(forbidden),
            priority=list(priority),
            neutral=[],
        )

    async def delete_group(self, group_id: UUID, user_id: UUID) -> None:
        group = await self.get_group(group_id)
        if group.owner_id != user_id:
            raise HTTPException(status_code=403, detail="Только владелец может удалить группу")
        await self.session.delete(group)
        await self.session.commit()
