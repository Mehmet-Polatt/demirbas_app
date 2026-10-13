from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

db_url = settings.DATABASE_URL

# Seamlessly convert async driver prefix if provided to sync pymysql driver
if db_url.startswith("mysql+aiomysql://"):
    db_url = db_url.replace("mysql+aiomysql://", "mysql+pymysql://", 1)
elif db_url.startswith("mysql://"):
    db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)

connect_args = {}
engine_kwargs = {
    "pool_pre_ping": True,
}

if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False
elif "mysql" in db_url:
    engine_kwargs["pool_recycle"] = 3600

engine = create_engine(
    db_url,
    connect_args=connect_args,
    **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency for obtaining database sessions in API endpoints"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
