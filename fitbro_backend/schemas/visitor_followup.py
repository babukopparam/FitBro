# schemas/visitor_followup.py - FIXED (Added missing VisitorFollowUpUpdate)
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class VisitorFollowUpCreate(BaseModel):
    comment: Optional[str]
    next_followup: Optional[date]
    status: Optional[str]

class VisitorFollowUpRead(VisitorFollowUpCreate):
    id: int
    created_at: datetime
    updated_by: Optional[int]

    class Config:
        orm_mode = True

class VisitorFollowUpUpdate(BaseModel):
    comment: Optional[str] = None
    next_followup: Optional[date] = None
    status: Optional[str] = None
