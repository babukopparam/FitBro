from pydantic import BaseModel
from typing import Optional
from datetime import date

class AssessmentResultBase(BaseModel):
    member_id: int
    template_id: int
    taken_at: date
    result_json: str  # JSON-encoded dict: {attr_name: value, ...}

class AssessmentResultCreate(AssessmentResultBase):
    pass

class AssessmentResultRead(AssessmentResultBase):
    id: int

    class Config:
        orm_mode = True

class AssessmentResultUpdate(BaseModel):
    member_id: Optional[int] = None
    template_id: Optional[int] = None
    taken_at: Optional[date] = None
    result_json: Optional[str] = None
