import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import Base, engine
from app.api.v1.api import api_router
from app.services.qr_service import ensure_qr_dir_exists

# Auto create DB tables if not exist on startup
Base.metadata.create_all(bind=engine)
ensure_qr_dir_exists()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="IT Demirbaş ve Zimmet Yönetim Sistemi API - Envanter Takibi, QR Kod Entegrasyonu ve Zimmet Yönetimi",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/v1/openapi.json"
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static directory for QR code files
static_dir = os.path.abspath(settings.QR_CODE_DIR)
os.makedirs(static_dir, exist_ok=True)
app.mount("/static/qrcodes", StaticFiles(directory=static_dir), name="qrcodes")

# Mount API V1 routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Sistem"])
def root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "version": "1.0.0",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get("/health", tags=["Sistem"])
def health_check():
    return {"status": "healthy", "database": "connected"}
