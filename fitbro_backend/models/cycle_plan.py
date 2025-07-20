from sqlalchemy import Column, Integer, Date, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class CyclePlan(Base):
    __tablename__ = "cycle_plans"
    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    cycle_number = Column(Integer, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    duration = Column(Integer, nullable=False, default=30)
    status = Column(String, default="Future")  # "Active", "Completed", "Terminated", "Future"
    is_deleted = Column(Boolean, default=False)

    member = relationship("Member", back_populates="cycle_plans")
