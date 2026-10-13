import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    STAFF = "STAFF"
    IT_SPECIALIST = "IT_SPECIALIST"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(150), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.STAFF, nullable=False)
    department = Column(String(100), nullable=True)  # IT, Muhasebe, İK, Pazarlama, Yazılım vb.
    phone_number = Column(String(25), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    # Assignments where this user is the recipient of the device
    assignments = relationship(
        "Assignment",
        foreign_keys="Assignment.user_id",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    # Assignments created/approved by this user (Admin/IT Specialist)
    processed_assignments = relationship(
        "Assignment",
        foreign_keys="Assignment.assigned_by_id",
        back_populates="assigned_by"
    )
    # Audit log activities initiated by this user
    audit_logs = relationship(
        "AuditLog",
        back_populates="user"
    )

    def __repr__(self):
        return f"<User id={self.id} username='{self.username}' role='{self.role}'>"
