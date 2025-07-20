# schemas/workout.py - FIXED (Added missing WorkoutUpdate)
from pydantic import BaseModel, ConfigDict
from typing import Optional

class WorkoutBase(BaseModel):
    name: str
    description: Optional[str] = None

class WorkoutCreate(WorkoutBase):
    program_id: int
    gym_id: Optional[int] = None
    is_master: Optional[bool] = False
    parent_id: Optional[int] = None
    active: Optional[bool] = True

class WorkoutRead(WorkoutBase):
    id: int
    program_id: int
    gym_id: Optional[int] = None
    is_master: bool
    parent_id: Optional[int] = None
    active: bool

    model_config = ConfigDict(from_attributes=True)  # Pydantic v2 replacement for orm_mode

class WorkoutUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    program_id: Optional[int] = None
    gym_id: Optional[int] = None
    is_master: Optional[bool] = None
    parent_id: Optional[int] = None
    active: Optional[bool] = None