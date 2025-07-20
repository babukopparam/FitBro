from pydantic import BaseModel
from typing import Optional
from datetime import date

class WorkoutPlanEntryBase(BaseModel):
    cycle_plan_id: int
    day_date: date
    workout_id: int
    exercise_id: int
    planned_sets: Optional[int] = None
    planned_reps: Optional[int] = None
    planned_weight: Optional[float] = None
    planned_minutes: Optional[int] = None
    planned_rpe: Optional[int] = None
    planned_notes: Optional[str] = None

class WorkoutPlanEntryCreate(WorkoutPlanEntryBase):
    pass

class WorkoutPlanEntryUpdate(BaseModel):
    day_date: Optional[date] = None
    workout_id: Optional[int] = None
    exercise_id: Optional[int] = None
    planned_sets: Optional[int] = None
    planned_reps: Optional[int] = None
    planned_weight: Optional[float] = None
    planned_minutes: Optional[int] = None
    planned_rpe: Optional[int] = None
    planned_notes: Optional[str] = None

class WorkoutPlanEntryRead(WorkoutPlanEntryBase):
    id: int

    class Config:
        orm_mode = True

