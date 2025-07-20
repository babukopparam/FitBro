from sqlalchemy import Column, Integer, String, ForeignKey, Date, Text, DateTime
from sqlalchemy.orm import relationship
from ..database import Base
import datetime

class Visitor(Base):
    __tablename__ = "visitors"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(64), nullable=False)
    last_name = Column(String(64), nullable=True)
    mobile = Column(String(20), nullable=False)
    email = Column(String(128), nullable=True)
    fitness_goal = Column(String(256), nullable=True)
    interested_plan_id = Column(Integer, ForeignKey("membership_plans.id"), nullable=True)
    gym_id = Column(Integer, ForeignKey("gyms.id"), nullable=False)
    status = Column(String(32), default="Contacted")  # Contacted/Converted/Not Interested
    comments = Column(Text, nullable=True)
    last_followup = Column(Date, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    created_by = Column(String(64), nullable=True)
    updated_by = Column(String(64), nullable=True)

    # Relationships
    gym = relationship("Gym", back_populates="visitors")
    plan = relationship("MembershipPlan", foreign_keys=[interested_plan_id])
    followups = relationship("VisitorFollowUp", back_populates="visitor", cascade="all, delete-orphan")
