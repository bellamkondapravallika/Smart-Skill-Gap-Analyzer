from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import get_db
from ..models.user import User
from ..models.resume import Resume
from ..models.interview import MockInterviewSession
from ..schemas.interview import MockAnswerSubmitRequest, MockAnswerEvaluationResponse
from ..utils.security import get_current_user
from ..services.interview_generator import evaluate_mock_answer

router = APIRouter(prefix="/interview", tags=["Interview Preparation"])

@router.get("/{resume_id}")
def get_interview_prep(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found."
        )

    return {
        "resume_id": resume.id,
        "target_role": resume.target_role,
        "questions": resume.interview_questions or []
    }

@router.post("/{resume_id}/evaluate-answer", response_model=MockAnswerEvaluationResponse)
def evaluate_candidate_mock_answer(
    resume_id: int,
    data: MockAnswerSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    # Find the question in resume questions
    question_obj = {
        "id": data.question_id,
        "question": data.question_text,
        "category": data.category,
        "skill": data.skill,
        "keyPoints": data.key_points or []
    }

    evaluation = evaluate_mock_answer(question_obj, data.answer)
    return evaluation

@router.post("/{resume_id}/mock")
def save_mock_session(
    resume_id: int,
    session_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    answers = session_data.get("answers", [])
    overall_score = session_data.get("overall_score", 75.0)

    db_session = MockInterviewSession(
        user_id=current_user.id,
        resume_id=resume.id,
        total_questions=len(answers),
        completed_questions=len(answers),
        overall_readiness_score=float(overall_score),
        answers=answers,
        summary_verdict=session_data.get("verdict", "Mock session completed."),
        is_completed=True
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)

    return {"message": "Mock session recorded successfully", "session_id": db_session.id}
