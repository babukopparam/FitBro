from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class AssessmentResult(Base):
    __tablename__ = "assessment_results"
    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    template_id = Column(Integer, ForeignKey("assessment_templates.id"), nullable=False)
    taken_at = Column(Date, nullable=False)
    result_json = Column(Text, nullable=False)  # JSON string: results per attribute
    # Optionally:
    # member = relationship("Member")
    # template = relationship("AssessmentTemplate")
    member = relationship("Member", back_populates="assessment_results")
    template = relationship("AssessmentTemplate")