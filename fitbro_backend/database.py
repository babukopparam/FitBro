# This code snippet is part of the FitBro backend project.
# It defines the database connection and session management for SQLAlchemy. 
# It includes the creation of the database engine, session local, and base class for models.
# It also provides a dependency to get the database session for use in FastAPI routes.
# fix the issue - ImportError: cannot import name 'datetime' from 'fitbro_backend.database' (D:\FitBro\fitbro_backend\database.py)

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

DATABASE_URL = "sqlite:///./fitbro.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()