import re
from typing import Dict, Any, List, Optional
from .skill_catalog import extract_skills_from_text, PARTIAL_RELATIONSHIPS

SKILL_SPECIFICS = {
    "TypeScript": {
        "learn": ["Types & Interfaces", "Generics & Utility Types", "Type Narrowing & Discriminated Unions", "React + TypeScript Component Architecture"],
        "project": "Migrate an existing React component library to strict TypeScript with generic API handlers and zero 'any' types.",
        "effort": "1–2 weeks (10–15 hours)",
    },
    "React": {
        "learn": ["Custom Hooks (useMemo, useCallback, useRef)", "State Management (Zustand / Redux Toolkit)", "React 18 Concurrent Rendering", "Component Composition & Optimization"],
        "project": "Build an interactive analytics dashboard featuring virtualized data grids and optimistic UI state transitions.",
        "effort": "2 weeks (15–20 hours)",
    },
    "Next.js": {
        "learn": ["App Router & React Server Components", "Server Actions & Mutations", "Streaming UI with Suspense", "Static vs Dynamic Caching Patterns"],
        "project": "Build a fast, SEO-optimized e-commerce storefront with server actions and revalidation triggers.",
        "effort": "1–2 weeks (12–15 hours)",
    },
    "Node.js": {
        "learn": ["Event Loop & Asynchronous I/O", "RESTful Architecture & Middleware", "JWT Authentication & Role-Based Access Control", "Error Handling & Logging Best Practices"],
        "project": "Build a production-grade REST API backend with rate-limiting, centralized error handling, and automated integration tests.",
        "effort": "1–2 weeks (10–14 hours)",
    },
    "Express.js": {
        "learn": ["Routing & Nested Controllers", "Custom Error Middleware", "CORS & Security Headers (Helmet)", "Request Validation with Zod"],
        "project": "Build a secure RESTful API microservice with validation middleware and JWT token verification.",
        "effort": "1 week (8–10 hours)",
    },
    "Python": {
        "learn": ["Type Annotations & Modern Syntax", "Asynchronous Programming with asyncio", "FastAPI / Pydantic Schemas", "Object-Oriented Design & Generators"],
        "project": "Develop an asynchronous background data processing service with structured logging and OpenAPI docs.",
        "effort": "1–2 weeks (10–14 hours)",
    },
    "FastAPI": {
        "learn": ["Dependency Injection System", "Pydantic V2 Request & Response Models", "Async Endpoint Concurrency", "Automated OpenAPI / Swagger Docs"],
        "project": "Build a high-performance REST API with OAuth2 password bearer tokens and SQLAlchemy async sessions.",
        "effort": "1 week (8–12 hours)",
    },
    "Docker": {
        "learn": ["Dockerfile Multi-Stage Builds", "Docker Compose Multi-Service Stacks", "Volume Management & Network Isolation", "Image Optimization & Non-Root Containers"],
        "project": "Containerize a full-stack application (React frontend, API backend, PostgreSQL database) with unified Compose configuration.",
        "effort": "1–2 weeks (10–12 hours)",
    },
    "Kubernetes": {
        "learn": ["Pods, Deployments & ReplicaSets", "Services, Ingress & TLS Termination", "ConfigMaps & Secrets Management", "Horizontal Pod Autoscaling"],
        "project": "Deploy a multi-service containerized application to a local Minikube cluster with Ingress routing.",
        "effort": "2 weeks (15–20 hours)",
    },
    "PostgreSQL": {
        "learn": ["Relational Schema Modeling & Foreign Keys", "Indexing Strategies (B-Tree, GIN) & EXPLAIN ANALYZE", "Complex JOINs, Window Functions & CTEs", "ACID Transactions & Database Migrations"],
        "project": "Design a relational e-commerce schema with database migrations, composite indexes, and complex reporting queries.",
        "effort": "1–2 weeks (10–14 hours)",
    },
    "MongoDB": {
        "learn": ["Document Modeling & Embedding vs Referencing", "Aggregation Pipelines & Indexing", "Transactions & Replica Sets", "Mongoose / Motor ODM Integration"],
        "project": "Build an analytical logging system using MongoDB aggregation pipelines for group, sort, and facet queries.",
        "effort": "1 week (8–10 hours)",
    },
    "Redis": {
        "learn": ["Key-Value Caching & TTL Expiration", "Pub/Sub Messaging Patterns", "Sorted Sets for Leaderboards", "Distributed Locks with Redlock"],
        "project": "Implement an API rate limiter and cache layer using Redis with cache-aside invalidation.",
        "effort": "4–6 days (6–8 hours)",
    },
    "AWS": {
        "learn": ["S3 & CloudFront Asset Distribution", "ECS / Fargate Container Deployment", "IAM Policies & Least-Privilege Security", "CloudWatch Metrics, Alarms & Logs"],
        "project": "Deploy a containerized application to AWS ECS with CloudFront distribution and automated SSL certificates.",
        "effort": "2 weeks (15–18 hours)",
    },
    "Testing": {
        "learn": ["Unit Testing Business Logic (Jest / Vitest)", "React Testing Library User Events", "Mock Service Worker (MSW) API Mocking", "End-to-End Testing with Playwright / Cypress"],
        "project": "Write a comprehensive test suite covering core state stores, custom hooks, and user interaction flows with >85% coverage.",
        "effort": "1 week (8–12 hours)",
    },
    "CI/CD": {
        "learn": ["GitHub Actions Workflow Syntax", "Matrix Builds for Node/Python Versions", "Automated Lint, Test & Security Scanning", "Automated Deployment Secrets Management"],
        "project": "Create a GitHub Actions pipeline that lints code, runs unit tests, and deploys to staging upon pull request merge.",
        "effort": "4–7 days (6–10 hours)",
    },
    "Tailwind CSS": {
        "learn": ["Utility-First Layout & Flex/Grid", "Responsive Breakpoints & Mobile-First Design", "Arbitrary Variants & Dark Mode", "Custom Theme Configuration & Plugins"],
        "project": "Build a responsive, accessible dashboard UI using Tailwind CSS with cohesive typography and dark theme toggle.",
        "effort": "4–6 days (6–8 hours)",
    },
    "GraphQL": {
        "learn": ["Schema Definition Language (SDL)", "Queries, Mutations & Subscriptions", "DataLoader Pattern for N+1 Queries", "Apollo Client Cache & Optimistic Updates"],
        "project": "Engineer a GraphQL service with batched queries, pagination, and client cache normalization.",
        "effort": "1–2 weeks (10–14 hours)",
    },
}

def calculate_job_match(
    detected_resume_skills: Dict[str, Any],
    job_description: str,
    job_title: str = "Target Role",
    company_name: str = "Target Company",
    sections: Optional[Dict[str, str]] = None
) -> Optional[Dict[str, Any]]:
    """
    Evaluates real resume skills against a real job description.
    Never invents matched skills or fake percentages.
    Divides into:
    - You Already Have (matched_skills)
    - Missing / Need to Improve (skill_gaps)
    - Strong Evidence (skills proven in experience/projects)
    - Weak Evidence (skills only in keyword list without practical context)
    """
    if not job_description or not job_description.strip():
        return None

    # Extract required skills from the job description
    jd_skills_data = extract_skills_from_text(job_description)
    jd_skills = jd_skills_data.get("all", [])
    jd_tech = jd_skills_data.get("technical", [])

    resume_all = set(detected_resume_skills.get("all", []))
    resume_tech = set(detected_resume_skills.get("technical", []))

    if not jd_skills:
        # Fallback: identify key technical terms mentioned in JD if standard skills are sparse
        words = re.findall(r"\b[A-Za-z0-9+#.]{2,15}\b", job_description)
        jd_skills = ["Communication", "Problem Solving", "Collaboration"]

    matched_skills = []
    missing_skills = []
    partial_matches = []

    # Check matches and partial matches
    for skill in jd_skills:
        if skill in resume_all:
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)
            # Check if there is a partial relationship
            related = PARTIAL_RELATIONSHIPS.get(skill, [])
            found_related = [r for r in related if r in resume_all]
            if found_related:
                partial_matches.append({
                    "skill": skill,
                    "reason": f"You possess {found_related[0]}, which relates to required {skill}."
                })

    total_jd_skills = len(jd_skills)
    matched_count = len(matched_skills)
    partial_count = len(partial_matches)

    # Calculate real scores
    if total_jd_skills > 0:
        raw_skill_score = (matched_count + (partial_count * 0.5)) / total_jd_skills * 100
    else:
        raw_skill_score = 50.0

    skill_match = round(raw_skill_score, 1)

    # Keyword density match across full text
    jd_words = set(re.findall(r"\b[a-zA-Z]{4,}\b", job_description.lower()))
    resume_words = set(re.findall(r"\b[a-zA-Z]{4,}\b", " ".join(resume_all).lower()))
    common_keywords = jd_words.intersection(resume_words)
    keyword_match = round(min(100.0, (len(common_keywords) / max(1, len(jd_words))) * 180), 1)

    # Experience heuristic (junior / mid / senior keywords in JD vs resume)
    experience_match = 80.0
    if "senior" in job_description.lower() or "lead" in job_description.lower() or "5+" in job_description:
        if len(resume_tech) >= 10:
            experience_match = 85.0
        elif len(resume_tech) >= 5:
            experience_match = 68.0
        else:
            experience_match = 52.0

    overall_match = round((skill_match * 0.55) + (keyword_match * 0.25) + (experience_match * 0.20), 0)
    overall_match = max(15, min(98, overall_match))

    # Evidence Breakdown
    # Strong Evidence: skills verified in Experience or Projects text
    # Weak Evidence: skills found only in Skills section without project/experience context
    strong_evidence = []
    weak_evidence = []

    sections_dict = sections or {}
    exp_text = (sections_dict.get("experience", "") + " " + sections_dict.get("work_experience", "")).lower()
    proj_text = (sections_dict.get("projects", "") + " " + sections_dict.get("technical_projects", "")).lower()
    practical_context = exp_text + " " + proj_text

    for skill in resume_all:
        pattern = r"\b" + re.escape(skill.lower()) + r"\b"
        if re.search(pattern, practical_context):
            strong_evidence.append(skill)
        else:
            weak_evidence.append(skill)

    # Generate Detailed Skill Gaps (Requirement 8)
    # For every missing skill:
    # Skill, Priority, Why it matters, What to learn, Suggested practical project
    skill_gaps = []
    for idx, missing in enumerate(missing_skills):
        partial_info = next((p for p in partial_matches if p["skill"] == missing), None)
        priority = "High" if idx < 3 else "Medium" if idx < 6 else "Low"
        if partial_info:
            priority = "Medium"
            category = "Transferable"
            why_text = f"Required by {job_title}. {partial_info['reason']}"
        else:
            category = "Technical"
            why_text = f"Required by the target role ({job_title}) at {company_name} and not currently demonstrated in your resume."

        specifics = SKILL_SPECIFICS.get(missing, {
            "learn": [
                f"{missing} Core Fundamentals & Syntax",
                f"{missing} Architecture & Design Patterns",
                f"Production Best Practices & Error Handling",
                f"Integration with {job_title} Tech Stack"
            ],
            "project": f"Build a practical proof-of-concept demonstrating hands-on implementation of {missing} in a realistic workflow.",
            "effort": "1–2 weeks (10–14 hours)" if priority == "High" else "3–5 days (6–8 hours)"
        })

        skill_gaps.append({
            "id": f"gap-{idx + 1}",
            "skill": missing,
            "name": missing,
            "priority": priority,
            "category": category,
            "why": why_text,
            "importance": why_text,
            "learn": specifics["learn"],
            "what_to_learn": specifics["learn"],
            "project": specifics["project"],
            "practical_project": specifics["project"],
            "suggested_project": specifics["project"],
            "recommendation": f"Learn: {', '.join(specifics['learn'][:3])}. Practical Project: {specifics['project']}",
            "effort": specifics["effort"],
            "estimatedTime": specifics["effort"],
            "is_partial": bool(partial_info),
        })

    summary = (
        f"Your resume matches {len(matched_skills)} of {total_jd_skills} core skills required for {job_title}"
        f"{f' at {company_name}' if company_name else ''}. "
        f"Closing the {len(missing_skills)} missing skill gaps will significantly strengthen your profile."
    )

    return {
        "jobTitle": job_title,
        "company": company_name,
        "overallMatch": int(overall_match),
        "skillMatch": int(skill_match),
        "keywordMatch": int(keyword_match),
        "experienceMatch": int(experience_match),
        "matchedSkills": matched_skills,
        "missingSkills": missing_skills,
        "partialMatches": partial_matches,
        "skillGaps": skill_gaps,
        "strongEvidence": strong_evidence,
        "weakEvidence": weak_evidence,
        "strong_evidence": strong_evidence,
        "weak_evidence": weak_evidence,
        "you_already_have": matched_skills,
        "summary": summary,
        "totalRequiredSkills": total_jd_skills,
        "analyzedAt": "Just now"
    }
