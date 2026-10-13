import enum
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class AuditAction(str, enum.Enum):
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    ASSIGN = "ASSIGN"
    RETURN = "RETURN"
    STATUS_CHANGE = "STATUS_CHANGE"
    AUTH_LOGIN = "AUTH_LOGIN"
    AUTH_LOGOUT = "AUTH_LOGOUT"

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(Enum(AuditAction), nullable=False, index=True)
    entity_type = Column(String(50), nullable=False, index=True) # DEVICE, ASSIGNMENT, USER, AUTH
    entity_id = Column(String(50), nullable=True) # İlgili varlığın ID veya Demirbaş Kodu
    description = Column(String(255), nullable=False) # İnsan tarafından okunabilir özet açıklama
    changes = Column(JSON, nullable=True) # Eski ve yeni verilerin detaylı JSON dökümü
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="audit_logs")

    def __repr__(self):
        return f"<AuditLog id={self.id} action='{self.action}' entity='{self.entity_type}#{self.entity_id}'>"
