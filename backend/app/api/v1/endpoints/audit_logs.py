from typing import Any, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_it_or_admin
from app.models.audit_log import AuditLog, AuditAction
from app.models.user import User
from app.schemas.audit_log import AuditLogResponse

router = APIRouter()

@router.get("", response_model=List[AuditLogResponse])
def get_audit_logs(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    action: Optional[AuditAction] = Query(None),
    entity_type: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    current_admin: User = Depends(get_current_it_or_admin)
) -> Any:
    """Lists system compliance audit records (IT/Admin only)"""
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)

    logs = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    return logs
