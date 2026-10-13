from typing import Optional, Any, Dict
from datetime import date, datetime
from pydantic import BaseModel
from app.models.device import DeviceCategory, DeviceStatus

# Shared properties
class DeviceBase(BaseModel):
    asset_tag: str
    serial_number: str
    category: DeviceCategory
    brand: str
    model: str
    specs: Optional[Dict[str, Any]] = None
    status: DeviceStatus = DeviceStatus.AVAILABLE
    purchase_date: Optional[date] = None
    warranty_end_date: Optional[date] = None
    barcode: Optional[str] = None
    notes: Optional[str] = None

class DeviceCreate(DeviceBase):
    pass

class DeviceUpdate(BaseModel):
    asset_tag: Optional[str] = None
    serial_number: Optional[str] = None
    category: Optional[DeviceCategory] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    specs: Optional[Dict[str, Any]] = None
    status: Optional[DeviceStatus] = None
    purchase_date: Optional[date] = None
    warranty_end_date: Optional[date] = None
    barcode: Optional[str] = None
    notes: Optional[str] = None

class DeviceResponse(DeviceBase):
    id: int
    qr_code_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    current_holder: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class DeviceStatusUpdate(BaseModel):
    status: DeviceStatus
    notes: Optional[str] = None
