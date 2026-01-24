from sqlalchemy import Column, String, ForeignKey, Index, DateTime, Integer
from sqlalchemy.sql import func 
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from app.models.base import Base 

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid(), nullable=False)
    nombre = Column(String, nullable=False)
    empresa_id = Column(UUID(as_uuid=True), ForeignKey("empresas.id"), nullable=False)
    email = Column(String, unique=True, nullable=False)
    custom_data = Column(JSONB, server_default='{}', nullable=False)
    password = Column(String, nullable=False)
    estado = Column(Integer, nullable=False, default=1)
    creado_en = Column(DateTime, nullable=False, server_default=func.now())
    modificado_en = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    empresa = relationship("Empresa", back_populates="usuarios")

    __table_args__ = (
        Index('ix_usuarios_custom_data_gin', 'custom_data', postgresql_using='gin'),
    )