import re
from typing import Dict, Any, List
from .resume_improver import improve_bullet_point

WEAK_VERBS = [
    "worked on", "helped", "assisted", "responsible for", "participated in",
    "handled", "supported", "involved in", "did", "tasked with"
]

def analyze_resume_data(parsed_resume: Dict[str, Any], target_role: str = "Software Engineer") -> Dict[str, Any]:
    """
    Evaluates real resume content and calculates dynamic Resume Score, ATS Score,
    Content Strength, Skills Strength, Experience Strength, Project Strength,
    Keyword Quality, and Structure/Formatting Quality.
    Strictly evidence-based: different resumes yield mathematically distinct, justified scores.
    """
    contact = parsed_resume.get("contact_info", {})
    skills = parsed_resume.get("detected_skills", {})
    metrics = parsed_resume.get("metrics_found", [])
    action_verbs = parsed_resume.get("action_verbs_found", [])
    weak_verbs = parsed_resume.get("weak_verbs_found", [])
    bullets = parsed_resume.get("bullet_points", [])
    sections = parsed_resume.get("sections", {})
    word_count = parsed_resume.get("word_count", 0)

    has_exp = parsed_resume.get("has_experience_section", False)
    has_proj = parsed_resume.get("has_projects_section", False)
    has_edu = parsed_resume.get("has_education_section", False)
    has_skills = parsed_resume.get("has_skills_section", False)
    has_summary = parsed_resume.get("has_summary_section", False)
    has_certs = parsed_resume.get("has_certifications_section", False)
    has_achieve = parsed_resume.get("has_achievements_section", False)

    tech_skills = skills.get("technical", [])
    tech_count = len(tech_skills)
    metric_count = len(metrics)
    action_verb_count = len(action_verbs)
    weak_verb_count = len(weak_verbs)

    # ========================================================
    # 1. INDIVIDUAL DIMENSION SCORES (0 - 100)
    # ========================================================

    # A. Content Strength (Metrics + Action verbs + Bullet density)
    content_strength = 20
    if metric_count >= 4:
        content_strength += 35
    elif metric_count >= 2:
        content_strength += 25
    elif metric_count >= 1:
        content_strength += 15

    if action_verb_count >= 5:
        content_strength += 35
    elif action_verb_count >= 3:
        content_strength += 25
    elif action_verb_count >= 1:
        content_strength += 15

    if weak_verb_count > 2:
        content_strength = max(20, content_strength - 15)
    content_strength = max(20, min(95, content_strength))

    # B. Skills Strength (Recognized technical breadth & depth)
    if tech_count >= 12:
        skills_strength = 95
    elif tech_count >= 8:
        skills_strength = 85
    elif tech_count >= 5:
        skills_strength = 72
    elif tech_count >= 3:
        skills_strength = 58
    elif tech_count >= 1:
        skills_strength = 45
    else:
        skills_strength = 25

    # C. Experience Strength (Based on genuine experience section presence & bullets)
    exp_bullets_count = len(parsed_resume.get("experience", [])) or (len(bullets) if has_exp else 0)
    if has_exp and exp_bullets_count >= 3:
        experience_strength = 90 if metric_count >= 2 else 78
    elif has_exp:
        experience_strength = 65
    else:
        experience_strength = 35  # Clearly lower if no experience section

    # D. Project Strength (Based on genuine projects section presence & detailed projects)
    projects_list = parsed_resume.get("projects", [])
    proj_count = len(projects_list)
    if has_proj and proj_count >= 2:
        project_strength = 92
    elif has_proj and proj_count == 1:
        project_strength = 80
    elif has_proj:
        project_strength = 70
    else:
        project_strength = 40  # Lower if no projects section

    # E. Keyword Quality (Technical density relative to document length)
    if word_count > 0:
        density = tech_count / (word_count / 100.0)
        if density >= 3.0:
            keyword_quality = 92
        elif density >= 1.5:
            keyword_quality = 80
        elif density >= 0.8:
            keyword_quality = 65
        else:
            keyword_quality = 45
    else:
        keyword_quality = 30

    # F. Structure / Formatting Quality (Headings, contacts, length)
    core_headings_count = sum([has_exp, has_edu, has_skills, has_proj, has_summary])
    structure_quality = 40 + (core_headings_count * 10)
    if contact.get("email") != "Not detected" and contact.get("phone") != "Not detected":
        structure_quality += 10
    structure_quality = max(30, min(95, structure_quality))

    # ========================================================
    # 2. DYNAMIC ATS SCORE (0 - 100) & CHECKLIST
    # ========================================================
    ats_score = 0
    ats_checks = []
    checks_passed = []
    ats_warnings = []

    # Check 1: Contact info
    if contact.get("email") != "Not detected" and contact.get("phone") != "Not detected":
        ats_score += 20
        checks_passed.append({"label": "Contact Information", "detail": "Email address and contact phone number clearly detectable."})
    else:
        ats_score += 8
        ats_warnings.append({
            "title": "Missing Contact Details",
            "detail": "Email address or phone number is missing from the header.",
            "fix": "Place email and phone at the very top in plain text."
        })

    # Check 2: Core Section Headings
    if core_headings_count >= 3:
        ats_score += 25
        checks_passed.append({"label": "Standard Section Headings", "detail": f"{core_headings_count} recognized standard resume headings detected."})
    else:
        ats_score += 10
        ats_warnings.append({
            "title": "Missing Standard Headings",
            "detail": "ATS parsers look for standard headings like 'Experience', 'Education', and 'Skills'.",
            "fix": "Organize your resume with bold, standardized section headings."
        })

    # Check 3: Technical Keywords
    if tech_count >= 6:
        ats_score += 25
        checks_passed.append({"label": "Keyword Depth", "detail": f"{tech_count} recognizable technical keywords detected."})
    else:
        ats_score += 10
        ats_warnings.append({
            "title": "Low Technical Keyword Depth",
            "detail": f"Only {tech_count} standard technical keywords detected.",
            "fix": "Group your skills into distinct categories (Frontend, Backend, Databases, Tools)."
        })

    # Check 4: Measurable Outcomes
    if metric_count >= 2:
        ats_score += 15
        checks_passed.append({"label": "Quantifiable Metrics", "detail": f"Detected {metric_count} measurable outcomes."})
    else:
        ats_score += 5
        ats_warnings.append({
            "title": "Lack of Quantified Achievements",
            "detail": "Resume contains few or no measurable metrics.",
            "fix": "Include optional metrics if available (e.g. % improvements, user counts, latency reductions)."
        })

    # Check 5: Word Count
    if 250 <= word_count <= 850:
        ats_score += 15
        checks_passed.append({"label": "Optimal Length", "detail": f"Word count ({word_count} words) is optimal for standard single/two-page ATS parsing."})
    elif word_count < 250:
        ats_score += 6
        ats_warnings.append({
            "title": "Resume Too Short",
            "detail": f"Document has only {word_count} words; may lack keyword depth.",
            "fix": "Elaborate on technical project implementations and key responsibilities."
        })
    else:
        ats_score += 8
        ats_warnings.append({
            "title": "Resume Too Dense",
            "detail": f"Document has {word_count} words; risks parsing truncation.",
            "fix": "Condense older experience or verbose paragraphs into focused bullet points."
        })

    ats_score = max(25, min(97, ats_score))

    # ========================================================
    # 3. OVERALL RESUME SCORE (0 - 100)
    # ========================================================
    overall_score = int(
        (content_strength * 0.20) +
        (skills_strength * 0.25) +
        (experience_strength * 0.20) +
        (project_strength * 0.15) +
        (keyword_quality * 0.10) +
        (structure_quality * 0.10)
    )
    overall_score = max(20, min(98, overall_score))

    categories = [
        {"name": "Content Strength", "score": content_strength, "weight": "20%", "status": "Strong" if content_strength >= 75 else "Needs Work"},
        {"name": "Skills Strength", "score": skills_strength, "weight": "25%", "status": "Strong" if skills_strength >= 75 else "Needs Work"},
        {"name": "Experience Strength", "score": experience_strength, "weight": "20%", "status": "Strong" if experience_strength >= 75 else "Developing"},
        {"name": "Project Strength", "score": project_strength, "weight": "15%", "status": "Strong" if project_strength >= 75 else "Developing"},
        {"name": "Keyword Quality", "score": keyword_quality, "weight": "10%", "status": "Strong" if keyword_quality >= 75 else "Needs Work"},
        {"name": "Structure & Formatting", "score": structure_quality, "weight": "10%", "status": "Good" if structure_quality >= 75 else "Needs Work"},
    ]

    # ========================================================
    # 4. REAL EVIDENCE-BASED "WHAT YOU DO WELL"
    # ========================================================
    strengths = []
    if tech_count >= 5:
        top_skills = ", ".join(tech_skills[:4])
        strengths.append({
            "title": "Solid Technical Stack",
            "detail": f"Resume clearly demonstrates core technical proficiencies in {top_skills}."
        })
    if contact.get("github") != "Not detected" or contact.get("linkedin") != "Not detected":
        strengths.append({
            "title": "Verified Online Profiles",
            "detail": "Developer links (GitHub / LinkedIn) are clearly included for portfolio review."
        })
    if has_proj and proj_count > 0:
        strengths.append({
            "title": "Hands-On Technical Projects",
            "detail": f"Dedicated projects section demonstrates practical application of technologies."
        })
    if has_exp and experience_strength >= 70:
        strengths.append({
            "title": "Practical Work Experience",
            "detail": "Demonstrated track record of employment or internship history."
        })
    if action_verb_count >= 3:
        verb_sample = ", ".join([f"'{v}'" for v in action_verbs[:3]])
        strengths.append({
            "title": "Proactive Action Verbs",
            "detail": f"Bullet statements leverage direct engineering action verbs ({verb_sample})."
        })
    if metric_count >= 2:
        strengths.append({
            "title": "Measurable Impact Indicators",
            "detail": f"Quantified outcomes like '{metrics[0]}' give recruiters concrete evidence of results."
        })
    if not strengths:
        strengths.append({
            "title": "Clear Document Structure",
            "detail": "Content is organized into distinct paragraphs suitable for parsing."
        })

    # ========================================================
    # 5. REAL EVIDENCE-BASED "WHAT NEEDS IMPROVEMENT"
    # ========================================================
    improvements = []
    imp_id = 1

    if metric_count == 0:
        improvements.append({
            "id": f"imp-{imp_id}",
            "priority": "HIGH",
            "issue": "Absence of measurable achievements",
            "why": "Recruiters and hiring managers look for evidence of scale, performance improvements, or business impact.",
            "how": "If you have real metrics, add them to your bullets (e.g. percentage improvements, user counts, load times). Never fabricate numbers.",
            "example": "e.g., 'Optimized image loading pipeline, reducing initial render time from 2.4s to 1.1s.'"
        })
        imp_id += 1

    if weak_verb_count > 0:
        sample_weak = ", ".join([f"'{v}'" for v in weak_verbs[:2]])
        improvements.append({
            "id": f"imp-{imp_id}",
            "priority": "HIGH",
            "issue": f"Passive or weak verbs detected ({sample_weak})",
            "why": "Phrases like 'worked on' or 'helped' obscure your direct ownership and technical contribution.",
            "how": "Replace passive openings with strong action verbs like 'Developed', 'Engineered', 'Implemented', or 'Designed'.",
            "example": "e.g., Replace 'Worked on React app' with 'Developed responsive client interface using React and Redux.'"
        })
        imp_id += 1

    if not has_summary:
        improvements.append({
            "id": f"imp-{imp_id}",
            "priority": "MEDIUM",
            "issue": "Professional summary is missing",
            "why": "A 2-3 sentence summary immediately frames your technical specialty and career focus for recruiters.",
            "how": "Add a focused professional summary at the top outlining your core stack and engineering focus.",
            "example": f"e.g., 'Software Engineer with experience building responsive web applications using {', '.join(tech_skills[:2]) if tech_skills else 'modern technologies'}.'"
        })
        imp_id += 1

    if not has_proj:
        improvements.append({
            "id": f"imp-{imp_id}",
            "priority": "HIGH",
            "issue": "Dedicated projects section is missing",
            "why": "Technical interviewers rely heavily on project descriptions to evaluate architectural decision-making.",
            "how": "Add 2-3 featured projects detailing technologies used, architecture, and personal contributions.",
            "example": "e.g., Project Name | React, TypeScript, Node.js: Built interactive dashboard with modular state management."
        })
        imp_id += 1

    if tech_count < 6:
        improvements.append({
            "id": f"imp-{imp_id}",
            "priority": "HIGH",
            "issue": "Low technical keyword density",
            "why": "ATS parsers match candidate resumes against required technical keyword lists.",
            "how": "Organize your technical skills into explicit categories: Programming Languages, Frameworks, Databases, Tools.",
            "example": "e.g., Languages: JavaScript, Python | Frameworks: React, Express | Databases: PostgreSQL"
        })
        imp_id += 1

    if contact.get("github") == "Not detected" and contact.get("portfolio") == "Not detected":
        improvements.append({
            "id": f"imp-{imp_id}",
            "priority": "MEDIUM",
            "issue": "No code repository or portfolio link detected",
            "why": "Engineering hiring teams prefer candidates with verifiable public repositories or live demos.",
            "how": "Include your GitHub profile or personal portfolio URL in the header section.",
            "example": "e.g., 'github.com/yourusername | yourportfolio.dev'"
        })
        imp_id += 1

    if not has_certs:
        improvements.append({
            "id": f"imp-{imp_id}",
            "priority": "LOW",
            "issue": "No industry certifications listed",
            "why": "Recognized certifications (e.g. AWS, GCP, CKAD) validate domain proficiency independently.",
            "how": "If you hold relevant professional certifications or completed specialized tracks, include a dedicated Certifications section.",
            "example": "e.g., 'AWS Certified Cloud Practitioner (2024)'"
        })
        imp_id += 1

    # ========================================================
    # 6. FACT-PRESERVING BULLET POINT IMPROVEMENTS
    # ========================================================
    content_improvements = []
    # Identify bullets that have weak verbs or lack clarity
    for idx, bullet in enumerate(bullets[:4]):
        is_weak = any(wv in bullet.lower() for wv in WEAK_VERBS) or not any(char.isdigit() for char in bullet) or len(bullet.split()) < 8
        if is_weak:
            rewritten = improve_bullet_point(bullet)
            content_improvements.append({
                "id": f"bullet-imp-{idx + 1}",
                "current": bullet,
                "improved": rewritten["improved"],
                "section": "Experience / Projects",
                "impact": rewritten["enhancement_notes"],
                "optional_metric_prompt": rewritten["optional_metric_prompt"]
            })

    # Summary Verdict
    if overall_score >= 80:
        summary_verdict = f"Your resume demonstrates a competitive technical profile with verified competencies in {', '.join(tech_skills[:3]) if tech_skills else 'core technologies'}. Addressing identified wording and keyword enhancements will maximize your interview callback rate."
    elif overall_score >= 65:
        summary_verdict = f"Your resume establishes a good foundational profile, but bullet descriptions lack action-oriented wording and quantifiable outcomes. Enhancing project depth and section structure will elevate your candidate ranking."
    else:
        summary_verdict = f"Your resume is currently missing key sections and technical depth expected by recruiters. Adding standard headings, dedicated project descriptions, and expanding keyword density will significantly boost your ATS visibility."

    return {
        "overallScore": overall_score,
        "atsScore": ats_score,
        "atsAnalysis": {
            "score": ats_score,
            "verdict": "ATS Compatible" if ats_score >= 75 else "Needs Formatting Optimization",
            "checks": ats_checks,
            "checksPassed": checks_passed,
            "warnings": ats_warnings,
            "explanation": f"Evaluated {core_headings_count} core headings, contact readability, and keyword density ({tech_count} technical terms)."
        },
        "categories": categories,
        "summaryVerdict": summary_verdict,
        "strengths": strengths,
        "improvements": improvements,
        "improvementsCount": len(improvements),
        "contentImprovements": content_improvements
    }
