from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from ..database import Base

class Program(Base):
    __tablename__ = "programs"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    gym_id = Column(Integer, ForeignKey("gyms.id"), nullable=True)
    is_master = Column(Boolean, default=True)
    parent_id = Column(Integer, ForeignKey("programs.id"), nullable=True)
    goals = Column(Text, nullable=True)
    status = Column(String, default="Active")

    gym = relationship("Gym", back_populates="programs")
    workouts = relationship("Workout", back_populates="program", cascade="all, delete")
    parent = relationship("Program", remote_side=[id], back_populates="children")
    children = relationship("Program", back_populates="parent", remote_side=[parent_id])

    # Add this line:
    membership_plans = relationship(
        "MembershipPlan",
        secondary="membership_plan_program",
        back_populates="programs"
    )
