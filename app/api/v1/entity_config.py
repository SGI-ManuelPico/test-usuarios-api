from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import get_db
from app.services.entity_config import EntityConfigService
from app.schemas.entity_config import EntityConfigCreate, EntityConfig as EntityConfigSchema
from uuid import UUID

router = APIRouter()

@router.post("/", response_model=EntityConfigSchema)
async def create_entity_config(
    entity_config: EntityConfigCreate,
    session: AsyncSession = Depends(get_db)
):
    service = EntityConfigService(session)
    return await service.create(entity_config)

@router.get("/{empresa_id}/{entity_type}", response_model=EntityConfigSchema)
async def get_entity_config(
    empresa_id: UUID,
    entity_type: str,
    session: AsyncSession = Depends(get_db)
):
    service = EntityConfigService(session)
    config = await service.get_config(empresa_id, entity_type)
    if not config:
        raise HTTPException(status_code=404, detail="Configuración no encontrada")
    return config