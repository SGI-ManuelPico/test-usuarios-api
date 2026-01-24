import ssl
from typing import AsyncGenerator
import logging
import asyncio

from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import Session, sessionmaker

from app.core.settings import settings

logger = logging.getLogger(__name__)

# Configuración de argumentos de conexión
connect_args: dict = {}

if settings.DB_SSL_ENABLED:
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    # Para asyncpg, el argumento 'ssl' puede ser un SSLContext
    connect_args["ssl"] = ssl_context

# Engine Sincrónico (Generalmente para scripts de mantenimiento o Alembic)
sync_engine = create_engine(
    settings.SYNC_DATABASE_URL or settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql+psycopg://"),
    echo=settings.DB_ECHO,
    pool_pre_ping=True,
    pool_recycle=1800,
)

# Engine Asincrónico (Principal para FastAPI)
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DB_ECHO,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_pre_ping=True,
    pool_recycle=1800,
    connect_args=connect_args
)

async_session = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session

def get_sync_db():
    with Session(sync_engine) as session:
        yield session

async def ensure_database_connection(max_retries: int = 3):
    """Asegurar que la conexión a la base de datos esté activa al inicio"""
    for attempt in range(max_retries):
        try:
            async with async_session() as session:
                # Intentar habilitar la extensión de UUID por si acaso
                await session.execute(text("CREATE EXTENSION IF NOT EXISTS pgcrypto"))
                await session.execute(text("SELECT 1"))
                logger.info("Conexión a la base de datos exitosa (pgcrypto verificado)")
                return
        except Exception as e:
            logger.warning(f"Intento de conexión a la base de datos {attempt + 1} fallido: {e}")
            if attempt == max_retries - 1:
                raise
            await asyncio.sleep(2 ** attempt)  # Exponential backoff