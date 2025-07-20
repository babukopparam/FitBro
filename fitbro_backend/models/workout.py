from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..database import Base

class Workout(Base):
    __tablename__ = "workouts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=True)
    gym_id = Column(Integer, ForeignKey("gyms.id"), nullable=True)
    is_master = Column(Boolean, default=False)
    parent_id = Column(Integer, ForeignKey("workouts.id"), nullable=True)
    active = Column(Boolean, default=True)

    # Relationships
    exercises = relationship("Exercise", back_populates="workout", cascade="all, delete-orphan")
    program = relationship("Program", back_populates="workouts")
    parent = relationship("Workout", remote_side=[id], back_populates="children")
    children = relationship("Workout", back_populates="parent", remote_side=[parent_id])
    gym = relationship("Gym", back_populates="workouts")
