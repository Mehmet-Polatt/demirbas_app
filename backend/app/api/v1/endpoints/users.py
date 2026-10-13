from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.api.deps import get_db, get_current_user, get_current_active_admin
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.assignment import Assignment
from app.models.audit_log import AuditAction
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.services.audit_service import create_audit_log

router = APIRouter()

@router.get("", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    q: Optional[str] = Query(None, description="Arama (İsim, E-posta, Departman)"),
    role: Optional[UserRole] = Query(None),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Lists users with pagination and filtering"""
    query = db.query(User)
    if q:
        search_pattern = f"%{q.strip()}%"
        query = query.filter(
            or_(
                User.full_name.ilike(search_pattern),
                User.email.ilike(search_pattern),
                User.username.ilike(search_pattern),
                User.department.ilike(search_pattern)
            )
        )
    if role:
        query = query.filter(User.role == role)
    
    users = query.order_by(User.full_name.asc()).offset(skip).limit(limit).all()
    return users

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin)
) -> Any:
    """Creates a new user (Admin only)"""
    # Check duplicate email
    if db.query(User).filter(User.email == user_in.email.lower()).first():
        raise HTTPException(status_code=400, detail="Bu e-posta adresiyle kayıtlı bir kullanıcı zaten var")
    # Check duplicate username
    if db.query(User).filter(User.username == user_in.username).first():
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten kullanımda")

    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        email=user_in.email.lower(),
        username=user_in.username,
        full_name=user_in.full_name,
        hashed_password=hashed_pwd,
        role=user_in.role,
        department=user_in.department,
        phone_number=user_in.phone_number,
        is_active=user_in.is_active if user_in.is_active is not None else True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    create_audit_log(
        db=db,
        action=AuditAction.CREATE,
        entity_type="USER",
        entity_id=str(user.id),
        description=f"Yeni kullanıcı oluşturuldu: {user.full_name} ({user.role})",
        user_id=current_admin.id
    )

    return user

@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get single user profile and assigned items"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin)
) -> Any:
    """Updates user information (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

    update_data = user_in.model_dump(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        user.hashed_password = get_password_hash(update_data.pop("password"))

    for field, value in update_data.items():
        if field == "email" and value:
            user.email = value.lower()
        else:
            setattr(user, field, value)

    db.commit()
    db.refresh(user)

    create_audit_log(
        db=db,
        action=AuditAction.UPDATE,
        entity_type="USER",
        entity_id=str(user.id),
        description=f"Kullanıcı güncellendi: {user.full_name}",
        user_id=current_admin.id
    )

    return user

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin)
) -> Any:
    """Deletes a user if no active assignments exist (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Kendi hesabınızı silemezsiniz")

    # Safety check: are there active assignments on this user?
    active_assignments = db.query(Assignment).filter(
        Assignment.user_id == user.id,
        Assignment.is_active == True
    ).count()

    if active_assignments > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Bu kullanıcının üzerinde {active_assignments} adet aktif zimmetli cihaz var. Önce cihazları iade almalısınız."
        )

    db.delete(user)
    db.commit()

    create_audit_log(
        db=db,
        action=AuditAction.DELETE,
        entity_type="USER",
        entity_id=str(user_id),
        description=f"Kullanıcı silindi: {user.full_name}",
        user_id=current_admin.id
    )

    return {"message": "Kullanıcı başarıyla silindi"}
