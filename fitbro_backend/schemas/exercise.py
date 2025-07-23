from pydantic import BaseModel
from typing import Optional

class ExerciseBase(BaseModel):
    name: str
    description: Optional[str]
    workout_id: int
    is_time_based: Optional[bool] = False
    primary_muscles: Optional[str]
    secondary_muscles: Optional[str]
    equipment_id: Optional[int]

class ExerciseCreate(ExerciseBase):
    gym_id: Optional[int]
    is_master: Optional[bool] = False
    parent_id: Optional[int]
    is_enabled: Optional[bool] = True

class ExerciseRead(ExerciseBase):
    id: int
    gym_id: Optional[int]
    is_master: bool
    parent_id: Optional[int]
    is_enabled: bool

    class Config:
        orm_mode = True

class ExerciseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    workout_id: Optional[int] = None
    is_time_based: Optional[bool] = None
    primary_muscles: Optional[str] = None
    secondary_muscles: Optional[str] = None
    equipment_id: Optional[int] = None
    gym_id: Optional[int] = None
    is_master: Optional[bool] = None
    parent_id: Optional[int] = None
    is_enabled: Optional[bool] = None
