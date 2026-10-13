from typing import Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel
from app.models.audit_log import AuditAction
from app.schemas.user import UserResponse

class AuditLogBase(BaseModel):
    action: AuditAction
    entity_type: str
    entity_id: Optional[str] = None
    description: str
    changes: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    user_id: Optional[int] = None

class AuditLogResponse(AuditLogBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True
