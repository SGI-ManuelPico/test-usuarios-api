from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.entity_config import EntityConfigCreate
from app.db.repositories.entity_config import EntityConfigRepository
from app.models.entity_config import EntityConfig
from uuid import UUID

class EntityConfigService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = EntityConfigRepository(session)

    async def create(self, data: EntityConfigCreate) -> EntityConfig:
        return await self.repository.create(data)

    async def get_config(self, empresa_id: UUID, entity_type: str) -> EntityConfig | None:
        return await self.repository.get_by_empresa_and_entity(empresa_id, entity_type)