from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class MockAnswerSubmitRequest(BaseModel):
    question_id: str
    question_text: str
    category: Optional[str] = "Technical"
    skill: Optional[str] = "General"
    key_points: Optional[List[str]] = []
    answer: str

class MockAnswerEvaluationResponse(BaseModel):
    score: int
    readiness: str
    feedback: str
    strengths: List[str]
    missingPoints: List[str]
    improvement: str

class MockSessionFinishRequest(BaseModel):
    answers: List[Dict[str, Any]]
