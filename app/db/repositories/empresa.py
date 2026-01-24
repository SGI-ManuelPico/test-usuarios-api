from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.empresa import Empresa
from app.schemas.empresa import EmpresaCreate

class EmpresaRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, data: EmpresaCreate) -> Empresa:
        new_empresa = Empresa(
            nombre=data.nombre,
            nit=data.nit,
            custom_data=data.custom_data
        )
        
        self.session.add(new_empresa)
        await self.session.commit()
        await self.session.refresh(new_empresa)
        
        return new_empresa

    async def get_by_id(self, empresa_id: str) -> Empresa | None:
        query = select(Empresa).where(Empresa.id == empresa_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()