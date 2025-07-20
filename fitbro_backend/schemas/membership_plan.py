from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date

class MembershipPlanBase(BaseModel):
    name: str
    description: Optional[str] = None
    duration_months: int
    price: float
    plan_type: str = "Regular"
    offer_start_date: Optional[date] = None
    offer_end_date: Optional[date] = None
    offer_terms: Optional[str] = None
    status: Optional[str] = "Active"
    gym_id: int
    program_ids: Optional[List[int]] = []
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class MembershipPlanCreate(MembershipPlanBase):
    pass

class MembershipPlanUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    duration_months: Optional[int]
    price: Optional[float]
    plan_type: Optional[str]
    offer_start_date: Optional[date]
    offer_end_date: Optional[date]
    offer_terms: Optional[str]
    status: Optional[str]
    gym_id: Optional[int]
    program_ids: Optional[List[int]] = []
    start_date: Optional[date]
    end_date: Optional[date]

class MembershipPlanRead(MembershipPlanBase):
    id: int

    class Config:
        orm_mode = True
