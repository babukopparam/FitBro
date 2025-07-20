from pydantic import BaseModel
from typing import Optional

class AssessmentTemplateBase(BaseModel):
    name: str
    template_json: str  # JSON-encoded array of attributes

class AssessmentTemplateCreate(AssessmentTemplateBase):
    gym_id: Optional[int]
    is_master: Optional[bool] = True

class AssessmentTemplateRead(AssessmentTemplateBase):
    id: int
    gym_id: Optional[int]
    is_master: bool

    class Config:
        orm_mode = True

class AssessmentTemplateUpdate(BaseModel):
    name: Optional[str] = None
    template_json: Optional[str] = None
    gym_id: Optional[int] = None
    is_master: Optional[bool] = None
