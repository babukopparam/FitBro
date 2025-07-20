from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..schemas.membership_plan import MembershipPlanRead, MembershipPlanCreate
from ..models.membership_plan import MembershipPlan
from ..models.program import Program
from ..database import get_db

router = APIRouter(prefix="/membership-plans", tags=["Membership Plans"])

@router.get("/", response_model=List[MembershipPlanRead])
def list_plans(db: Session = Depends(get_db)):
    return db.query(MembershipPlan).all()

@router.post("/", response_model=MembershipPlanRead)
def create_plan(payload: MembershipPlanCreate, db: Session = Depends(get_db)):
    gym_id = payload.gym_id or 1
    data = payload.dict(exclude_unset=True)
    program_ids = data.pop("program_ids", [])
    data["gym_id"] = gym_id
    plan = MembershipPlan(**data)
    # Link programs
    if program_ids:
        programs = db.query(Program).filter(Program.id.in_(program_ids)).all()
        plan.programs = programs
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan

@router.get("/{plan_id}", response_model=MembershipPlanRead)
def get_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(MembershipPlan).get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Membership plan not found")
    return plan

@router.put("/{plan_id}", response_model=MembershipPlanRead)
def update_plan(plan_id: int, payload: MembershipPlanCreate, db: Session = Depends(get_db)):
    plan = db.query(MembershipPlan).get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Membership plan not found")
    data = payload.dict(exclude_unset=True)
    program_ids = data.pop("program_ids", None)
    for k, v in data.items():
        setattr(plan, k, v)
    # Update programs association
    if program_ids is not None:
        plan.programs = db.query(Program).filter(Program.id.in_(program_ids)).all()
    db.commit()
    db.refresh(plan)
    return plan
