from sqlalchemy import select
from app.models.entity_config import EntityConfig
from app.schemas.entity_config import EntityConfigCreate, EntityConfigUpdate
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

    async def update(self, config_id: int, data: EntityConfigUpdate) -> EntityConfig | None:
        query = select(EntityConfig).where(EntityConfig.id == config_id)
        result = await self.session.execute(query)
        config = result.scalar_one_or_none()
        
        if not config:
            return None
            
        update_data = data.model_dump(exclude_unset=True)
        if "config" in update_data and update_data["config"]:
            config.config = update_data["config"].model_dump() if hasattr(update_data["config"], "model_dump") else update_data["config"]
            
        if "entity_type" in update_data:
            config.entity_type = update_data["entity_type"]
            
        await self.session.commit()
        await self.session.refresh(config)
        return config

    async def get_by_empresa_and_entity(self, empresa_id: UUID, entity_type: str) -> EntityConfig | None:
        query = select(EntityConfig).where(
            EntityConfig.empresa_id == empresa_id,
            EntityConfig.entity_type == entity_type
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
