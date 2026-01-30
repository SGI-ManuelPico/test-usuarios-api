from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import get_db
from app.services.usuario import UsuarioService
from app.schemas.usuario import UsuarioCreate, Usuario, UsuarioUpdate
from uuid import UUID

router = APIRouter()

@router.post("/", response_model=Usuario)
async def create_usuario(
    usuario: UsuarioCreate,
    session: AsyncSession = Depends(get_db)
):
    service = UsuarioService(session)
    return await service.create_with_config(usuario)

@router.put("/{usuario_id}", response_model=Usuario)
async def update_usuario(
    usuario_id: UUID,
    usuario_data: UsuarioUpdate,
    session: AsyncSession = Depends(get_db)
):
    service = UsuarioService(session)
    updated_user = await service.update(str(usuario_id), usuario_data)
    if not updated_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return updated_user

@router.get("/", response_model=list[Usuario])
async def list_usuarios(
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_db)
):
    service = UsuarioService(session)
    return await service.get_all(skip=skip, limit=limit)

@router.get("/{usuario_id}", response_model=Usuario)
async def get_usuario(
    usuario_id: UUID,
    session: AsyncSession = Depends(get_db)
):
    service = UsuarioService(session)
    user = await service.get_by_id(str(usuario_id))
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user