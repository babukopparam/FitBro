from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..models.visitor import Visitor
from ..models.visitor_followup import VisitorFollowUp
from ..models.user import User
from ..schemas.visitor_followup import VisitorFollowUpCreate, VisitorFollowUpRead
from ..database import get_db
from ..dependencies import get_current_user

router = APIRouter(prefix="/visitor-followup", tags=["Visitor FollowUp"])

@router.post("/{visitor_id}/", response_model=VisitorFollowUpRead)
def add_followup(visitor_id: int, payload: VisitorFollowUpCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    visitor = db.query(Visitor).get(visitor_id)
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    followup = VisitorFollowUp(
        visitor_id=visitor_id,
        comment=payload.comment,
        next_followup=payload.next_followup,
        status=payload.status,
        updated_by=getattr(current_user, "id", None)
    )
    db.add(followup)
    # Optionally, update Visitor with latest status
    visitor.status = payload.status or visitor.status
    db.commit()
    db.refresh(followup)
    return followup

@router.get("/{visitor_id}/", response_model=List[VisitorFollowUpRead])
def list_followups(visitor_id: int, db: Session = Depends(get_db)):
    followups = db.query(VisitorFollowUp).filter_by(visitor_id=visitor_id).order_by(VisitorFollowUp.created_at.desc()).all()
    return followups
