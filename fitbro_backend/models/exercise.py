from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from ..database import Base

class Exercise(Base):
    __tablename__ = "exercises"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    primary_muscles = Column(String(64), nullable=True)
    secondary_muscles = Column(String(64), nullable=True)
    is_time_based = Column(Boolean, default=False)
    workout_id = Column(Integer, ForeignKey("workouts.id"), nullable=False)
    gym_id = Column(Integer, ForeignKey("gyms.id"), nullable=True)
    is_master = Column(Boolean, default=False)
    parent_id = Column(Integer, ForeignKey("exercises.id"), nullable=True)
    is_enabled = Column(Boolean, default=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=True)

    # Relationships
    workout = relationship("Workout", back_populates="exercises")
    gym = relationship("Gym", back_populates="exercises")
    equipment = relationship("Equipment", back_populates="exercises")
    parent = relationship("Exercise", remote_side=[id])
