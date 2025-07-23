from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..schemas.assessment_result import (
    AssessmentResultRead, AssessmentResultCreate, AssessmentResultUpdate
)
from ..models.assessment_result import AssessmentResult
from ..database import get_db

router = APIRouter(prefix="/assessment-results", tags=["AssessmentResults"])

@router.get("/", response_model=List[AssessmentResultRead])
def list_results(db: Session = Depends(get_db)):
    return db.query(AssessmentResult).all()

@router.post("/", response_model=AssessmentResultRead)
def create_result(payload: AssessmentResultCreate, db: Session = Depends(get_db)):
    result = AssessmentResult(**payload.dict())
    db.add(result)
    db.commit()
    db.refresh(result)
    return result

@router.patch("/{result_id}", response_model=AssessmentResultRead)
def update_result(result_id: int, payload: AssessmentResultUpdate, db: Session = Depends(get_db)):
    result = db.query(AssessmentResult).filter_by(id=result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(result, field, value)
    db.commit()
    db.refresh(result)
    return result

@router.delete("/{result_id}")
def delete_result(result_id: int, db: Session = Depends(get_db)):
    result = db.query(AssessmentResult).filter_by(id=result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    db.delete(result)
    db.commit()
    return {"detail": "Deleted"}
