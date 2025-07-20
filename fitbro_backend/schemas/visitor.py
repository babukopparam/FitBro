# schemas/visitor.py - FIXED (Removed circular import)
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class VisitorBase(BaseModel):
    first_name: str
    last_name: Optional[str] = ""
    mobile: str
    email: Optional[str] = None
    fitness_goal: Optional[str] = ""
    interested_plan_id: Optional[int] = None  # Nullable, optional
    comments: Optional[str] = ""
    last_followup: Optional[date] = None

class VisitorCreate(VisitorBase):
    gym_id: Optional[int] = None  # Required for direct API, auto-resolved from login in UI

class VisitorUpdate(BaseModel):
    status: Optional[str] = None  # Contacted/Converted/Not Interested
    comments: Optional[str] = None
    last_followup: Optional[date] = None

class VisitorRead(VisitorBase):
    id: int
    gym_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    followups: List["VisitorFollowUpRead"] = []

    class Config:
        orm_mode = True

# Forward reference resolution
from .visitor_followup import VisitorFollowUpRead
VisitorRead.model_rebuild()