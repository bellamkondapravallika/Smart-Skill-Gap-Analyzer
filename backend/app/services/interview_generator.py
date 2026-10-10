import re
from typing import List, Dict, Any

def generate_dynamic_interview_questions(
    detected_skills: Dict[str, Any],
    skill_gaps: List[Dict[str, Any]],
    sections: Dict[str, Any] = None,
    target_role: str = "Software Engineer"
) -> List[Dict[str, Any]]:
    """
    Generates interview questions deeply anchored in the candidate's actual resume technologies,
    projects, real experience entries, and target job gaps.
    Categories:
    - Resume Based
    - Technical
    - Skill Gap
    - Behavioral
    """
    tech_skills = detected_skills.get("technical", [])
    if isinstance(detected_skills, list):
        tech_skills = detected_skills

    projects_text = (sections or {}).get("projects", "")
    exp_text = (sections or {}).get("experience", "")

    questions = []
    q_id = 1

    # 1. RESUME BASED QUESTIONS (Experience & Project specific)
    # Check for company or internship in experience text
    company_match = re.search(r"\b(?:at|in|with|\|\s*)\s*([A-Z][A-Za-z0-9&.-]+(?:\s+[A-Z][A-Za-z0-9&.-]+)?)\b", exp_text)
    intern_match = re.search(r"\b(?:intern(?:ship)?)\s*(?:at|in)?\s*([A-Za-z0-9&.-]+)?\b", exp_text, re.IGNORECASE)

    if intern_match and intern_match.group(1):
        company_name = intern_match.group(1).strip()
        questions.append({
            "id": f"q-exp-{q_id}",
            "category": "Resume Based",
            "skill": "Professional Experience",
            "difficulty": "Intermediate",
            "isGapFocus": False,
            "question": f"What were your main responsibilities and technical contributions during your internship at {company_name}?",
            "whyRecruitersAsk": f"To assess real-world execution, team integration, and code quality delivered at {company_name}.",
            "approach": "Outline the team structure, assigned technical features, engineering workflows (Git, code reviews), and concrete deliverables.",
            "sampleAnswer": f"During my internship at {company_name}, I focused on implementing assigned front-end and service modules, participating in Agile standups, and writing maintainable code following team standards.",
            "keyPoints": [
                f"Core ownership and deliverables at {company_name}",
                "Collaboration with senior engineers and code reviews",
                "Key lessons learned and technical growth"
            ]
        })
        q_id += 1
    elif company_match and len(company_match.group(1)) > 2:
        comp = company_match.group(1).strip()
        questions.append({
            "id": f"q-exp-{q_id}",
            "category": "Resume Based",
            "skill": "Work History",
            "difficulty": "Intermediate",
            "isGapFocus": False,
            "question": f"What were your primary technical responsibilities and architectural decisions during your time at {comp}?",
            "whyRecruitersAsk": f"Verifies direct hands-on ownership and impact during your tenure at {comp}.",
            "approach": "Use the STAR method: Situation, Task, Action, and Result. Focus on how you solved technical bottlenecks.",
            "sampleAnswer": f"At {comp}, I was responsible for delivering core features, optimizing component performance, and participating in sprint planning and automated testing.",
            "keyPoints": [
                f"Architecture and feature delivery at {comp}",
                "Collaboration and engineering standards",
                "Outcome achieved and challenges resolved"
            ]
        })
        q_id += 1

    # Check for specific project in resume
    proj_match = re.search(r"([A-Z][A-Za-z0-9\s-]+?)(?:\s+application|\s+dashboard|\s+project|\s+tool|\s+gallery|\s*\||\s*:)", projects_text)
    if proj_match and len(proj_match.group(1).split()) <= 4:
        project_name = proj_match.group(1).strip()
        top_tech = tech_skills[0] if tech_skills else "modern web technologies"
        questions.append({
            "id": f"q-proj-{q_id}",
            "category": "Resume Based",
            "skill": project_name,
            "difficulty": "Advanced",
            "isGapFocus": False,
            "question": f"Can you explain the architecture and key technical decisions behind the {project_name} project described in your resume?",
            "whyRecruitersAsk": "Assesses how you design software from scratch, structure state management, and make trade-offs.",
            "approach": f"Break down the client-side/server-side structure, data modeling, styling and state management, and how {top_tech} was utilized.",
            "sampleAnswer": f"In {project_name}, I structured the codebase around reusable, decoupled components. I prioritized clean state boundaries and optimized rendering to ensure fluid user interactions.",
            "keyPoints": [
                "Component architecture and data flow",
                "Why specific libraries and frameworks were selected",
                "Performance optimizations and edge case handling"
            ]
        })
        q_id += 1
    elif tech_skills:
        primary_stack = ", ".join(tech_skills[:2])
        questions.append({
            "id": f"q-proj-{q_id}",
            "category": "Resume Based",
            "skill": tech_skills[0],
            "difficulty": "Intermediate",
            "isGapFocus": False,
            "question": f"Explain the architecture and technical trade-offs of the most challenging project on your resume built using {primary_stack}.",
            "whyRecruitersAsk": "Evaluates practical architectural judgment and end-to-end component construction.",
            "approach": "Describe the core user problem, your technology selection, and how you ensured code modularity and maintainability.",
            "sampleAnswer": f"I designed the application with a modular structure using {primary_stack}, isolating data access layers and applying automated testing to prevent regressions.",
            "keyPoints": [
                f"Architectural choices using {primary_stack}",
                "State management and asynchronous API handling",
                "Defect prevention and deployment verification"
            ]
        })
        q_id += 1

    # 2. TECHNICAL QUESTIONS (Based on verified resume skills)
    for skill in tech_skills[:2]:
        questions.append({
            "id": f"q-tech-{q_id}",
            "category": "Technical",
            "skill": skill,
            "difficulty": "Intermediate",
            "isGapFocus": False,
            "question": f"How do you handle performance optimization, memory management, and error boundaries when developing with {skill} in production?",
            "whyRecruitersAsk": f"To assess whether your {skill} expertise extends beyond syntax into production resilience and profiling.",
            "approach": f"Discuss real profiling tools, memory leak prevention, caching patterns, and automated test coverage in {skill}.",
            "sampleAnswer": f"In my work with {skill}, I prioritize early profiling, automated regression suites, and clean separation of concerns to prevent bottlenecks and unhandled rejections.",
            "keyPoints": [
                f"Core runtime optimization principles in {skill}",
                "Bottleneck detection and profiling methodologies",
                "Resilient error logging and recovery patterns"
            ]
        })
        q_id += 1

    # 3. SKILL GAP QUESTIONS (Targeted missing skills from target job)
    # Only generated if target job has identified missing skills!
    top_known = tech_skills[0] if tech_skills else "web"
    for gap in (skill_gaps or [])[:2]:
        gap_name = gap.get("name") or gap.get("skill") or "Required Technology"
        questions.append({
            "id": f"q-gap-{q_id}",
            "category": "Skill Gap",
            "skill": gap_name,
            "difficulty": "Intermediate",
            "isGapFocus": True,
            "question": f"The target {target_role} role requires experience with {gap_name}. How would you leverage {gap_name} in a {top_known} architecture, and how are you building proficiency?",
            "whyRecruitersAsk": f"Tests adaptability, proactive learning, and conceptual alignment with required {gap_name}.",
            "approach": f"Relate {gap_name} concepts to adjacent tools you already know ({top_known}), and describe concrete milestone tasks you are implementing.",
            "sampleAnswer": f"While my primary projects centered around {top_known}, the architectural concepts transfer directly to {gap_name}. I have been implementing practice milestones in {gap_name} to bridge this requirement.",
            "keyPoints": [
                f"Understanding core value proposition of {gap_name}",
                f"Transferable foundations from {top_known}",
                "Demonstrated initiative and learning roadmap progress"
            ]
        })
        q_id += 1

    # 4. BEHAVIORAL QUESTIONS
    questions.append({
        "id": f"q-behav-{q_id}",
        "category": "Behavioral",
        "skill": "Engineering Collaboration",
        "difficulty": "Intermediate",
        "isGapFocus": False,
        "question": f"Describe a situation where you encountered a technical disagreement or conflicting code review feedback while working toward a deadline.",
        "whyRecruitersAsk": "Assesses professional maturity, constructive communication, and commitment to objective code quality.",
        "approach": "Use the STAR method: Situation, Task, Action, Result. Emphasize data-driven evaluation (e.g. benchmarking or team consensus) over ego.",
        "sampleAnswer": "When differing on whether to refactor a component before a sprint deadline, my teammate and I established performance criteria and benchmarked both options. The data demonstrated a targeted index met requirements without delaying release.",
        "keyPoints": [
            "Objective, data-backed approach to technical debate",
            "Active listening and constructive code review mindset",
            "Successful delivery within deadline agreements"
        ]
    })
    q_id += 1

    return questions

def evaluate_mock_answer(question_obj: Dict[str, Any], candidate_answer: str) -> Dict[str, Any]:
    """
    Evaluates candidate's submitted answer against structured grading criteria.
    Analyzes word count, key concept coverage, and structural indicators.
    """
    clean_ans = candidate_answer.strip()
    words = clean_ans.split()
    word_count = len(words)
    lower_ans = clean_ans.lower()

    if word_count < 8:
        return {
            "score": 30,
            "readiness": "Needs Elaboration",
            "feedback": "Your response is too brief to demonstrate technical depth or clear architectural reasoning to an interviewer.",
            "strengths": ["Answer was submitted."],
            "missingPoints": [
                "Provide detailed architectural context or technical specifics",
                "Explain the 'why' behind decisions and trade-offs",
                "Address key points: " + ", ".join(question_obj.get("keyPoints", ["Core concepts"]))
            ],
            "improvement": "Expand on your reasoning. Use the STAR framework (Situation, Task, Action, Result) to provide a 3-5 sentence response."
        }

    key_points = question_obj.get("keyPoints", [])
    covered_points = []
    missing_points = []

    for kp in key_points:
        kp_words = [w.lower() for w in re.findall(r"\b\w+\b", kp) if len(w) > 3]
        if any(w in lower_ans for w in kp_words):
            covered_points.append(kp)
        else:
            missing_points.append(kp)

    base_score = 50
    if word_count >= 40:
        base_score += 20
    elif word_count >= 20:
        base_score += 12
    else:
        base_score += 6

    if key_points:
        cov_ratio = len(covered_points) / len(key_points)
        base_score += int(cov_ratio * 30)

    final_score = min(96, max(35, base_score))

    strengths = []
    if word_count >= 30:
        strengths.append("Structured and detailed technical explanation.")
    if covered_points:
        strengths.append(f"Demonstrated awareness of: {covered_points[0]}")
    if any(m in lower_ans for m in ["%", "improved", "optimized", "testing", "scale", "modular", "latency"]):
        strengths.append("Addressed concrete engineering trade-offs and performance impact.")
    if not strengths:
        strengths.append("Addressed the primary intent of the question.")

    if not missing_points:
        missing_points = ["Conclude with potential edge cases or future architectural considerations."]

    return {
        "score": final_score,
        "readiness": "Interview Ready" if final_score >= 80 else "Developing Competency" if final_score >= 60 else "Needs Practice",
        "feedback": f"Your response demonstrated good technical foundation (scored {final_score}/100). Focus on clearly highlighting concrete technical decisions.",
        "strengths": strengths,
        "missingPoints": missing_points,
        "improvement": f"To elevate your answer further, explicitly touch upon: '{missing_points[0]}'."
    }
