import re
from typing import Dict, Any, List, Optional
from .skill_catalog import extract_skills_from_text

ACTION_VERBS = [
    "architected", "engineered", "spearheaded", "developed", "designed",
    "implemented", "optimized", "streamlined", "orchestrated", "refactored",
    "automated", "built", "accelerated", "deployed", "scaled", "delivered",
    "led", "reduced", "increased", "maximized", "integrated", "transformed"
]

WEAK_VERBS = [
    "worked on", "helped", "assisted", "responsible for", "participated in",
    "handled", "supported", "involved in", "did", "tasked with"
]

SECTION_PATTERNS = {
    "summary": [r"\b(?:professional\s+)?summary\b", r"\bprofile\b", r"\bobjective\b", r"\babout\s+me\b"],
    "experience": [r"\b(?:work\s+)?experience\b", r"\bemployment\s+history\b", r"\bwork\s+history\b", r"\bprofessional\s+experience\b", r"\binternships?\b"],
    "education": [r"\beducation\b", r"\bacademics?\b", r"\bacademic\s+background\b", r"\bqualifications\b"],
    "projects": [r"\bprojects?\b", r"\bpersonal\s+projects\b", r"\bkey\s+projects\b", r"\btechnical\s+projects\b"],
    "skills": [r"\b(?:technical\s+)?skills\b", r"\btechnologies\b", r"\bcore\s+competencies\b", r"\bproficiencies\b", r"\btechnical\s+stack\b"],
    "certifications": [r"\bcertifications?\b", r"\bcertificates?\b", r"\blicenses?\b", r"\baccreditations?\b"],
    "achievements": [r"\bachievements?\b", r"\bawards?\b", r"\bhono(?:u)?rs\b"],
    "languages": [r"\blanguages?\b"]
}


def parse_structured_education(education_text: str) -> List[Dict[str, Any]]:
    """Extracts genuine education records from the education section text."""
    if not education_text or not education_text.strip():
        return []

    lines = [line.strip() for line in education_text.splitlines() if line.strip()]
    records = []
    current_record = None

    degree_patterns = [
        r"\b(?:bachelor(?:'s)?|b\.?tech|b\.?s\.?|b\.?e\.?|bca)\b",
        r"\b(?:master(?:'s)?|m\.?tech|m\.?s\.?|m\.?e\.?|mca|mba)\b",
        r"\b(?:ph\.?d|doctorate)\b",
        r"\b(?:diploma|associate)\b"
    ]

    for line in lines:
        is_degree_line = any(re.search(p, line, re.IGNORECASE) for p in degree_patterns)
        has_dates = bool(re.search(r"\b(?:19|20)\d{2}\b", line))
        has_inst = bool(re.search(r"\b(?:university|college|institute|school|academy)\b", line, re.IGNORECASE))

        if is_degree_line or has_inst or (has_dates and current_record is None):
            if current_record:
                records.append(current_record)

            degree = line if is_degree_line else ""
            inst = line if has_inst else ""
            dates = ""
            date_match = re.search(r"\b(?:(?:19|20)\d{2}\s*(?:-|–|—|to)\s*(?:(?:19|20)\d{2}|present|current)|(?:19|20)\d{2})\b", line, re.IGNORECASE)
            if date_match:
                dates = date_match.group(0)

            current_record = {
                "institution": inst,
                "degree": degree,
                "field": "",
                "dates": dates,
                "details": [line]
            }
        elif current_record:
            current_record["details"].append(line)
            if not current_record["institution"] and has_inst:
                current_record["institution"] = line
            if not current_record["dates"]:
                date_match = re.search(r"\b(?:(?:19|20)\d{2}\s*(?:-|–|—|to)\s*(?:(?:19|20)\d{2}|present|current)|(?:19|20)\d{2})\b", line, re.IGNORECASE)
                if date_match:
                    current_record["dates"] = date_match.group(0)

    if current_record:
        records.append(current_record)

    # Format output clean records
    formatted = []
    for r in records:
        inst = r["institution"]
        deg = r["degree"]
        if not inst and len(r["details"]) > 0:
            inst = r["details"][0]
        if not deg and len(r["details"]) > 1:
            deg = r["details"][1]

        formatted.append({
            "institution": inst.strip() if inst else "Educational Institution",
            "degree": deg.strip() if deg else "Degree / Qualification",
            "field": r.get("field", ""),
            "dates": r.get("dates", "")
        })

    return formatted


def parse_structured_experience(experience_text: str) -> List[Dict[str, Any]]:
    """Extracts genuine work experience entries without inventing companies or roles."""
    if not experience_text or not experience_text.strip():
        return []

    lines = [line.strip() for line in experience_text.splitlines() if line.strip()]
    entries = []
    current_entry = None

    date_regex = re.compile(r"\b(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?(?:19|20)\d{2}\s*(?:-|–|—|to)\s*(?:(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?(?:19|20)\d{2}|present|current)\b", re.IGNORECASE)

    for line in lines:
        is_bullet = bool(re.match(r"^[\s*•\-–—►▪]+", line))
        has_dates = bool(date_regex.search(line))

        if not is_bullet and (has_dates or (len(line.split()) <= 6 and any(role_w in line.lower() for role_w in ["engineer", "developer", "intern", "lead", "manager", "specialist", "analyst", "consultant"]))):
            if current_entry:
                entries.append(current_entry)

            date_str = ""
            date_m = date_regex.search(line)
            clean_title_line = line
            if date_m:
                date_str = date_m.group(0)
                clean_title_line = line.replace(date_str, "").strip(" -–|,")

            parts = [p.strip() for p in re.split(r"[-–|•at,]", clean_title_line) if p.strip()]
            role = parts[0] if parts else clean_title_line
            company = parts[1] if len(parts) > 1 else ""

            current_entry = {
                "role": role,
                "company": company,
                "dates": date_str,
                "responsibilities": [],
                "achievements": []
            }
        elif current_entry:
            clean_bullet = re.sub(r"^[\s*•\-–—►▪]+\s*", "", line).strip()
            if any(char.isdigit() for char in clean_bullet) and any(m in clean_bullet.lower() for m in ["%", "$", "reduced", "increased", "saved", "improved", "scale"]):
                current_entry["achievements"].append(clean_bullet)
            else:
                current_entry["responsibilities"].append(clean_bullet)

    if current_entry:
        entries.append(current_entry)

    return entries


def parse_structured_projects(projects_text: str) -> List[Dict[str, Any]]:
    """Extracts genuine projects from the projects section text."""
    if not projects_text or not projects_text.strip():
        return []

    lines = [line.strip() for line in projects_text.splitlines() if line.strip()]
    projects = []
    current_proj = None

    for line in lines:
        is_bullet = bool(re.match(r"^[\s*•\-–—►▪]+", line))
        is_header = not is_bullet and len(line.split()) <= 8 and (
            "|" in line or ":" in line or any(w in line.lower() for w in ["app", "system", "platform", "website", "tool", "tracker", "dashboard", "clone", "gallery", "portfolio", "project"])
        )

        if is_header or (not is_bullet and current_proj is None):
            if current_proj:
                projects.append(current_proj)

            name = line
            tech = ""
            if "|" in line:
                parts = line.split("|")
                name = parts[0].strip()
                tech = parts[1].strip()
            elif ":" in line:
                parts = line.split(":")
                name = parts[0].strip()
                tech = parts[1].strip()

            current_proj = {
                "name": name,
                "description": "",
                "technologies": tech,
                "contributions": []
            }
        elif current_proj:
            clean_line = re.sub(r"^[\s*•\-–—►▪]+\s*", "", line).strip()
            if not current_proj["description"] and not is_bullet:
                current_proj["description"] = clean_line
            else:
                current_proj["contributions"].append(clean_line)

    if current_proj:
        projects.append(current_proj)

    return projects


def parse_resume(raw_text: str) -> Dict[str, Any]:
    """
    Parses unstructured resume text into a structured, reliable data model.
    Never invents missing contact info, credentials, or achievements.
    """
    if not raw_text or not raw_text.strip():
        raise ValueError("Resume text is empty. No content could be read.")

    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    full_text = "\n".join(lines)
    word_count = len(re.findall(r"\b\w+\b", full_text))

    # 1. Contact Information Extraction
    email_match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", full_text)
    email = email_match.group(0) if email_match else "Not detected"

    phone_match = re.search(r"(?:(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})", full_text)
    phone = phone_match.group(0) if phone_match else "Not detected"

    linkedin_match = re.search(r"(?:linkedin\.com/in/|linkedin\.com/)([a-zA-Z0-9_-]+)", full_text, re.IGNORECASE)
    linkedin = f"linkedin.com/in/{linkedin_match.group(1)}" if linkedin_match else "Not detected"

    github_match = re.search(r"(?:github\.com/)([a-zA-Z0-9_-]+)", full_text, re.IGNORECASE)
    github = f"github.com/{github_match.group(1)}" if github_match else "Not detected"

    portfolio_match = re.search(r"(?:https?://)?(?:www\.)?([a-zA-Z0-9-]+\.(?:dev|io|me|app|com))(?:\/[^\s]*)?", full_text, re.IGNORECASE)
    portfolio = portfolio_match.group(0) if portfolio_match and "github" not in portfolio_match.group(0).lower() and "linkedin" not in portfolio_match.group(0).lower() else "Not detected"

    # Candidate Name (inspect top 5 lines, skipping emails/phone/links)
    candidate_name = "Not detected"
    for line in lines[:5]:
        if (
            "@" not in line 
            and "http" not in line.lower()
            and "linkedin" not in line.lower()
            and "github" not in line.lower()
            and len(line.split()) in [2, 3, 4]
            and re.match(r"^[A-Z][A-Za-z\s.'-]+$", line)
        ):
            candidate_name = line.strip()
            break

    # Location extraction from top 6 lines (e.g., "Seattle, WA" or "Bengaluru, India" or "San Francisco, CA")
    location = "Not detected"
    loc_pattern = r"\b([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}|[A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z]+)\b"
    for line in lines[:7]:
        if "@" not in line and "http" not in line.lower():
            m_loc = re.search(loc_pattern, line)
            if m_loc and len(m_loc.group(0).split()) <= 4:
                location = m_loc.group(0).strip()
                break

    # 2. Section Segmentation
    sections: Dict[str, str] = {
        "summary": "",
        "experience": "",
        "education": "",
        "projects": "",
        "skills": "",
        "certifications": "",
        "achievements": "",
        "languages": ""
    }

    current_section = None
    section_lines: Dict[str, List[str]] = {k: [] for k in sections}

    for line in lines:
        matched_section = None
        for sec_name, patterns in SECTION_PATTERNS.items():
            for pat in patterns:
                # Heading indicator: short line matching pattern
                if len(line.split()) <= 4 and re.search(pat, line, re.IGNORECASE):
                    matched_section = sec_name
                    break
            if matched_section:
                break

        if matched_section:
            current_section = matched_section
        elif current_section:
            section_lines[current_section].append(line)

    for sec_name in sections:
        sections[sec_name] = "\n".join(section_lines[sec_name]).strip()

    # 3. Detect Skills
    detected_skills = extract_skills_from_text(full_text)

    # 4. Extract bullet points across experience and projects
    bullet_points = []
    bullet_regex = re.compile(r"^[\s*•\-–—►▪]+(.*)$")
    for line in lines:
        m = bullet_regex.match(line)
        if m:
            bullet_text = m.group(1).strip()
            if len(bullet_text.split()) >= 3:
                bullet_points.append(bullet_text)
        elif any(verb in line.lower() for verb in ["architected", "engineered", "developed", "built", "designed", "optimized", "implemented", "completed"]) and len(line.split()) >= 4:
            bullet_points.append(line.strip())

    # 5. Extract Quantifiable Metrics & Action Verbs
    metric_matches = re.findall(r"\b(?:\d+%(?:\s+increase|\s+reduction|\s+growth|\s+improvement)?|\$\d+[\d,.]*(?:k|m|b)?|\d+x|\d+\s*(?:users|clients|requests|ms|seconds|hours|queries|endpoints))\b", full_text, re.IGNORECASE)
    action_verbs_found = [verb for verb in ACTION_VERBS if re.search(rf"\b{verb}\b", full_text, re.IGNORECASE)]
    weak_verbs_found = [verb for verb in WEAK_VERBS if re.search(rf"\b{verb}\b", full_text, re.IGNORECASE)]

    # 6. Structured extractions
    structured_education = parse_structured_education(sections["education"])
    structured_experience = parse_structured_experience(sections["experience"])
    structured_projects = parse_structured_projects(sections["projects"])

    certifications_list = [line.strip() for line in sections["certifications"].splitlines() if line.strip()] if sections["certifications"] else []
    achievements_list = [line.strip() for line in sections["achievements"].splitlines() if line.strip()] if sections["achievements"] else []

    return {
        "candidate_name": candidate_name,
        "contact_info": {
            "email": email,
            "phone": phone,
            "linkedin": linkedin,
            "github": github,
            "portfolio": portfolio,
            "location": location
        },
        "professional_summary": sections["summary"] if sections["summary"] else None,
        "sections": sections,
        "detected_skills": detected_skills,
        "education": structured_education,
        "experience": structured_experience,
        "projects": structured_projects,
        "certifications": certifications_list,
        "achievements": achievements_list,
        "word_count": word_count,
        "bullet_points": bullet_points,
        "metrics_found": metric_matches,
        "action_verbs_found": list(set(action_verbs_found)),
        "weak_verbs_found": list(set(weak_verbs_found)),
        "has_experience_section": bool(sections["experience"]),
        "has_education_section": bool(sections["education"]),
        "has_projects_section": bool(sections["projects"]),
        "has_skills_section": bool(sections["skills"]),
        "has_summary_section": bool(sections["summary"]),
        "has_certifications_section": bool(sections["certifications"]),
        "has_achievements_section": bool(sections["achievements"]),
    }
