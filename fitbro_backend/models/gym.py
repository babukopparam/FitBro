# models/gym.py
from sqlalchemy import Column, Integer, String, Date, Boolean
from sqlalchemy.orm import relationship
from ..database import Base

class Gym(Base):
    __tablename__ = "gyms"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), unique=True, nullable=False)
    address = Column(String(256), nullable=True)
    contract_start = Column(Date, nullable=True)
    contract_end = Column(Date, nullable=True)
    recurring_revenue_start = Column(Date, nullable=True)
    owner_mobile = Column(String(20), nullable=False)
    owner_name = Column(String(128), nullable=False)      # ADD THIS LINE
    owner_email = Column(String(128), nullable=False)     # ADD THIS LINE
    is_active = Column(Boolean, default=True)
    logo_url = Column(String(256), nullable=True)
    # ...relationships as before


    # Relationships
    users = relationship("User", back_populates="gym")
    equipment = relationship("Equipment", back_populates="gym")
    members = relationship("Member", back_populates="gym")
    membership_plans = relationship("MembershipPlan", back_populates="gym")
    programs = relationship("Program", back_populates="gym")
    visitors = relationship("Visitor", back_populates="gym")
    exercises = relationship("Exercise", back_populates="gym")
    workouts = relationship("Workout", back_populates="gym")
