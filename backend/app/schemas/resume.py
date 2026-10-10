from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ResumeUploadTextRequest(BaseModel):
    raw_text: str
    file_name: Optional[str] = "Pasted_Resume.txt"
    target_role: Optional[str] = None

class ResumeListItem(BaseModel):
    id: int
    file_name: str
    file_size: str
    file_type: str
    candidate_name: Optional[str]
    target_role: Optional[str] = None
    created_at: datetime
    overall_score: Optional[int] = None
    ats_score: Optional[int] = None
    skills_count: Optional[int] = None

class ResumeAnalysisResponse(BaseModel):
    id: int
    file_name: str
    file_size: str
    file_type: str
    word_count: int
    uploaded_at: str
    target_role: Optional[str] = None
    candidate_name: Optional[str]
    contact_info: Dict[str, Any]
    sections: Dict[str, Any]
    detected_skills: Dict[str, Any]
    scores: Dict[str, Any]
    summary_verdict: Optional[str]
    strengths: List[Dict[str, Any]]
    weaknesses: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]
    content_improvements: List[Dict[str, Any]]
    roadmap: List[Dict[str, Any]]
    interview_questions: List[Dict[str, Any]]
    target_job: Optional[Dict[str, Any]] = None
    job_match: Optional[Dict[str, Any]] = None
    skill_gaps: Optional[List[Dict[str, Any]]] = None

class ImproveBulletRequest(BaseModel):
    bullet: str
    context_tech: Optional[str] = None

class ImproveBulletResponse(BaseModel):
    original: str
    improved: str
    has_existing_metric: bool
    existing_metrics: List[str] = []
    optional_metric_prompt: Optional[str] = None
    enhancement_notes: str

class ImproveProjectRequest(BaseModel):
    title: Optional[str] = ""
    description: Optional[str] = ""
    tech_stack: Optional[str] = None
