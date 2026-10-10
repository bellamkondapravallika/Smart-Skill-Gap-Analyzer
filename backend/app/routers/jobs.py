from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.user import User
from ..models.resume import Resume
from ..models.job import TargetJob
from ..schemas.job import JobCreateRequest, JobMatchResponse
from ..utils.security import get_current_user
from ..services.job_matcher import calculate_job_match
from ..services.roadmap_generator import generate_dynamic_roadmap
from ..services.interview_generator import generate_dynamic_interview_questions

router = APIRouter(prefix="/jobs", tags=["Target Jobs"])

@router.post("", response_model=JobMatchResponse)
def create_and_match_job(
    data: JobCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(
        Resume.id == data.resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found. Please upload a resume first."
        )

    if not data.description or not data.description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Add the actual job description to calculate an accurate match."
        )

    match_result = calculate_job_match(
        detected_resume_skills=resume.detected_skills or {},
        job_description=data.description,
        job_title=data.job_title,
        company_name=data.company or "Target Company",
        sections=resume.sections or {}
    )

    if not match_result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not analyze job description. Please provide a detailed description."
        )

    # 1. Regenerate Roadmap adapted strictly to the new skill gaps
    tech_skills = (resume.detected_skills or {}).get("technical", [])
    updated_roadmap = generate_dynamic_roadmap(
        skill_gaps=match_result["skillGaps"],
        candidate_skills=tech_skills,
        target_role=data.job_title
    )

    # 2. Regenerate Interview Prep incorporating target role and skill gaps
    updated_questions = generate_dynamic_interview_questions(
        detected_skills=resume.detected_skills or {},
        skill_gaps=match_result["skillGaps"],
        sections=resume.sections or {},
        target_role=data.job_title
    )

    # 3. Update Resume state in database
    current_scores = dict(resume.scores or {})
    current_scores["jobMatch"] = match_result["overallMatch"]
    resume.scores = current_scores
    resume.roadmap = updated_roadmap
    resume.interview_questions = updated_questions
    resume.target_role = data.job_title

    # 4. Save TargetJob
    job_record = TargetJob(
        user_id=current_user.id,
        resume_id=resume.id,
        job_title=data.job_title,
        company=data.company,
        description=data.description,
        url=data.url,
        overall_match=match_result["overallMatch"],
        skill_match=match_result["skillMatch"],
        keyword_match=match_result["keywordMatch"],
        experience_match=match_result["experienceMatch"],
        matched_skills=match_result["matchedSkills"],
        missing_skills=match_result["missingSkills"],
        partial_matches=match_result["partialMatches"],
        skill_gaps=match_result["skillGaps"],
    )

    db.add(job_record)
    db.commit()
    db.refresh(job_record)
    db.refresh(resume)

    return {
        "id": job_record.id,
        "job_title": job_record.job_title,
        "company": job_record.company,
        "description": job_record.description,
        "overall_match": int(job_record.overall_match),
        "skill_match": int(job_record.skill_match),
        "keyword_match": int(job_record.keyword_match),
        "experience_match": int(job_record.experience_match),
        "matched_skills": job_record.matched_skills or [],
        "missing_skills": job_record.missing_skills or [],
        "partial_matches": job_record.partial_matches or [],
        "skill_gaps": job_record.skill_gaps or [],
        "strong_evidence": match_result.get("strong_evidence", []),
        "weak_evidence": match_result.get("weak_evidence", []),
        "you_already_have": match_result.get("you_already_have", []),
        "updated_roadmap": updated_roadmap,
        "updated_interview_questions": updated_questions
    }

@router.get("", response_model=List[dict])
def list_target_jobs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    jobs = db.query(TargetJob).filter(TargetJob.user_id == current_user.id).order_by(TargetJob.id.desc()).all()
    return [
        {
            "id": j.id,
            "resume_id": j.resume_id,
            "job_title": j.job_title,
            "company": j.company,
            "overall_match": j.overall_match,
            "matched_skills": j.matched_skills,
            "missing_skills": j.missing_skills,
            "created_at": j.created_at
        }
        for j in jobs
    ]

@router.delete("/{job_id}")
def delete_job(job_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(TargetJob).filter(TargetJob.id == job_id, TargetJob.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    
    # If this was linked to a resume, clear jobMatch score
    if job.resume_id:
        resume = db.query(Resume).filter(Resume.id == job.resume_id).first()
        if resume and resume.scores:
            scores = dict(resume.scores)
            scores["jobMatch"] = None
            resume.scores = scores
    
    db.delete(job)
    db.commit()
    return {"message": "Job removed successfully"}
