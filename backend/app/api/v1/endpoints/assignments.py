from typing import Any, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, get_current_it_or_admin
from app.models.assignment import Assignment
from app.models.device import Device, DeviceStatus
from app.models.user import User
from app.models.audit_log import AuditAction
from app.schemas.assignment import AssignmentCreate, AssignmentReturn, AssignmentResponse
from app.services.audit_service import create_audit_log

router = APIRouter()

@router.get("", response_model=List[AssignmentResponse])
def get_assignments(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    is_active: Optional[bool] = Query(None),
    user_id: Optional[int] = Query(None),
    device_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Lists assignment history with filters"""
    query = db.query(Assignment)
    if is_active is not None:
        query = query.filter(Assignment.is_active == is_active)
    if user_id:
        query = query.filter(Assignment.user_id == user_id)
    if device_id:
        query = query.filter(Assignment.device_id == device_id)

    assignments = query.order_by(Assignment.assigned_at.desc()).offset(skip).limit(limit).all()
    return assignments

@router.get("/my", response_model=List[AssignmentResponse])
def get_my_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Returns devices currently assigned to the logged-in user (Mobile & Web personal screen)"""
    assignments = db.query(Assignment).filter(
        Assignment.user_id == current_user.id,
        Assignment.is_active == True
    ).order_by(Assignment.assigned_at.desc()).all()
    return assignments

@router.post("", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
def create_assignment(
    assignment_in: AssignmentCreate,
    db: Session = Depends(get_db),
    current_it: User = Depends(get_current_it_or_admin)
) -> Any:
    """Assigns an available device to a user (IT / Admin only)"""
    # 1. Verify device exists and is available
    device = db.query(Device).filter(Device.id == assignment_in.device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Zimmetlenecek cihaz bulunamadı")
    if device.status == DeviceStatus.ASSIGNED:
        raise HTTPException(status_code=400, detail="Bu cihaz zaten başka bir personele zimmetlidir")
    if device.status in [DeviceStatus.FAULTY, DeviceStatus.IN_REPAIR, DeviceStatus.SCRAPPED]:
        raise HTTPException(status_code=400, detail=f"Cihaz durumu '{device.status.value}' olduğundan zimmetlenemez")

    # 2. Verify target user exists and is active
    target_user = db.query(User).filter(User.id == assignment_in.user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Zimmet yapılacak kullanıcı bulunamadı")
    if not target_user.is_active:
        raise HTTPException(status_code=400, detail="Kullanıcı hesabı pasif durumdadır")

    # 3. Create assignment record
    assignment = Assignment(
        device_id=device.id,
        user_id=target_user.id,
        assigned_by_id=current_it.id,
        expected_return_date=assignment_in.expected_return_date,
        condition_at_assignment=assignment_in.condition_at_assignment or "Kusursuz / Yeni",
        is_active=True,
        notes=assignment_in.notes
    )
    db.add(assignment)

    # 4. Update device status to ASSIGNED
    device.status = DeviceStatus.ASSIGNED

    db.commit()
    db.refresh(assignment)

    # 5. Log audit trail
    create_audit_log(
        db=db,
        action=AuditAction.ASSIGN,
        entity_type="ASSIGNMENT",
        entity_id=str(assignment.id),
        description=f"Cihaz zimmetlendi: {device.asset_tag} ({device.brand} {device.model}) -> {target_user.full_name}",
        user_id=current_it.id,
        changes={
            "device_id": device.id,
            "asset_tag": device.asset_tag,
            "user_id": target_user.id,
            "user_name": target_user.full_name
        }
    )

    return assignment

@router.post("/{assignment_id}/return", response_model=AssignmentResponse)
def return_assignment(
    assignment_id: int,
    return_in: AssignmentReturn,
    db: Session = Depends(get_db),
    current_it: User = Depends(get_current_it_or_admin)
) -> Any:
    """Returns a device back to inventory and closes the active assignment"""
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Zimmet kaydı bulunamadı")
    if not assignment.is_active:
        raise HTTPException(status_code=400, detail="Bu zimmet kaydı zaten daha önce iade edilmiş")

    # Update assignment
    assignment.is_active = False
    assignment.returned_at = datetime.now(timezone.utc)
    assignment.condition_at_return = return_in.condition_at_return or "İyi / Sorunsuz"
    if return_in.notes:
        assignment.notes = f"{assignment.notes or ''}\n[İade Notu]: {return_in.notes}".strip()

    # Update device status
    device = assignment.device
    if device:
        # Check if condition notes damage/fault
        if "arızalı" in assignment.condition_at_return.lower() or "hasar" in assignment.condition_at_return.lower():
            device.status = DeviceStatus.FAULTY
        else:
            device.status = DeviceStatus.AVAILABLE

    db.commit()
    db.refresh(assignment)

    create_audit_log(
        db=db,
        action=AuditAction.RETURN,
        entity_type="ASSIGNMENT",
        entity_id=str(assignment.id),
        description=f"Cihaz zimmetten iade alındı: {device.asset_tag if device else ''} (Personel: {assignment.user.full_name if assignment.user else ''})",
        user_id=current_it.id,
        changes={
            "condition_at_return": assignment.condition_at_return,
            "device_status": device.status.value if device else None
        }
    )

    return assignment
