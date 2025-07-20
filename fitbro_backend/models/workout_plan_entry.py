from sqlalchemy import Column, Integer, ForeignKey, Date, Float, String
from ..database import Base
from sqlalchemy.orm import relationship

class WorkoutPlanEntry(Base):
    __tablename__ = "workout_plan_entries"

    id = Column(Integer, primary_key=True, index=True)
    cycle_plan_id = Column(Integer, ForeignKey("cycle_plans.id"), nullable=False)
    day_date = Column(Date, nullable=False, index=True)
    workout_id = Column(Integer, ForeignKey("workouts.id"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)

    planned_sets = Column(Integer, nullable=True)
    planned_reps = Column(Integer, nullable=True)
    planned_weight = Column(Float, nullable=True)
    planned_minutes = Column(Integer, nullable=True)
    planned_rpe = Column(Integer, nullable=True)
    planned_notes = Column(String, nullable=True)

    cycle_plan = relationship("CyclePlan")
    workout = relationship("Workout")
    exercise = relationship("Exercise")
