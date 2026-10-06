import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# On Vercel / serverless environments, default SQLite to /tmp
default_sqlite = "/tmp/jobscractecher.db" if (os.path.exists("/tmp") and os.environ.get("VERCEL")) else "./jobscractecher.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{default_sqlite}")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite needs check_same_thread=False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

