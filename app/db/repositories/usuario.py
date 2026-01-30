from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.usuario import Usuario
from app.models.entity_config import EntityConfig
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate
from app.utils.dynamic_validator import validate_custom_data
from pydantic import ValidationError
from fastapi import HTTPException

class UsuarioRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_with_config(self, data: UsuarioCreate) -> Usuario:
        # 1. Buscar la configuración de entidades para este tipo (usuario) y empresa
        query = select(EntityConfig).where(
            EntityConfig.empresa_id == data.empresa_id,
            EntityConfig.entity_type == "usuario"
        )
        result = await self.session.execute(query)
        entity_config = result.scalar_one_or_none()

        # 2. Si existe configuración, validar custom_data
        if entity_config:
            try:
                validate_custom_data(data.custom_data, entity_config.config)
            except ValidationError as e:
                errors = []
                for err in e.errors():
                    err_copy = err.copy()
                    if "ctx" in err_copy:
                        del err_copy["ctx"]
                    if "url" in err_copy:
                        del err_copy["url"]
                    errors.append(err_copy)
                raise HTTPException(
                    status_code=400, 
                    detail={"message": "Error de validación dinámica", "errors": errors}
                )

        # 3. Crear el usuario
        new_user = Usuario(**data.model_dump())
        
        self.session.add(new_user)
        await self.session.commit()
        await self.session.refresh(new_user)
        
        return new_user

    async def get_by_id(self, usuario_id: str) -> Usuario | None:
        query = select(Usuario).where(Usuario.id == usuario_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def update(self, usuario_id: str, data: UsuarioUpdate) -> Usuario | None:
        # 1. Obtener el usuario
        usuario = await self.get_by_id(usuario_id)
        if not usuario:
            return None

        update_data = data.model_dump(exclude_unset=True)

        # 2. Si se está actualizando custom_data, validar con la configuración
        if "custom_data" in update_data:
            # Buscar la configuración de entidades
            query = select(EntityConfig).where(
                EntityConfig.empresa_id == usuario.empresa_id,
                EntityConfig.entity_type == "usuario"
            )
            result = await self.session.execute(query)
            entity_config = result.scalar_one_or_none()

            if entity_config:
                try:
                    validate_custom_data(update_data["custom_data"], entity_config.config)
                except ValidationError as e:
                    errors = []
                    for err in e.errors():
                        err_copy = err.copy()
                        if "ctx" in err_copy:
                            del err_copy["ctx"]
                        if "url" in err_copy:
                            del err_copy["url"]
                        errors.append(err_copy)
                    raise HTTPException(
                        status_code=400, 
                        detail={"message": "Error de validación dinámica en actualización", "errors": errors}
                    )

        # 3. Aplicar cambios
        for key, value in update_data.items():
            setattr(usuario, key, value)

        await self.session.commit()
        await self.session.refresh(usuario)
        return usuario

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[Usuario]:
        query = select(Usuario).offset(skip).limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())
