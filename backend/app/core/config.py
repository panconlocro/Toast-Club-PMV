"""
Configuration settings for Toast Club PMV
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings
    """
    # Application
    APP_NAME: str = "Toast Club PMV"
    APP_VERSION: str = "0.1.0"
    API_PREFIX: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:8080"]
    
    # Database (for future implementation)
    DATABASE_URL: str = "sqlite:///./toastclub.db"
    
    # Files
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024  # 100MB
    
    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
