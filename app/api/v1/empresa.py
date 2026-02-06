from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import get_db
from app.services.empresa import EmpresaService
from app.schemas.empresa import EmpresaCreate, Empresa
from typing import List

router = APIRouter()

@router.get("/", response_model=List[Empresa])
async def list_empresas(
    session: AsyncSession = Depends(get_db)
):
    service = EmpresaService(session)
    return await service.list_all()

@router.post("/", response_model=Empresa)
async def create_empresa(
    empresa: EmpresaCreate,
    session: AsyncSession = Depends(get_db)
):
    service = EmpresaService(session)
    return await service.create(empresa)