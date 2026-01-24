from typing import Optional, Any, Dict
from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from uuid import UUID
from datetime import datetime
from app.utils.security import hash_password

class UsuarioBase(BaseModel):
    email: EmailStr
    nombre: str
    custom_data: Dict[str, Any] = {}

class UsuarioCreate(UsuarioBase):
    password: str
    empresa_id: UUID

    @field_validator("password")
    @classmethod
    def hash_raw_password(cls, v: str) -> str:
        return hash_password(v)

class UsuarioUpdate(BaseModel):
    email: Optional[EmailStr] = None
    custom_data: Optional[Dict[str, Any]] = None
    nombre: Optional[str] = None
    password: Optional[str] = None

    @field_validator("password")
    @classmethod
    def hash_raw_password(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return hash_password(v)
        return v

class Usuario(UsuarioBase):
    id: UUID
    empresa_id: UUID
    creado_en: datetime
    modificado_en: datetime
    estado: int
    
    model_config = ConfigDict(from_attributes=True)
