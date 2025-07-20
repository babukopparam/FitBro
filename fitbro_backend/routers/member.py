from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..schemas import MemberCreate, MemberRead, MemberUpdate
from ..models import Member, MembershipPlan
from ..database import get_db
from dateutil.relativedelta import relativedelta
from typing import List

router = APIRouter(
    prefix="/members",
    tags=["Members"]
)
@router.post("/", response_model=MemberRead)
def create_member(payload: MemberCreate, db: Session = Depends(get_db)):
    plan = db.query(MembershipPlan).filter(MembershipPlan.id == payload.membership_plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Membership plan not found")

    # Calculate membership_end_date
    # Assuming plan.duration_months is an integer
    start_date = payload.membership_start_date
    # Use relativedelta if available for exact month addition
    from dateutil.relativedelta import relativedelta
    end_date = start_date + relativedelta(months=plan.duration_months)

    member = Member(
        **payload.dict(exclude={"membership_end_date"}),  # don't use end_date from user!
        membership_end_date=end_date
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return member

@router.put("/{member_id}", response_model=MemberRead)
def update_member(member_id: int, payload: MemberUpdate, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    # If plan or start_date changes, recalculate end_date
    changed = False
    if payload.membership_plan_id or payload.membership_start_date:
        plan_id = payload.membership_plan_id or member.membership_plan_id
        plan = db.query(MembershipPlan).filter(MembershipPlan.id == plan_id).first()
        if not plan:
            raise HTTPException(status_code=404, detail="Membership plan not found")
        start_date = payload.membership_start_date or member.membership_start_date
        from dateutil.relativedelta import relativedelta
        member.membership_start_date = start_date
        member.membership_end_date = start_date + relativedelta(months=plan.duration_months)
        member.membership_plan_id = plan_id
        changed = True

    # Update other fields as needed
    for field, value in payload.dict(exclude_unset=True, exclude={"membership_plan_id", "membership_start_date"}).items():
        setattr(member, field, value)
        changed = True

    if changed:
        db.commit()
        db.refresh(member)
    return member

@router.get("/", response_model=List[MemberRead])
def list_members(db: Session = Depends(get_db)):
    return db.query(Member).all()
