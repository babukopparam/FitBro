from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..schemas import AnnouncementCreate, AnnouncementRead
from ..models import Announcement
from ..database import get_db
from ..dependencies import get_current_user

router = APIRouter(prefix="/announcements", tags=["Announcements"])

@router.get("/", response_model=List[AnnouncementRead])
def list_announcements(db: Session = Depends(get_db)):
    return db.query(Announcement).order_by(Announcement.posted_at.desc()).all()

@router.post("/", response_model=AnnouncementRead)
def create_announcement(payload: AnnouncementCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    ann = Announcement(**payload.dict(), created_by=user.id)
    db.add(ann)
    db.commit()
    db.refresh(ann)
    return ann
