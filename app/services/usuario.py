from app.db.repositories.usuario import UsuarioRepository
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate
from app.models.usuario import Usuario
from sqlalchemy.ext.asyncio import AsyncSession

class UsuarioService:
    def __init__(self, session: AsyncSession):
        self.repository = UsuarioRepository(session)

    async def create_with_config(self, data: UsuarioCreate) -> Usuario:
        return await self.repository.create_with_config(data)

    async def get_by_id(self, usuario_id: str) -> Usuario | None:
        return await self.repository.get_by_id(usuario_id)

    async def update(self, usuario_id: str, data: UsuarioUpdate) -> Usuario | None:
        return await self.repository.update(usuario_id, data)

    async def get_all(self, skip: int = 0, limit: int = 100, empresa_id: str | None = None) -> list[Usuario]:
        return await self.repository.get_all(skip=skip, limit=limit, empresa_id=empresa_id)