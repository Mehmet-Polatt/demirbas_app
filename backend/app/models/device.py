import enum
from sqlalchemy import Column, Integer, String, Date, Text, DateTime, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class DeviceCategory(str, enum.Enum):
    LAPTOP = "LAPTOP"
    DESKTOP = "DESKTOP"
    MONITOR = "MONITOR"
    SERVER = "SERVER"
    PHONE = "PHONE"
    TABLET = "TABLET"
    PRINTER = "PRINTER"
    NETWORK_DEVICE = "NETWORK_DEVICE"
    OTHER = "OTHER"

class DeviceStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"    # Boşta / Depoda
    ASSIGNED = "ASSIGNED"      # Personele Zimmetli
    FAULTY = "FAULTY"          # Arızalı
    IN_REPAIR = "IN_REPAIR"    # Bakımda / Tamirde
    SCRAPPED = "SCRAPPED"      # Hurdaya Ayrılmış / Kullanım Dışı

class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    asset_tag = Column(String(50), unique=True, index=True, nullable=False) # Benzersiz IT Demirbaş Kodu (Örn: IT-AST-0012)
    serial_number = Column(String(100), unique=True, index=True, nullable=False) # Üretici Seri No
    category = Column(Enum(DeviceCategory), default=DeviceCategory.LAPTOP, nullable=False, index=True)
    brand = Column(String(100), nullable=False)  # Apple, Dell, Lenovo, HP, Cisco vb.
    model = Column(String(100), nullable=False)  # MacBook Pro, Latitude 5420, ThinkPad X1 vb.
    specs = Column(JSON, nullable=True)  # Donanım detayları (örn: {"cpu": "M3 Pro", "ram": "32GB", "storage": "1TB SSD"})
    status = Column(Enum(DeviceStatus), default=DeviceStatus.AVAILABLE, nullable=False, index=True)
    purchase_date = Column(Date, nullable=True)
    warranty_end_date = Column(Date, nullable=True)
    qr_code_path = Column(String(255), nullable=True) # Üretilen QR kod görselinin yolu veya URL'si
    barcode = Column(String(100), nullable=True) # Opsiyonel barkod numarası
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    # Historical and active assignments for this device
    assignments = relationship(
        "Assignment",
        back_populates="device",
        cascade="all, delete-orphan",
        order_by="desc(Assignment.assigned_at)"
    )

    def __repr__(self):
        return f"<Device id={self.id} tag='{self.asset_tag}' status='{self.status}'>"
