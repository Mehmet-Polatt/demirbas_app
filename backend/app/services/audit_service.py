from typing import Optional, Any, Dict
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog, AuditAction

def create_audit_log(
    db: Session,
    action: AuditAction,
    entity_type: str,
    entity_id: str,
    description: str,
    user_id: Optional[int] = None,
    changes: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None
) -> AuditLog:
    """Helper service to create audit entries for traceability and compliance"""
    audit_entry = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id),
        description=description,
        changes=changes,
        ip_address=ip_address
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    return audit_entry
