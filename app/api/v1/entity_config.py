from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import get_db
from app.services.entity_config import EntityConfigService
from app.schemas.entity_config import EntityConfigCreate, EntityConfig as EntityConfigSchema

router = APIRouter()

@router.post("/", response_model=EntityConfigSchema)
async def create_entity_config(
    entity_config: EntityConfigCreate,
    session: AsyncSession = Depends(get_db)
):
    service = EntityConfigService(session)
    return await service.create(entity_config)