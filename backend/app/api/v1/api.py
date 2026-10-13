from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    users,
    devices,
    assignments,
    dashboard,
    audit_logs,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Kimlik Doğrulama (Auth)"])
api_router.include_router(users.router, prefix="/users", tags=["Kullanıcı Yönetimi (Users)"])
api_router.include_router(devices.router, prefix="/devices", tags=["Envanter & Cihazlar (Devices)"])
api_router.include_router(assignments.router, prefix="/assignments", tags=["Zimmet İşlemleri (Assignments)"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard & Raporlama"])
api_router.include_router(audit_logs.router, prefix="/audit-logs", tags=["İşlem Logları (Audit Logs)"])
