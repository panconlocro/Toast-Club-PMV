from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    """Application settings."""

    # Environment
    ENVIRONMENT: str = "local"  # local | production
    DEBUG: bool = False

    # API
    PROJECT_NAME: str = "Toast Club PMV"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    # Database
    # En producción viene de Render (Postgres). En local puede usar tu default.
    DATABASE_URL: str = "postgresql://postgres:chicho2015@localhost:5432/toastclub"

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production-NEVER-use-this-default"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS
    # En producción setea esto en Render como:
    # CORS_ORIGINS=https://tu-frontend.netlify.app,http://localhost:5173
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://localhost:4173"

    # Timezone
    TIMEZONE: str = "America/Lima"

    # Storage
    UPLOAD_DIR: str = "uploads"
    MAX_AUDIO_SIZE_MB: int = 100

    # Cloudflare R2 (S3-compatible) storage
    R2_ENDPOINT_URL: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET: str = ""
    R2_REGION: str = "auto"

    # ---- Helpers ----
    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    def __init__(self, **values):
        super().__init__(**values)

        # Bloqueos de seguridad en producción
        if self.ENVIRONMENT == "production":
            if (
                not self.SECRET_KEY
                or self.SECRET_KEY == "your-secret-key-change-in-production-NEVER-use-this-default"
            ):
                raise ValueError("SECRET_KEY must be set in production (do not use the default).")

            if "localhost" in (self.DATABASE_URL or ""):
                raise ValueError("DATABASE_URL must be a production database (not localhost).")

    class Config:
        env_file = ".env"  # Solo para local. En Render NO uses archivo .env, usa env vars.
        case_sensitive = True


settings = Settings()
