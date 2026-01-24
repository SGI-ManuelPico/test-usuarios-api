from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SYNC_DATABASE_URL: str = ""
    DB_ECHO: bool = False
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_SSL_ENABLED: bool = False
    DB_CONNECT_TIMEOUT: int = 10

    class Config:
        env_file = ".env"

settings = Settings()