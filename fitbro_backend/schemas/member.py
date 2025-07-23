from pydantic import BaseModel
from datetime import date
from typing import Optional

class MemberBase(BaseModel):
    name: str
    mobile: str
    email: str
    photo_url: str
    dob: date
    gender: str
    address: str
    join_date: date
    gym_id: int
    membership_plan_id: int
    active: bool = True
    membership_start_date: date   # <--- NEW
    membership_end_date: date     # <--- NEW

class MemberCreate(MemberBase):
    pass

class MemberRead(MemberBase):
    id: int
    class Config:
        orm_mode = True

class MemberUpdate(BaseModel):
    # All fields optional for PATCH
    name: str = None
    name: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    photo_url: Optional[str] = None
    dob: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    join_date: Optional[date] = None
    active: Optional[bool] = None
    gym_id: Optional[int] = None
    membership_plan_id: Optional[int] = None
    membership_start_date: date = None
    membership_plan_id: int = None


class MembershipPlanBrief(BaseModel):
    id: int
    name: str
    start_date: Optional[date]
    end_date: Optional[date]

    class Config:
        orm_mode = True
