from app.db.repositories.empresa import EmpresaRepository
from app.schemas.empresa import EmpresaCreate
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.empresa import Empresa
from typing import List


class EmpresaService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, data: EmpresaCreate) -> Empresa:
        repository = EmpresaRepository(self.session)
        return await repository.create(data)

    async def get_by_id(self, empresa_id: str) -> Empresa | None:
        repository = EmpresaRepository(self.session)
        return await repository.get_by_id(empresa_id)

    async def list_all(self) -> List[Empresa]:
        repository = EmpresaRepository(self.session)
        return await repository.list_all()
