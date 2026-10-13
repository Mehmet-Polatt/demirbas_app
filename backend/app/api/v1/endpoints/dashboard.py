from typing import Any, Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api.deps import get_db, get_current_user
from app.models.device import Device, DeviceStatus, DeviceCategory
from app.models.assignment import Assignment
from app.models.user import User
from app.models.audit_log import AuditLog

router = APIRouter()

@router.get("/stats")
def get_dashboard_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Provides high-level analytical metrics and chart data for the dark UI dashboard"""
    # 1. Total counts
    total_devices = db.query(Device).count()
    available_devices = db.query(Device).filter(Device.status == DeviceStatus.AVAILABLE).count()
    assigned_devices = db.query(Device).filter(Device.status == DeviceStatus.ASSIGNED).count()
    faulty_devices = db.query(Device).filter(Device.status == DeviceStatus.FAULTY).count()
    in_repair_devices = db.query(Device).filter(Device.status == DeviceStatus.IN_REPAIR).count()
    scrapped_devices = db.query(Device).filter(Device.status == DeviceStatus.SCRAPPED).count()

    total_users = db.query(User).count()
    active_assignments = db.query(Assignment).filter(Assignment.is_active == True).count()

    # 2. Devices by category
    category_counts = (
        db.query(Device.category, func.count(Device.id))
        .group_by(Device.category)
        .all()
    )
    categories_data = [
        {"category": cat.value, "count": count} for cat, count in category_counts
    ]

    # 3. Status breakdown
    status_data = [
        {"status": "Boşta (Depo)", "count": available_devices, "key": "AVAILABLE", "color": "#10B981"},
        {"status": "Zimmetli", "count": assigned_devices, "key": "ASSIGNED", "color": "#3B82F6"},
        {"status": "Arızalı", "count": faulty_devices, "key": "FAULTY", "color": "#EF4444"},
        {"status": "Bakımda", "count": in_repair_devices, "key": "IN_REPAIR", "color": "#F59E0B"},
        {"status": "Hurda", "count": scrapped_devices, "key": "SCRAPPED", "color": "#6B7280"},
    ]

    # 4. Department assignment distribution
    dept_distribution = (
        db.query(User.department, func.count(Assignment.id))
        .join(Assignment, Assignment.user_id == User.id)
        .filter(Assignment.is_active == True)
        .group_by(User.department)
        .all()
    )
    departments_data = [
        {"department": dept or "Belirtilmemiş", "count": count}
        for dept, count in dept_distribution
    ]

    # 5. Recent Assignments
    recent_assignments_raw = (
        db.query(Assignment)
        .order_by(Assignment.assigned_at.desc())
        .limit(5)
        .all()
    )
    recent_assignments = [
        {
            "id": a.id,
            "device_tag": a.device.asset_tag if a.device else "Bilinmiyor",
            "device_name": f"{a.device.brand} {a.device.model}" if a.device else "Cihaz",
            "user_name": a.user.full_name if a.user else "Kullanıcı",
            "user_dept": a.user.department if a.user else "",
            "assigned_at": a.assigned_at,
            "is_active": a.is_active
        }
        for a in recent_assignments_raw
    ]

    # 6. Recent Activities (Audit Logs)
    recent_logs_raw = (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .limit(6)
        .all()
    )
    recent_logs = [
        {
            "id": log.id,
            "action": log.action.value,
            "entity_type": log.entity_type,
            "description": log.description,
            "user_name": log.user.full_name if log.user else "Sistem",
            "created_at": log.created_at
        }
        for log in recent_logs_raw
    ]

    return {
        "summary": {
            "total_devices": total_devices,
            "available_devices": available_devices,
            "assigned_devices": assigned_devices,
            "faulty_devices": faulty_devices,
            "in_repair_devices": in_repair_devices,
            "scrapped_devices": scrapped_devices,
            "total_users": total_users,
            "active_assignments": active_assignments,
            "utilization_rate": round((assigned_devices / total_devices * 100), 1) if total_devices > 0 else 0
        },
        "status_breakdown": status_data,
        "categories_breakdown": categories_data,
        "departments_breakdown": departments_data,
        "recent_assignments": recent_assignments,
        "recent_activities": recent_logs
    }
