from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.entity_config import EntityConfigCreate
from app.db.repositories.entity_config import EntityConfigRepository
from app.models.entity_config import EntityConfig

class EntityConfigService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = EntityConfigRepository(session)

    async def create(self, data: EntityConfigCreate) -> EntityConfig:
        return await self.repository.create(data)