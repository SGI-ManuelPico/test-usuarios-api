from fastapi import APIRouter
from app.api.v1 import usuario, empresa, entity_config

router = APIRouter()

router.include_router(usuario.router, prefix="/usuarios", tags=["Usuarios"])
router.include_router(empresa.router, prefix="/empresas", tags=["Empresas"])
router.include_router(entity_config.router, prefix="/entity-config", tags=["Entity Config"])
