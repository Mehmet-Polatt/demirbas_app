from sqlalchemy import Column, Integer, String, Date, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_by_id = Column(Integer, ForeignKey("users.id"), nullable=False) # Zimmeti teslim eden admin/yetkili

    assigned_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    returned_at = Column(DateTime(timezone=True), nullable=True) # İade tarihi (boş ise aktif zimmet)
    expected_return_date = Column(Date, nullable=True) # Geçici görevlendirmeler için beklenen iade tarihi

    condition_at_assignment = Column(String(255), default="Kusursuz / Yeni", nullable=False)
    condition_at_return = Column(String(255), nullable=True)
    
    is_active = Column(Boolean, default=True, index=True, nullable=False) # Aktif zimmet mi?
    notes = Column(Text, nullable=True) # Teslim edilen aksesuarlar (adaptör, çanta, mouse) veya notlar

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    device = relationship("Device", back_populates="assignments")
    user = relationship("User", foreign_keys=[user_id], back_populates="assignments")
    assigned_by = relationship("User", foreign_keys=[assigned_by_id], back_populates="processed_assignments")

    def __repr__(self):
        return f"<Assignment id={self.id} device_id={self.device_id} user_id={self.user_id} is_active={self.is_active}>"
