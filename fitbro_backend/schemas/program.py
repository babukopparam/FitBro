# schemas/program.py - FIXED (Added missing ProgramUpdate)
from pydantic import BaseModel, field_validator
from typing import Optional, List

class ProgramBase(BaseModel):
    name: str
    description: Optional[str] = None
    gym_id: Optional[int] = None
    is_master: Optional[bool] = True
    parent_id: Optional[int] = None
    goals: Optional[str] = None
    status: Optional[str] = "Active"
    workouts: Optional[List[int]] = []

class ProgramCreate(ProgramBase):
    pass

class ProgramRead(ProgramBase):
    id: int

    # If using Pydantic v2
    @field_validator('workouts', mode="before")
    def extract_workout_ids(cls, v):
        # v is a list of ORM Workout objects
        if v and isinstance(v[0], dict):  # Already serialized
            return [w['id'] for w in v]
        if v and hasattr(v[0], 'id'):
            return [w.id for w in v]
        return v

    class Config:
        from_attributes = True  # Pydantic v2 replacement for orm_mode

class ProgramUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    gym_id: Optional[int] = None
    is_master: Optional[bool] = None
    parent_id: Optional[int] = None
    goals: Optional[str] = None
    status: Optional[str] = None
    workouts: Optional[List[int]] = None