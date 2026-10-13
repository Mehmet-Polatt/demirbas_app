import os
from typing import List
from dotenv import load_dotenv

# Explicitly load .env file from current or backend directory
load_dotenv()

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
    class Settings(BaseSettings):
        model_config = SettingsConfigDict(
            case_sensitive=True,
            env_file=".env",
            extra="ignore"  # Allow and ignore any extra env vars without throwing errors
        )
        PROJECT_NAME: str = os.getenv("PROJECT_NAME", "IT Demirbaş ve Zimmet Yönetim Sistemi")
        API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
        SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-demirbas-jwt-2024-secure-random")
        ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
        ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
        
        # Database
        DATABASE_URL: str = os.getenv(
            "DATABASE_URL", 
            "mysql+pymysql://root:156473mP*@localhost:3306/zimmet_db"
        )
        
        # CORS
        BACKEND_CORS_ORIGINS: List[str] = [
            "http://localhost:3000",
            "http://localhost:8000",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:8000",
            "*"
        ]
        
        # QR Code directory
        QR_CODE_DIR: str = os.getenv("QR_CODE_DIR", "./static/qrcodes")
        FIRST_SUPERUSER: str = os.getenv("FIRST_SUPERUSER", "admin@itdemirbas.com")
        FIRST_SUPERUSER_PASSWORD: str = os.getenv("FIRST_SUPERUSER_PASSWORD", "AdminPassword123!")

except ImportError:
    from pydantic import BaseModel
    class Settings(BaseModel):
        PROJECT_NAME: str = os.getenv("PROJECT_NAME", "IT Demirbaş ve Zimmet Yönetim Sistemi")
        API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
        SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-demirbas-jwt-2024-secure-random")
        ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
        ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
        DATABASE_URL: str = os.getenv(
            "DATABASE_URL", 
            "mysql+pymysql://root:156473mP*@localhost:3306/zimmet_db"
        )
        BACKEND_CORS_ORIGINS: List[str] = ["*"]
        QR_CODE_DIR: str = os.getenv("QR_CODE_DIR", "./static/qrcodes")
        FIRST_SUPERUSER: str = os.getenv("FIRST_SUPERUSER", "admin@itdemirbas.com")
        FIRST_SUPERUSER_PASSWORD: str = os.getenv("FIRST_SUPERUSER_PASSWORD", "AdminPassword123!")

settings = Settings()
