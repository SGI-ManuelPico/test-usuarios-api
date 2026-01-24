from typing import Optional, Any, Dict
from pydantic import BaseModel, ConfigDict
from uuid import UUID

class EmpresaBase(BaseModel):
    nombre: str
    nit: str
    custom_data: Dict[str, Any] = {}

class EmpresaCreate(EmpresaBase):
    pass

class EmpresaUpdate(BaseModel):
    nombre: Optional[str] = None
    nit: Optional[str] = None
    custom_data: Optional[Dict[str, Any]] = None

class Empresa(EmpresaBase):
    id: UUID
    
    model_config = ConfigDict(from_attributes=True)
