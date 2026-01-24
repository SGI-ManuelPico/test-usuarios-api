from enum import Enum
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Union, Dict, Any
from uuid import UUID

class FieldTypeEnum(str, Enum):
    STRING = "string"
    INTEGER = "integer"
    BOOLEAN = "boolean"
    SELECT = "select"

class FieldOption(BaseModel):
    label: str
    value: Union[str, int]

class FieldDefinition(BaseModel):
    name: str = Field(..., description="La clave del JSON (ej: 'talla_camisa')")
    label: str = Field(..., description="Nombre visible para el humano")
    type: FieldTypeEnum
    required: bool = False
    options: Optional[List[FieldOption]] = None # Solo en caso de select
    regex: Optional[str] = None # Para validaciones avanzadas

class ConfigSchema(BaseModel):
    fields: List[FieldDefinition]

class EntityConfigBase(BaseModel):
    name: Optional[str] = None # Aunque en DB se quitó, a veces es util metadata, pero seguimos el modelo DB
    entity_type: str
    config: ConfigSchema 

class EntityConfigCreate(EntityConfigBase):
    empresa_id: UUID

class EntityConfigUpdate(BaseModel):
    entity_type: Optional[str] = None
    config: Optional[ConfigSchema] = None

class EntityConfig(EntityConfigBase):
    id: int
    empresa_id: UUID
    
    model_config = ConfigDict(from_attributes=True)
