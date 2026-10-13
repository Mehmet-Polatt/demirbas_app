import uuid
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.api.deps import get_db, get_current_user, get_current_it_or_admin, get_current_active_admin
from app.models.device import Device, DeviceCategory, DeviceStatus
from app.models.assignment import Assignment
from app.models.user import User
from app.models.audit_log import AuditAction
from app.schemas.device import DeviceCreate, DeviceUpdate, DeviceResponse, DeviceStatusUpdate
from app.services.qr_service import generate_device_qr_code
from app.services.audit_service import create_audit_log

router = APIRouter()

def enrich_device_response(device: Device, db: Session) -> dict:
    """Enriches device model with current active holder details"""
    active_assignment = db.query(Assignment).filter(
        Assignment.device_id == device.id,
        Assignment.is_active == True
    ).first()

    holder_info = None
    if active_assignment and active_assignment.user:
        holder_info = {
            "assignment_id": active_assignment.id,
            "user_id": active_assignment.user.id,
            "full_name": active_assignment.user.full_name,
            "department": active_assignment.user.department,
            "email": active_assignment.user.email,
            "assigned_at": active_assignment.assigned_at
        }

    return {
        "id": device.id,
        "asset_tag": device.asset_tag,
        "serial_number": device.serial_number,
        "category": device.category,
        "brand": device.brand,
        "model": device.model,
        "specs": device.specs,
        "status": device.status,
        "purchase_date": device.purchase_date,
        "warranty_end_date": device.warranty_end_date,
        "qr_code_path": device.qr_code_path,
        "barcode": device.barcode,
        "notes": device.notes,
        "created_at": device.created_at,
        "updated_at": device.updated_at,
        "current_holder": holder_info
    }

@router.get("", response_model=List[DeviceResponse])
def get_devices(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    q: Optional[str] = Query(None, description="Demirbaş no, seri no, marka, model arama"),
    category: Optional[DeviceCategory] = Query(None),
    status: Optional[DeviceStatus] = Query(None),
    current_user: User = Depends(get_current_user)
) -> Any:
    """List devices with filtering and search"""
    query = db.query(Device)
    if q:
        pattern = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Device.asset_tag.ilike(pattern),
                Device.serial_number.ilike(pattern),
                Device.brand.ilike(pattern),
                Device.model.ilike(pattern),
                Device.notes.ilike(pattern)
            )
        )
    if category:
        query = query.filter(Device.category == category)
    if status:
        query = query.filter(Device.status == status)

    devices = query.order_by(Device.created_at.desc()).offset(skip).limit(limit).all()
    return [enrich_device_response(dev, db) for dev in devices]

@router.post("", response_model=DeviceResponse, status_code=status.HTTP_201_CREATED)
def create_device(
    device_in: DeviceCreate,
    db: Session = Depends(get_db),
    current_it: User = Depends(get_current_it_or_admin)
) -> Any:
    """Creates a new device asset and automatically generates its QR Code"""
    # Auto-generate asset_tag if empty
    asset_tag = device_in.asset_tag.strip() if device_in.asset_tag else f"AST-{uuid.uuid4().hex[:8].upper()}"

    # Check uniqueness
    if db.query(Device).filter(Device.asset_tag == asset_tag).first():
        raise HTTPException(status_code=400, detail=f"'{asset_tag}' demirbaş numarası zaten sistemde kayıtlı")
    if db.query(Device).filter(Device.serial_number == device_in.serial_number).first():
        raise HTTPException(status_code=400, detail=f"'{device_in.serial_number}' seri numaralı cihaz zaten sistemde kayıtlı")

    # Generate QR Code
    qr_path, _ = generate_device_qr_code(
        asset_tag=asset_tag,
        metadata={
            "brand": device_in.brand,
            "model": device_in.model,
            "category": device_in.category.value
        }
    )

    device = Device(
        asset_tag=asset_tag,
        serial_number=device_in.serial_number,
        category=device_in.category,
        brand=device_in.brand,
        model=device_in.model,
        specs=device_in.specs,
        status=device_in.status or DeviceStatus.AVAILABLE,
        purchase_date=device_in.purchase_date,
        warranty_end_date=device_in.warranty_end_date,
        qr_code_path=qr_path,
        barcode=device_in.barcode or asset_tag,
        notes=device_in.notes
    )
    db.add(device)
    db.commit()
    db.refresh(device)

    create_audit_log(
        db=db,
        action=AuditAction.CREATE,
        entity_type="DEVICE",
        entity_id=str(device.id),
        description=f"Yeni demirbaş cihaz eklendi: {device.asset_tag} - {device.brand} {device.model}",
        user_id=current_it.id
    )

    return enrich_device_response(device, db)

@router.get("/by-tag/{asset_tag}", response_model=DeviceResponse)
def get_device_by_asset_tag(
    asset_tag: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Lookup device by scanned QR code asset tag (Mobile/Web scanner integration)"""
    device = db.query(Device).filter(Device.asset_tag == asset_tag.strip()).first()
    if not device:
        raise HTTPException(status_code=404, detail="Demirbaş etiketiyle eşleşen cihaz bulunamadı")
    return enrich_device_response(device, db)

@router.get("/{device_id}", response_model=DeviceResponse)
def get_device_by_id(
    device_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get device details with full assignment history and current holder"""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Cihaz bulunamadı")
    return enrich_device_response(device, db)

@router.put("/{device_id}", response_model=DeviceResponse)
def update_device(
    device_id: int,
    device_in: DeviceUpdate,
    db: Session = Depends(get_db),
    current_it: User = Depends(get_current_it_or_admin)
) -> Any:
    """Update device metadata"""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Cihaz bulunamadı")

    update_data = device_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(device, field, val)

    db.commit()
    db.refresh(device)

    create_audit_log(
        db=db,
        action=AuditAction.UPDATE,
        entity_type="DEVICE",
        entity_id=str(device.id),
        description=f"Cihaz bilgileri güncellendi: {device.asset_tag}",
        user_id=current_it.id
    )

    return enrich_device_response(device, db)

@router.patch("/{device_id}/status", response_model=DeviceResponse)
def update_device_status(
    device_id: int,
    status_update: DeviceStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Quickly update device condition (e.g. report faulty via mobile app or web)"""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Cihaz bulunamadı")

    old_status = device.status
    device.status = status_update.status
    if status_update.notes:
        device.notes = f"{device.notes or ''}\n[Durum Değişimi: {status_update.status.value}] {status_update.notes}".strip()

    db.commit()
    db.refresh(device)

    create_audit_log(
        db=db,
        action=AuditAction.STATUS_CHANGE,
        entity_type="DEVICE",
        entity_id=str(device.id),
        description=f"Cihaz durumu değişti: {device.asset_tag} ({old_status.value} -> {device.status.value})",
        user_id=current_user.id
    )

    return enrich_device_response(device, db)

@router.delete("/{device_id}")
def delete_device(
    device_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin)
) -> Any:
    """Deletes device (Admin only, prohibited if assigned)"""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Cihaz bulunamadı")

    if device.status == DeviceStatus.ASSIGNED:
        raise HTTPException(
            status_code=400,
            detail="Bu cihaz şu anda bir personele zimmetlidir. Önce zimmet iadesi yapmalısınız."
        )

    db.delete(device)
    db.commit()

    create_audit_log(
        db=db,
        action=AuditAction.DELETE,
        entity_type="DEVICE",
        entity_id=str(device_id),
        description=f"Cihaz sistemden silindi: {device.asset_tag}",
        user_id=current_admin.id
    )

    return {"message": "Cihaz başarıyla silindi"}

@router.get("/{device_id}/qr-code")
def get_device_qr_image(
    device_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Regenerates and returns Base64 and download URL for QR code"""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Cihaz bulunamadı")

    rel_url, base64_uri = generate_device_qr_code(
        asset_tag=device.asset_tag,
        metadata={"brand": device.brand, "model": device.model}
    )
    device.qr_code_path = rel_url
    db.commit()

    return {
        "asset_tag": device.asset_tag,
        "qr_code_url": rel_url,
        "qr_code_base64": base64_uri
    }
