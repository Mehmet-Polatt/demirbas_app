"""
Database initialization script for creating all tables.
Can be executed to verify schema integrity and create initial tables.
"""
from app.core.database import Base, engine
from app.models import User, Device, Assignment, AuditLog

def init_db():
    print("Veritabanı tabloları oluşturuluyor...")
    Base.metadata.create_all(bind=engine)
    print("Başarılı! Tablolar:", list(Base.metadata.tables.keys()))

if __name__ == "__main__":
    init_db()
