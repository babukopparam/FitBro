# user.py - FitBro user schemas

from pydantic import BaseModel
from typing import Optional
from enum import Enum

class RoleEnum(str, Enum):
    admin = "FitBro Admin"
    officer = "FitBro Officer"
    gym_owner = "Gym Owner"
    instructor = "Gym Instructor"
    officer_gym = "Gym Officer"
    member = "Gym Member"

class UserBase(BaseModel):
    name: str
    mobile: str
    email: Optional[str]
    role: RoleEnum
    gym_id: Optional[int]

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    role: Optional[RoleEnum] = None
    gym_id: Optional[int] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
