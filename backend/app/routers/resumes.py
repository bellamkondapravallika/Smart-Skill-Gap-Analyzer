from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from ..database import get_db
from ..models.user import User
from ..models.resume import Resume
from ..models.job import TargetJob
from ..schemas.resume import (
    ResumeListItem,
    ResumeAnalysisResponse,
    ImproveBulletRequest,
    ImproveBulletResponse,
    ImproveProjectRequest
)
from ..utils.security import get_current_user
from ..utils.pdf_extractor import extract_text_from_pdf_bytes
from ..utils.docx_extractor import extract_text_from_docx_bytes
from ..services.resume_validator import ResumeValidationService
from ..services.resume_parser import parse_resume
from ..services.resume_analyzer import analyze_resume_data
from ..services.resume_improver import improve_bullet_point, improve_project_description
from ..services.roadmap_generator import generate_dynamic_roadmap
from ..services.interview_generator import generate_dynamic_interview_questions

router = APIRouter(prefix="/resumes", tags=["Resumes"])

def build_analysis_response(resume: Resume, db: Session) -> dict:
    target_job = db.query(TargetJob).filter(TargetJob.resume_id == resume.id).order_by(TargetJob.id.desc()).first()
    
    target_job_dict = None
    job_match_dict = None
    active_gaps = []

    if target_job:
        target_job_dict = {
            "id": target_job.id,
            "title": target_job.job_title,
            "company": target_job.company,
            "description": target_job.description,
            "url": target_job.url,
            "overallMatch": target_job.overall_match,
            "skillMatch": target_job.skill_match,
            "keywordMatch": target_job.keyword_match,
            "experienceMatch": target_job.experience_match
        }
        job_match_dict = {
            "jobTitle": target_job.job_title,
            "company": target_job.company,
            "overallMatch": target_job.overall_match,
            "skillMatch": target_job.skill_match,
            "keywordMatch": target_job.keyword_match,
            "experienceMatch": target_job.experience_match,
            "matchedSkills": target_job.matched_skills or [],
            "missingSkills": target_job.missing_skills or [],
            "partialMatches": target_job.partial_matches or [],
            "skillGaps": target_job.skill_gaps or [],
        }
        active_gaps = target_job.skill_gaps or []

    word_count = len(resume.raw_text.split()) if resume.raw_text else 0

    return {
        "id": resume.id,
        "file_name": resume.file_name,
        "file_size": resume.file_size,
        "file_type": resume.file_type,
        "word_count": word_count,
        "uploaded_at": resume.created_at.strftime("%b %d, %Y"),
        "target_role": resume.target_role,
        "candidate_name": resume.candidate_name,
        "contact_info": resume.contact_info or {},
        "sections": resume.sections or {},
        "detected_skills": resume.detected_skills or {},
        "scores": resume.scores or {},
        "summary_verdict": resume.summary_verdict,
        "strengths": resume.strengths or [],
        "weaknesses": resume.weaknesses or [],
        "recommendations": resume.recommendations or [],
        "content_improvements": resume.content_improvements or [],
        "roadmap": resume.roadmap or [],
        "interview_questions": resume.interview_questions or [],
        "target_job": target_job_dict,
        "job_match": job_match_dict,
        "skill_gaps": active_gaps
    }

@router.post("/upload", response_model=ResumeAnalysisResponse)
async def upload_resume(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None),
    target_role: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    extracted_text = ""
    file_name = "Pasted_Resume.txt"
    file_size = "0 KB"
    file_type = "TEXT"

    if file:
        file_name = file.filename
        file_bytes = await file.read()
        
        if len(file_bytes) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds the 10 MB limit."
            )
            
        file_size = f"{len(file_bytes) / 1024:.1f} KB" if len(file_bytes) < 1024 * 1024 else f"{len(file_bytes) / (1024 * 1024):.2f} MB"
        lower_name = file.filename.lower()

        if lower_name.endswith(".pdf"):
            file_type = "PDF"
            try:
                extracted_text = extract_text_from_pdf_bytes(file_bytes)
            except Exception as e:
                raise HTTPException(status_code=400, detail=str(e))
        elif lower_name.endswith(".docx"):
            file_type = "DOCX"
            try:
                extracted_text = extract_text_from_docx_bytes(file_bytes)
            except Exception as e:
                raise HTTPException(status_code=400, detail=str(e))
        elif lower_name.endswith(".txt"):
            file_type = "TXT"
            extracted_text = file_bytes.decode("utf-8", errors="ignore")
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported format. Please upload a valid PDF or DOCX file."
            )
    elif raw_text and raw_text.strip():
        extracted_text = raw_text.strip()
        file_size = f"{len(extracted_text.encode('utf-8')) / 1024:.1f} KB"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file or resume text provided."
        )

    # 1. RESUME VALIDATION (Requirement 3: Verify document resembles a resume/CV BEFORE scoring)
    validation = ResumeValidationService.validate_document_text(extracted_text)
    if not validation["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="This doesn't appear to be a resume. Please upload a valid resume or CV in PDF or DOCX format."
        )

    # 2. Parse Structured Resume Data (Requirement 4)
    parsed = parse_resume(extracted_text)

    # Effective target role (do NOT fabricate a fake target role if user provided none)
    role_to_use = target_role if target_role and target_role.strip() else parsed.get("candidate_name", "Software Engineer")
    if not target_role or not target_role.strip():
        target_role = None

    # 3. Analyze Dynamic Scores & Insights (Requirement 5)
    analysis = analyze_resume_data(parsed, target_role=role_to_use or "Software Engineer")

    # 4. Roadmap and Interview Preparation (No fake gaps fabricated)
    baseline_gaps = []  # No fake gaps (e.g. no forced TypeScript/Docker if no job requires it)
    tech_skills = parsed["detected_skills"].get("technical", [])
    roadmap = generate_dynamic_roadmap(baseline_gaps, tech_skills, role_to_use or "Software Engineer")

    # 5. Dynamic Interview Questions (anchored in actual resume technologies)
    questions = generate_dynamic_interview_questions(
        parsed["detected_skills"],
        baseline_gaps,
        parsed["sections"],
        role_to_use or "Software Engineer"
    )

    scores_data = {
        "overall": analysis["overallScore"],
        "ats": analysis["atsScore"],
        "jobMatch": None,  # None until user provides target job
        "skillsCount": parsed["detected_skills"]["count"],
        "improvementsCount": analysis["improvementsCount"],
        "categories": analysis["categories"]
    }

    # 6. Persist to Database
    db_resume = Resume(
        user_id=current_user.id,
        file_name=file_name,
        file_size=file_size,
        file_type=file_type,
        raw_text=extracted_text,
        candidate_name=parsed["candidate_name"],
        target_role=target_role,
        contact_info=parsed["contact_info"],
        sections=parsed["sections"],
        detected_skills=parsed["detected_skills"],
        scores=scores_data,
        summary_verdict=analysis["summaryVerdict"],
        strengths=analysis["strengths"],
        weaknesses=analysis["improvements"],
        recommendations=analysis["improvements"],
        content_improvements=analysis["contentImprovements"],
        roadmap=roadmap,
        interview_questions=questions
    )

    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)

    return build_analysis_response(db_resume, db)

@router.get("", response_model=List[ResumeListItem])
def list_user_resumes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.id.desc()).all()
    results = []
    for r in resumes:
        scores = r.scores or {}
        results.append({
            "id": r.id,
            "file_name": r.file_name,
            "file_size": r.file_size,
            "file_type": r.file_type,
            "candidate_name": r.candidate_name,
            "target_role": r.target_role,
            "created_at": r.created_at,
            "overall_score": scores.get("overall"),
            "ats_score": scores.get("ats"),
            "skills_count": scores.get("skillsCount"),
        })
    return results

@router.get("/latest", response_model=Optional[ResumeAnalysisResponse])
def get_latest_resume(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.id.desc()).first()
    if not resume:
        return None
    return build_analysis_response(resume, db)

@router.get("/{resume_id}", response_model=ResumeAnalysisResponse)
def get_resume(resume_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume analysis not found.")
    return build_analysis_response(resume, db)

@router.delete("/{resume_id}")
def delete_resume(resume_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted successfully"}

# ==========================================
# FACT-PRESERVING REWRITE ENDPOINTS (Requirements 10, 11, 12, 21)
# ==========================================
@router.post("/improve-bullet", response_model=ImproveBulletResponse)
def api_improve_bullet(payload: ImproveBulletRequest):
    """
    Fact-preserving bullet point rewrite.
    Never invents metrics, percentages, users, or technologies.
    """
    result = improve_bullet_point(payload.bullet, payload.context_tech)
    return result

@router.post("/improve-project")
def api_improve_project(payload: ImproveProjectRequest):
    """
    Fact-preserving project description rewrite.
    """
    result = improve_project_description(payload.title, payload.description, payload.tech_stack)
    return result
