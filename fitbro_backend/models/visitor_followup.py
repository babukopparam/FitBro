from sqlalchemy import Column, Integer, String, ForeignKey, Date, DateTime, Text
from sqlalchemy.orm import relationship
from ..database import Base
import datetime

class VisitorFollowUp(Base):
    __tablename__ = "visitor_followups"
    id = Column(Integer, primary_key=True, index=True)
    visitor_id = Column(Integer, ForeignKey("visitors.id"), nullable=False)
    comment = Column(Text, nullable=True)  # Changed from String to Text for longer comments
    next_followup = Column(Date, nullable=True)
    status = Column(String(32), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    visitor = relationship("Visitor", back_populates="followups")
    created_by_user = relationship("User", foreign_keys=[created_by])
    updated_by_user = relationship("User", foreign_keys=[updated_by])