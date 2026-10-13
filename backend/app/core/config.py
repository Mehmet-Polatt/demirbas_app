import os
from typing import List
from dotenv import load_dotenv

# Explicitly load .env file from current or backend directory
load_dotenv()

try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseModel as BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "IT Demirbaş ve Zimmet Yönetim Sistemi")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-demirbas-jwt-2024-secure-random")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
    
    # Database: Default to MySQL zimmet_db
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "mysql+pymysql://root:156473mP*@localhost:3306/zimmet_db"
    )
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # QR Code directory
    QR_CODE_DIR: str = os.getenv("QR_CODE_DIR", "./static/qrcodes")

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
