from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel
from app.schemas.user import UserResponse
from app.schemas.device import DeviceResponse

class AssignmentBase(BaseModel):
    device_id: int
    user_id: int
    expected_return_date: Optional[date] = None
    condition_at_assignment: Optional[str] = "Kusursuz / Yeni"
    notes: Optional[str] = None

class AssignmentCreate(AssignmentBase):
    pass

class AssignmentReturn(BaseModel):
    condition_at_return: Optional[str] = "İyi / Sorunsuz"
    notes: Optional[str] = None

class AssignmentResponse(AssignmentBase):
    id: int
    assigned_by_id: int
    assigned_at: datetime
    returned_at: Optional[datetime] = None
    condition_at_return: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    user: Optional[UserResponse] = None
    device: Optional[DeviceResponse] = None
    assigned_by: Optional[UserResponse] = None

    class Config:
        from_attributes = True
