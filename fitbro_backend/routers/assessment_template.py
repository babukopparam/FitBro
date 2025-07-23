from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..schemas.assessment_template import (
    AssessmentTemplateRead, AssessmentTemplateCreate, AssessmentTemplateUpdate
)
from ..models.assessment_template import AssessmentTemplate
from ..database import get_db

router = APIRouter(prefix="/assessment-templates", tags=["AssessmentTemplates"])

@router.get("/", response_model=List[AssessmentTemplateRead])
def list_templates(db: Session = Depends(get_db)):
    return db.query(AssessmentTemplate).all()

@router.post("/", response_model=AssessmentTemplateRead)
def create_template(payload: AssessmentTemplateCreate, db: Session = Depends(get_db)):
    tpl = AssessmentTemplate(**payload.dict())
    db.add(tpl)
    db.commit()
    db.refresh(tpl)
    return tpl

@router.patch("/{template_id}", response_model=AssessmentTemplateRead)
def update_template(template_id: int, payload: AssessmentTemplateUpdate, db: Session = Depends(get_db)):
    tpl = db.query(AssessmentTemplate).filter_by(id=template_id).first()
    if not tpl:
        raise HTTPException(status_code=404, detail="Template not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(tpl, field, value)
    db.commit()
    db.refresh(tpl)
    return tpl

@router.delete("/{template_id}")
def delete_template(template_id: int, db: Session = Depends(get_db)):
    tpl = db.query(AssessmentTemplate).filter_by(id=template_id).first()
    if not tpl:
        raise HTTPException(status_code=404, detail="Template not found")
    db.delete(tpl)
    db.commit()
    return {"detail": "Deleted"}
