from sqlalchemy import Column, String, Integer, ForeignKey, Index, UniqueConstraint
from sqlalchemy.sql import func 
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from app.models.base import Base 

class EntityConfig(Base):
    __tablename__ = "entity_configs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    empresa_id = Column(UUID(as_uuid=True), ForeignKey("empresas.id"), nullable=False)
    entity_type = Column(String, nullable=False) 
    config = Column(JSONB, server_default='{}', nullable=False)

    empresa = relationship("Empresa", back_populates="entity_configs")

    __table_args__ = (
        UniqueConstraint('empresa_id', 'entity_type', name='uq_empresa_entity_type'),
        Index('ix_entity_config_config_gin', 'config', postgresql_using='gin'),
    )

    def __repr__(self):
        return f"<EntityConfig(empresa={self.empresa_id}, type='{self.entity_type}')>"