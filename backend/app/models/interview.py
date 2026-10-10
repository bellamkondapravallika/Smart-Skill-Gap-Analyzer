from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey, Float, Boolean
from ..database import Base

class MockInterviewSession(Base):
    __tablename__ = "mock_interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False, index=True)
    
    total_questions = Column(Integer, default=0)
    completed_questions = Column(Integer, default=0)
    overall_readiness_score = Column(Float, default=0.0)
    
    answers = Column(JSON, default=list) # [{ question_id, question, answer, feedback, score, strengths, missing_points, improvements }]
    summary_verdict = Column(Text, nullable=True)
    is_completed = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
