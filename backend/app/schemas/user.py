from typing import Optional
from datetime import datetime
from pydantic import BaseModel
try:
    import email_validator
    from pydantic import EmailStr
except ImportError:
    EmailStr = str
from app.models.user import UserRole

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    role: UserRole = UserRole.STAFF
    department: Optional[str] = None
    phone_number: Optional[str] = None
    is_active: Optional[bool] = True

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str

# Properties to receive via API on update
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    department: Optional[str] = None
    phone_number: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

# Properties to return via API
class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
