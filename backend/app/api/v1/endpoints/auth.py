from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.core.security import verify_password, create_access_token
from app.models.user import User
from app.models.audit_log import AuditAction
from app.schemas.user import UserResponse, Token
from app.services.audit_service import create_audit_log

router = APIRouter()

class LoginJSONRequest(BaseModel):
    username_or_email: str
    password: str

@router.post("/login", response_model=Token)
def login_for_access_token(
    request: Request,
    db: Session = Depends(get_db),
    form_data: Optional[OAuth2PasswordRequestForm] = Depends()
) -> Any:
    """OAuth2 compatible token login for Swagger or form submissions"""
    identifier = form_data.username.strip() if form_data else None
    password = form_data.password if form_data else None

    if not identifier or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kullanıcı adı/e-posta ve şifre gereklidir"
        )

    # Allow login with either email or username
    user = db.query(User).filter(
        (User.email == identifier.lower()) | (User.username == identifier)
    ).first()

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Hatalı e-posta/kullanıcı adı veya şifre",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Kullanıcı hesabı askıya alınmıştır"
        )

    # Log successful login
    client_ip = request.client.host if request.client else None
    create_audit_log(
        db=db,
        action=AuditAction.AUTH_LOGIN,
        entity_type="AUTH",
        entity_id=str(user.id),
        description=f"Kullanıcı giriş yaptı: {user.full_name} ({user.email})",
        user_id=user.id,
        ip_address=client_ip
    )

    access_token = create_access_token(subject=user.id, role=user.role.value)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login-json", response_model=Token)
def login_json(
    login_data: LoginJSONRequest,
    request: Request,
    db: Session = Depends(get_db)
) -> Any:
    """JSON-based login endpoint for Next.js and Mobile Flutter applications"""
    identifier = login_data.username_or_email.strip()
    user = db.query(User).filter(
        (User.email == identifier.lower()) | (User.username == identifier)
    ).first()

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Hatalı e-posta/kullanıcı adı veya şifre"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Kullanıcı hesabı askıya alınmıştır"
        )

    client_ip = request.client.host if request.client else None
    create_audit_log(
        db=db,
        action=AuditAction.AUTH_LOGIN,
        entity_type="AUTH",
        entity_id=str(user.id),
        description=f"Kullanıcı JSON ile giriş yaptı: {user.full_name}",
        user_id=user.id,
        ip_address=client_ip
    )

    access_token = create_access_token(subject=user.id, role=user.role.value)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def read_current_user_profile(
    current_user: User = Depends(get_current_user)
) -> Any:
    """Returns currently authenticated user profile"""
    return current_user

@router.post("/logout")
def logout_user(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Logs out user and records security audit trail"""
    client_ip = request.client.host if request.client else None
    create_audit_log(
        db=db,
        action=AuditAction.AUTH_LOGOUT,
        entity_type="AUTH",
        entity_id=str(current_user.id),
        description=f"Kullanıcı çıkış yaptı: {current_user.full_name}",
        user_id=current_user.id,
        ip_address=client_ip
    )
    return {"message": "Başarıyla çıkış yapıldı"}
