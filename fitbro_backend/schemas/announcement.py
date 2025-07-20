# schemas/announcement.py - FIXED (Added missing AnnouncementUpdate)
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AnnouncementBase(BaseModel):
    gym_id: int
    title: str
    message: str

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementRead(AnnouncementBase):
    id: int
    posted_at: datetime
    created_by: int

    class Config:
        orm_mode = True

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None