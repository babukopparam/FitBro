from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Member(Base):
    __tablename__ = "members"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    mobile = Column(String(20), unique=True, nullable=False)
    email = Column(String(128), nullable=False)
    photo_url = Column(String(256), nullable=False)
    dob = Column(Date, nullable=False)
    gender = Column(String(16), nullable=False)
    address = Column(String(256), nullable=False)
    join_date = Column(Date, nullable=False)
    active = Column(Boolean, default=True)
    gym_id = Column(Integer, ForeignKey("gyms.id"), nullable=False)
    membership_plan_id = Column(Integer, ForeignKey("membership_plans.id"), nullable=False)

    # Add these fields:
    membership_start_date = Column(Date, nullable=False)
    membership_end_date = Column(Date, nullable=False)

    # Relationships
    gym = relationship("Gym", back_populates="members")
    membership_plan = relationship("MembershipPlan", back_populates="members")
    assessment_results = relationship("AssessmentResult", back_populates="member")
    workout_logs = relationship("WorkoutLog", back_populates="member")
    cycle_plans = relationship("CyclePlan", back_populates="member", cascade="all, delete-orphan")
