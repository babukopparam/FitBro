from pydantic import BaseModel
from typing import Optional
from datetime import date

class CyclePlanBase(BaseModel):
    member_id: int
    cycle_number: int
    start_date: date
    end_date: date
    duration: int
    status: str = "Future"

class CyclePlanCreate(CyclePlanBase):
    pass

class CyclePlanUpdate(CyclePlanBase):
    pass

class CyclePlanRead(CyclePlanBase):
    id: int
    is_deleted: Optional[bool] = False
    class Config:
        orm_mode = True
