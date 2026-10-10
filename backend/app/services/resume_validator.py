import re
from typing import Dict, Any, List

# Core resume section heading patterns
RESUME_SECTION_PATTERNS = {
    "experience": [
        r"\b(?:work\s+)?experience\b",
        r"\bemployment(?:\s+history)?\b",
        r"\bwork\s+history\b",
        r"\bprofessional\s+experience\b",
        r"\binternships?\b",
    ],
    "education": [
        r"\beducation\b",
        r"\bacademics?\b",
        r"\bacademic\s+background\b",
        r"\bqualifications\b",
        r"\beducational\s+qualifications?\b",
    ],
    "skills": [
        r"\b(?:technical\s+)?skills\b",
        r"\btechnologies\b",
        r"\bcore\s+competencies\b",
        r"\bproficiencies\b",
        r"\btechnical\s+stack\b",
        r"\btools\s+(?:&|and)\s+technologies\b",
    ],
    "projects": [
        r"\bprojects?\b",
        r"\bpersonal\s+projects\b",
        r"\bkey\s+projects\b",
        r"\btechnical\s+projects\b",
        r"\bacademic\s+projects\b",
    ],
    "summary": [
        r"\b(?:professional\s+)?summary\b",
        r"\bprofile\b",
        r"\bobjective\b",
        r"\bcareer\s+objective\b",
        r"\babout\s+me\b",
    ],
    "certifications": [
        r"\bcertifications?\b",
        r"\bcertificates?\b",
        r"\blicenses?\b",
        r"\bcourses?\b",
    ],
    "achievements": [
        r"\bachievements?\b",
        r"\bawards?\b",
        r"\bhono(?:u)?rs\b",
    ],
}

# Strong anti-signals indicating posters, assignments, lecture notes, or generic invoices
NON_RESUME_INDICATORS = [
    r"\bassignment\s+(?:#?\d+|one|two|three)\b",
    r"\bhomework\s+(?:#?\d+|submission)\b",
    r"\bproblem\s+statement\b",
    r"\blab\s+(?:exercise|report|manual)\b",
    r"\bsubmission\s+date\b",
    r"\broll\s+no(?:umber)?\b",
    r"\blecture\s+notes\b",
    r"\bchapter\s+\d+\b",
    r"\bjoin\s+us\s+for\b",
    r"\bevent\s+(?:venue|date|time)\b",
    r"\bfree\s+(?:entry|registration)\b",
    r"\bscan\s+(?:the\s+)?qr\s+code\b",
    r"\borganized\s+by\s+(?:the\s+)?department\b",
    r"\binvoice\s+(?:number|#|date)\b",
    r"\bbill\s+to\b",
    r"\btotal\s+amount\s+due\b",
    r"\bmeeting\s+minutes\b",
    r"\bagenda\s*:",
    r"\battendees\s*:",
    r"\bterms\s+and\s+conditions\s+of\s+sale\b",
]

# Educational credential terms
EDUCATION_KEYWORDS = [
    r"\bbachelor(?:'s)?\b",
    r"\bmaster(?:'s)?\b",
    r"\bb\.?tech\b",
    r"\bm\.?tech\b",
    r"\bb\.?s\.?\b",
    r"\bm\.?s\.?\b",
    r"\bb\.?e\.?\b",
    r"\bm\.?e\.?\b",
    r"\bbca\b",
    r"\bmca\b",
    r"\bph\.?d\b",
    r"\buniversity\b",
    r"\bcollege\b",
    r"\binstitute\b",
    r"\bgpa\b",
    r"\bcgpa\b",
    r"\bgraduated\b",
]

# Common date ranges in resumes (e.g., 2020 - 2024, May 2021 – Present)
DATE_RANGE_PATTERNS = [
    r"\b(?:19|20)\d{2}\s*(?:-|–|—|to)\s*(?:(?:19|20)\d{2}|present|current)\b",
    r"\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+(?:19|20)\d{2}\b",
    r"\b(?:19|20)\d{2}\b",
]


class ResumeValidationService:
    """
    Validates uploaded documents to verify whether they represent a genuine resume/CV.
    Evaluates section headings, contact information, chronological date ranges,
    education markers, and penalizes non-resume indicators (posters, assignments, invoices).
    """

    @staticmethod
    def validate_document_text(text: str) -> Dict[str, Any]:
        if not text or not text.strip():
            return {
                "is_valid": False,
                "confidence": 0.0,
                "reason": "The uploaded file does not contain readable text.",
                "signals": {},
                "matched_sections": [],
            }

        clean_text = text.strip()
        lines = [line.strip() for line in clean_text.splitlines() if line.strip()]
        words = re.findall(r"\b\w+\b", clean_text)
        word_count = len(words)

        if word_count < 30:
            return {
                "is_valid": False,
                "confidence": 0.05,
                "reason": "The document contains too few words to be a resume.",
                "signals": {"word_count": word_count},
                "matched_sections": [],
            }

        # 1. Contact Signals (Max 0.25)
        has_email = bool(re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", clean_text))
        has_phone = bool(re.search(r"(?:(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})", clean_text))
        has_links = bool(re.search(r"(?:linkedin\.com|github\.com|portfolio|\.dev|\.io)", clean_text, re.IGNORECASE))

        contact_score = 0.0
        if has_email:
            contact_score += 0.12
        if has_phone:
            contact_score += 0.08
        if has_links:
            contact_score += 0.05
        contact_score = min(0.25, contact_score)

        # 2. Section Headings Signals (Max 0.40)
        matched_sections = []
        for sec_name, patterns in RESUME_SECTION_PATTERNS.items():
            for pat in patterns:
                # Matches either as a standalone heading or near line start
                if any(len(line.split()) <= 5 and re.search(pat, line, re.IGNORECASE) for line in lines):
                    matched_sections.append(sec_name)
                    break

        sec_count = len(set(matched_sections))
        if sec_count >= 4:
            section_score = 0.40
        elif sec_count == 3:
            section_score = 0.32
        elif sec_count == 2:
            section_score = 0.22
        elif sec_count == 1:
            section_score = 0.10
        else:
            section_score = 0.0

        # 3. Education Signals (Max 0.15)
        edu_matches = sum(1 for pat in EDUCATION_KEYWORDS if re.search(pat, clean_text, re.IGNORECASE))
        if edu_matches >= 3:
            education_score = 0.15
        elif edu_matches >= 1:
            education_score = 0.10
        else:
            education_score = 0.0

        # 4. Dates & Chronology Signals (Max 0.15)
        date_range_matches = sum(len(re.findall(pat, clean_text, re.IGNORECASE)) for pat in DATE_RANGE_PATTERNS)
        if date_range_matches >= 4:
            chronology_score = 0.15
        elif date_range_matches >= 2:
            chronology_score = 0.10
        elif date_range_matches >= 1:
            chronology_score = 0.05
        else:
            chronology_score = 0.0

        # 5. Candidate Name Signal (top 4 lines) (Max 0.05)
        has_name_signal = False
        for line in lines[:4]:
            if (
                len(line.split()) in [2, 3, 4]
                and "@" not in line
                and "http" not in line.lower()
                and re.match(r"^[A-Z][A-Za-z\s.'-]+$", line)
            ):
                has_name_signal = True
                break
        name_score = 0.05 if has_name_signal else 0.0

        raw_confidence = contact_score + section_score + education_score + chronology_score + name_score

        # 6. Negative Penalties (Anti-signals: Assignments, Posters, Invoices, Flyers)
        anti_matches = []
        for pat in NON_RESUME_INDICATORS:
            if re.search(pat, clean_text, re.IGNORECASE):
                anti_matches.append(pat)

        penalty = min(0.50, len(anti_matches) * 0.20)
        final_confidence = max(0.0, raw_confidence - penalty)
        confidence_rounded = round(final_confidence, 2)

        # Validation Decision:
        # A resume MUST have at least:
        # 1. At least 2 standard sections OR (at least 1 standard section + email/phone)
        # 2. Confidence >= 0.35
        # 3. Not dominated by anti-signals
        has_core_sections = sec_count >= 2 or (sec_count >= 1 and (has_email or has_phone))
        is_valid = bool(confidence_rounded >= 0.35 and has_core_sections and len(anti_matches) == 0)

        signals = {
            "has_email": has_email,
            "has_phone": has_phone,
            "has_links": has_links,
            "has_name_signal": has_name_signal,
            "sections_detected": list(set(matched_sections)),
            "sections_count": sec_count,
            "education_signals_count": edu_matches,
            "date_range_signals_count": date_range_matches,
            "anti_signals_detected": len(anti_matches),
            "word_count": word_count,
        }

        if is_valid:
            reason = "Document successfully validated as a resume/CV."
        else:
            if len(anti_matches) > 0:
                reason = "Document appears to be an assignment, poster, or non-career document."
            elif sec_count == 0:
                reason = "No standard resume sections (Experience, Education, Skills, Projects) were detected."
            elif not has_email and not has_phone:
                reason = "Missing standard candidate contact information and resume structure."
            else:
                reason = "Document lacks sufficient resume indicators (headings, employment history, or education)."

        return {
            "is_valid": is_valid,
            "confidence": confidence_rounded,
            "reason": reason,
            "signals": signals,
            "matched_sections": list(set(matched_sections)),
        }
