from pydantic import BaseModel
from typing import Optional
from datetime import date

class WorkoutLogBase(BaseModel):
    member_id: int
    cycle_plan_id: int
    workout_plan_entry_id: int
    actual_sets: Optional[int]
    actual_reps: Optional[int]
    actual_weight: Optional[int]
    actual_minutes: Optional[int]
    actual_rpe: Optional[int]
    actual_notes: Optional[str]
    status: Optional[str]
    workout_date: date

class WorkoutLogCreate(WorkoutLogBase):
    pass

class WorkoutLogRead(WorkoutLogBase):
    id: int

    class Config:
        orm_mode = True

class WorkoutLogUpdate(BaseModel):
    member_id: Optional[int] = None
    cycle_plan_id: Optional[int] = None
    workout_plan_entry_id: Optional[int] = None
    actual_sets: Optional[int] = None
    actual_reps: Optional[int] = None
    actual_weight: Optional[int] = None
    actual_minutes: Optional[int] = None
    actual_rpe: Optional[int] = None
    actual_notes: Optional[str] = None
    status: Optional[str] = None
    workout_date: Optional[date] = None
