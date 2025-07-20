# schemas/gym.py
from pydantic import BaseModel
from typing import Optional
from datetime import date

class GymBase(BaseModel):
    name: str
    address: Optional[str] = None
    contract_start: Optional[date] = None
    contract_end: Optional[date] = None
    recurring_revenue_start: Optional[date] = None
    owner_mobile: str
    owner_name: str        # NEW, required for user creation
    owner_email: str       # NEW, required for user creation

class GymCreate(GymBase):
    pass

class GymUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    contract_start: Optional[date] = None
    contract_end: Optional[date] = None
    recurring_revenue_start: Optional[date] = None
    is_active: Optional[bool] = None
    logo_url: Optional[str] = None
    owner_mobile: Optional[str] = None  # For re-assigning owner
    owner_name: Optional[str] = None
    owner_email: Optional[str] = None

class GymAssignOwner(BaseModel):
    owner_mobile: str

class GymRead(GymBase):
    id: int
    is_active: bool
    logo_url: Optional[str] = None

    class Config:
        orm_mode = True
