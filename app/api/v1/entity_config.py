from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import get_db
from app.services.entity_config import EntityConfigService
from app.schemas.entity_config import EntityConfigCreate, EntityConfigUpdate, EntityConfig as EntityConfigSchema
from app.core.validation_registry import ValidationRegistry
from uuid import UUID
from typing import Dict, Any

router = APIRouter()

@router.get("/validations", response_model=Dict[str, Dict[str, Any]])
async def get_validations():
    return ValidationRegistry.get_all_metadata()

@router.post("/", response_model=EntityConfigSchema)
async def create_entity_config(
    entity_config: EntityConfigCreate,
    session: AsyncSession = Depends(get_db)
):
    service = EntityConfigService(session)
    return await service.create(entity_config)

@router.put("/{config_id}", response_model=EntityConfigSchema)
async def update_entity_config(
    config_id: int,
    entity_config: EntityConfigUpdate,
    session: AsyncSession = Depends(get_db)
):
    service = EntityConfigService(session)
    config = await service.update(config_id, entity_config)
    if not config:
        raise HTTPException(status_code=404, detail="Configuración no encontrada")
    return config

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