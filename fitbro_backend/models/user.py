from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
import enum
import datetime
from fitbro_backend.database import Base

class RoleEnum(enum.Enum):
    FITBRO_ADMIN = "FitBro Admin"
    FITBRO_OFFICER = "FitBro Officer"
    GYM_OWNER = "Gym Owner"
    GYM_INSTRUCTOR = "Gym Instructor"
    GYM_OFFICER = "Gym Officer"
    GYM_MEMBER = "Gym Member"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(64))
    mobile = Column(String(20), unique=True, index=True)
    email = Column(String(128), nullable=True)
    password = Column(String(256))  # hashed
    role = Column(Enum(RoleEnum), nullable=False)
    gym_id = Column(Integer, ForeignKey("gyms.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    # relationships
    gym = relationship("Gym", back_populates="users")
