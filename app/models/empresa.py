from sqlalchemy import Column, String, Index, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from app.models.base import Base

class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid(), nullable=False)
    nombre = Column(String, nullable=False)
    nit = Column(String, unique=True, nullable=False)
    custom_data = Column(JSONB, default={})

    usuarios = relationship("Usuario", back_populates="empresa")
    entity_configs = relationship("EntityConfig", back_populates="empresa")

    __table_args__ = (
        Index('ix_empresas_custom_data_gin', 'custom_data', postgresql_using='gin'),
    )