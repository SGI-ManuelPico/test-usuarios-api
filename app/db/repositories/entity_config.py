from app.models.entity_config import EntityConfig
from app.schemas.entity_config import EntityConfigCreate
from sqlalchemy.ext.asyncio import AsyncSession

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
