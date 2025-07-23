from sqlalchemy import Column, Integer, ForeignKey, String, Date
from sqlalchemy.orm import relationship
from ..database import Base

class WorkoutLog(Base):
    __tablename__ = "workout_logs"
    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"))
    cycle_plan_id = Column(Integer, ForeignKey("cycle_plans.id"))
    workout_plan_entry_id = Column(Integer, ForeignKey("workout_plan_entries.id"))
    actual_sets = Column(Integer, nullable=True)
    actual_reps = Column(Integer, nullable=True)
    actual_weight = Column(Integer, nullable=True)
    actual_minutes = Column(Integer, nullable=True)
    actual_rpe = Column(Integer, nullable=True)
    actual_notes = Column(String, nullable=True)
    status = Column(String(32), nullable=True)
    workout_date = Column(Date)

    member = relationship("Member")
    cycle_plan = relationship("CyclePlan")
    workout_plan_entry = relationship("WorkoutPlanEntry")
