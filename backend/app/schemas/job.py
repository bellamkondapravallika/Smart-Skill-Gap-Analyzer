from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class JobCreateRequest(BaseModel):
    resume_id: int
    job_title: str
    company: Optional[str] = "Target Company"
    description: str
    url: Optional[str] = None

class JobMatchResponse(BaseModel):
    id: Optional[int] = None
    job_title: str
    company: str
    description: str
    overall_match: int
    skill_match: int
    keyword_match: int
    experience_match: int
    matched_skills: List[str]
    missing_skills: List[str]
    partial_matches: List[Dict[str, Any]]
    skill_gaps: List[Dict[str, Any]]
    strong_evidence: Optional[List[str]] = None
    weak_evidence: Optional[List[str]] = None
    you_already_have: Optional[List[str]] = None
    updated_roadmap: Optional[List[Dict[str, Any]]] = None
    updated_interview_questions: Optional[List[Dict[str, Any]]] = None
