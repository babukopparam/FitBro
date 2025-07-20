from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.visitor import Visitor
from ..schemas.visitor import VisitorRead, VisitorCreate, VisitorUpdate
from ..models.membership_plan import MembershipPlan
from ..database import get_db
from ..dependencies import get_current_user

router = APIRouter(prefix="/visitors", tags=["Visitors"])

# List all visitors (for admin/instructor)
@router.get("/", response_model=List[VisitorRead])
def list_visitors(
    db: Session = Depends(get_db),
    gym_id: Optional[int] = Query(None)
):
    # Optionally filter by gym_id
    query = db.query(Visitor)
    if gym_id:
        query = query.filter(Visitor.gym_id == gym_id)
    return query.order_by(Visitor.created_at.desc()).all()

# Get visitor by ID
@router.get("/{visitor_id}", response_model=VisitorRead)
def get_visitor(visitor_id: int, db: Session = Depends(get_db)):
    visitor = db.query(Visitor).get(visitor_id)
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    return visitor

# List plans for a gym (used in frontend for visitor registration)
@router.get("/gym/{gym_id}/plans", response_model=List[dict])
def get_plans_for_gym(gym_id: int, db: Session = Depends(get_db)):
    plans = db.query(MembershipPlan).filter(MembershipPlan.gym_id == gym_id).all()
    return [{"id": p.id, "name": p.name, "description": getattr(p, "description", ""), "price": p.price} for p in plans]

# Register a new visitor
@router.post("/", response_model=VisitorRead)
def create_visitor(
    payload: VisitorCreate,
    db: Session = Depends(get_db),
    request: Request = None,
    current_user=Depends(get_current_user)  # For audit, not enforced
):
    gym_id = payload.gym_id
    # If gym_id missing, try to get from logged-in user, else fallback to 1
    if not gym_id:
        if hasattr(current_user, "gym_id") and current_user.gym_id:
            gym_id = current_user.gym_id
        else:
            gym_id = 1  # TODO: Remove hardcode for production

    # Duplicate check (only "Converted" is blocked)
    existing = db.query(Visitor).filter(
        Visitor.gym_id == gym_id, Visitor.mobile == payload.mobile
    ).order_by(Visitor.created_at.desc()).first()
    if existing:
        if existing.status == "Converted":
            raise HTTPException(status_code=400, detail=f"Mobile already registered & converted: {existing.first_name}, on {existing.created_at.date()}, goal: {existing.fitness_goal}")
        # If not converted, return a special message
        raise HTTPException(
            status_code=200,  # Not an error, UI should handle this
            detail=f"Welcome back {existing.first_name}. We remember your visit on {existing.created_at.date()} with fitness goal {existing.fitness_goal}"
        )

    visitor = Visitor(
        first_name=payload.first_name,
        last_name=payload.last_name,
        mobile=payload.mobile,
        email=payload.email,
        fitness_goal=payload.fitness_goal,
        interested_plan_id=payload.interested_plan_id,
        gym_id=gym_id,
        status="Contacted",
        created_by=getattr(current_user, "name", None) if current_user else None,
        updated_by=getattr(current_user, "name", None) if current_user else None,
    )
    db.add(visitor)
    db.commit()
    db.refresh(visitor)
    return visitor

# Update visitor (for status, comments, followup, conversion)
@router.put("/{visitor_id}", response_model=VisitorRead)
def update_visitor(
    visitor_id: int,
    payload: VisitorUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    visitor = db.query(Visitor).get(visitor_id)
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(visitor, k, v)
    visitor.updated_by = getattr(current_user, "name", None) if current_user else None
    db.commit()
    db.refresh(visitor)
    return visitor
