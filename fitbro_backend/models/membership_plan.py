from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Table, Text
from sqlalchemy.orm import relationship
from ..database import Base

# Association table for many-to-many: MembershipPlan <-> Program
membership_plan_program = Table(
    "membership_plan_program",
    Base.metadata,
    Column("plan_id", Integer, ForeignKey("membership_plans.id"), primary_key=True),
    Column("program_id", Integer, ForeignKey("programs.id"), primary_key=True),
)


class MembershipPlan(Base):
    __tablename__ = "membership_plans"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    duration_months = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    plan_type = Column(String, default="Regular")
    offer_start_date = Column(Date)
    offer_end_date = Column(Date)
    offer_terms = Column(String)
    status = Column(String, default="Active")
    gym_id = Column(Integer, ForeignKey("gyms.id"), nullable=False)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)

    gym = relationship("Gym", back_populates="membership_plans")
    members = relationship("Member", back_populates="membership_plan")
    programs = relationship(
        "Program",
        secondary=membership_plan_program,
        back_populates="membership_plans"
    )
