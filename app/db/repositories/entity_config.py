from sqlalchemy import select
from app.models.entity_config import EntityConfig
from app.schemas.entity_config import EntityConfigCreate
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

class EntityConfigRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, data: EntityConfigCreate) -> EntityConfig:
        new_entity_config = EntityConfig(
            empresa_id=data.empresa_id,
            entity_type=data.entity_type,
            config=data.config.model_dump()
        )
        
        self.session.add(new_entity_config)
        await self.session.commit()
        await self.session.refresh(new_entity_config)
        
        return new_entity_config

    async def get_by_empresa_and_entity(self, empresa_id: UUID, entity_type: str) -> EntityConfig | None:
        query = select(EntityConfig).where(
            EntityConfig.empresa_id == empresa_id,
            EntityConfig.entity_type == entity_type
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
