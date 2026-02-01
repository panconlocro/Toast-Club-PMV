from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings."""
    
    # API
    PROJECT_NAME: str = "Toast Club PMV"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:chicho2015@localhost:5432/toastclub"
    
    # Security
    # WARNING: Change SECRET_KEY in production! Use a cryptographically secure random string.
    # Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
    SECRET_KEY: str = "your-secret-key-change-in-production-NEVER-use-this-default"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # CORS (No olvidar agregar la url de netlify o vercel cuando se haga deploy)
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173", "http://localhost:4173"]

    # Timezone (API responses)
    # Peru timezone is UTC-5 year-round.
    TIMEZONE: str = "America/Lima"
    
    # Storage (for future audio files)
    UPLOAD_DIR: str = "uploads"
    MAX_AUDIO_SIZE_MB: int = 100 # por si acaso un valor alto :D

    # Cloudflare R2 (S3-compatible) storage
    R2_ENDPOINT_URL: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET: str = ""
    R2_REGION: str = "auto"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
