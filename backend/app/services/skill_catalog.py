import re
from typing import Dict, List, Set, Tuple, Any

# Comprehensive Tech & Career Skill Taxonomy
SKILL_TAXONOMY: Dict[str, Dict[str, List[str]]] = {
    "Programming": {
        "Python": [r"\bpython\b", r"\bpython3\b"],
        "JavaScript": [r"\bjavascript\b", r"\bjs\b", r"\bes6\b", r"\becmascript\b"],
        "TypeScript": [r"\btypescript\b", r"\bts\b"],
        "Java": [r"\bjava\b(?!script)"],
        "C++": [r"\bc\+\+\b", r"\bcpp\b"],
        "C": [r"\bc\b(?!\+\+|#)"],
        "C#": [r"\bc#\b", r"\bcsharp\b", r"\b\.net\b"],
        "Go": [r"\bgolang\b", r"\bgo\b(?:\s+developer|\s+programming|\s+backend|\s+code)"],
        "Rust": [r"\brust\b"],
        "PHP": [r"\bphp\b"],
        "Ruby": [r"\bruby\b"],
        "Swift": [r"\bswift\b"],
        "Kotlin": [r"\bkotlin\b"],
        "SQL": [r"\bsql\b"],
        "R": [r"\br\s+programming\b", r"\br\s+language\b", r"\brstudio\b"],
    },
    "Frontend": {
        "React": [r"\breact\b", r"\breactjs\b", r"\breact\.js\b"],
        "Next.js": [r"\bnext\.?js\b", r"\bnextjs\b"],
        "Vue.js": [r"\bvue\b", r"\bvuejs\b", r"\bvue\.js\b"],
        "Angular": [r"\bangular\b", r"\bangularjs\b"],
        "Svelte": [r"\bsvelte\b"],
        "HTML5": [r"\bhtml5?\b"],
        "CSS3": [r"\bcss3?\b"],
        "Tailwind CSS": [r"\btailwind\b", r"\btailwindcss\b"],
        "Redux": [r"\bredux\b", r"\bredux-toolkit\b"],
        "Zustand": [r"\bzustand\b"],
        "Sass": [r"\bsass\b", r"\bscss\b"],
        "Bootstrap": [r"\bbootstrap\b"],
        "Webpack": [r"\bwebpack\b"],
        "Vite": [r"\bvite\b", r"\bvitejs\b"],
    },
    "Backend": {
        "Node.js": [r"\bnode\.?js\b", r"\bnodejs\b"],
        "Express.js": [r"\bexpress\.?js\b", r"\bexpress\b"],
        "FastAPI": [r"\bfastapi\b"],
        "Django": [r"\bdjango\b"],
        "Flask": [r"\bflask\b"],
        "Spring Boot": [r"\bspring\s*boot\b", r"\bspring\s*framework\b"],
        "NestJS": [r"\bnest\.?js\b", r"\bnestjs\b"],
        "REST APIs": [r"\brest\s*api[s]?\b", r"\brestful\b"],
        "GraphQL": [r"\bgraphql\b"],
        "gRPC": [r"\bgrpc\b"],
        "Microservices": [r"\bmicroservices\b", r"\bmicroservice\b"],
    },
    "Database": {
        "PostgreSQL": [r"\bpostgres\b", r"\bpostgresql\b"],
        "MySQL": [r"\bmysql\b"],
        "MongoDB": [r"\bmongodb\b", r"\bmongo\b"],
        "Redis": [r"\bredis\b"],
        "SQLite": [r"\bsqlite\b"],
        "Elasticsearch": [r"\belasticsearch\b"],
        "DynamoDB": [r"\bdynamodb\b"],
        "Cassandra": [r"\bcassandra\b"],
        "Firebase": [r"\bfirebase\b", r"\bfirestore\b"],
        "Supabase": [r"\bsupabase\b"],
    },
    "Cloud": {
        "AWS": [r"\baws\b", r"\bamazon\s*web\s*services\b", r"\bec2\b", r"\bs3\b", r"\blambda\b"],
        "Azure": [r"\bazure\b", r"\bmicrosoft\s*azure\b"],
        "GCP": [r"\bgcp\b", r"\bgoogle\s*cloud\b", r"\bgoogle\s*cloud\s*platform\b"],
        "Cloudflare": [r"\bcloudflare\b"],
        "DigitalOcean": [r"\bdigitalocean\b"],
    },
    "DevOps": {
        "Docker": [r"\bdocker\b", r"\bdockerfile\b", r"\bcontainerization\b"],
        "Kubernetes": [r"\bkubernetes\b", r"\bk8s\b"],
        "CI/CD": [r"\bci/cd\b", r"\bcontinuous\s*integration\b", r"\bcontinuous\s*deployment\b"],
        "GitHub Actions": [r"\bgithub\s*actions\b"],
        "Terraform": [r"\bterraform\b"],
        "Ansible": [r"\bansible\b"],
        "Jenkins": [r"\bjenkins\b"],
        "Linux": [r"\blinux\b", r"\bubuntu\b", r"\bbash\b"],
        "Nginx": [r"\bnginx\b"],
    },
    "AI/Data": {
        "Machine Learning": [r"\bmachine\s*learning\b", r"\bml\b"],
        "Deep Learning": [r"\bdeep\s*learning\b"],
        "NLP": [r"\bnlp\b", r"\bnatural\s*language\s*processing\b"],
        "LLMs": [r"\bllm[s]?\b", r"\blarge\s*language\s*model[s]?\b", r"\blangchain\b"],
        "PyTorch": [r"\bpytorch\b"],
        "TensorFlow": [r"\btensorflow\b", r"\bkeras\b"],
        "Scikit-Learn": [r"\bscikit-learn\b", r"\bsklearn\b"],
        "Pandas": [r"\bpandas\b"],
        "NumPy": [r"\bnumpy\b"],
        "Data Analysis": [r"\bdata\s*analysis\b", r"\bdata\s*science\b"],
    },
    "Tools": {
        "Git": [r"\bgit\b(?!\s*hub|\s*lab)"],
        "GitHub": [r"\bgithub\b"],
        "GitLab": [r"\bgitlab\b"],
        "Postman": [r"\bpostman\b"],
        "Figma": [r"\bfigma\b"],
        "VS Code": [r"\bvs\s*code\b", r"\bvisual\s*studio\s*code\b"],
        "Jira": [r"\bjira\b"],
        "Agile": [r"\bagile\b", r"\bscrum\b"],
        "Unit Testing": [r"\bunit\s*test(?:ing)?\b", r"\bjest\b", r"\bpytest\b", r"\bmock\b"],
    },
    "Soft Skills": {
        "Leadership": [r"\bleadership\b", r"\bmentoring\b", r"\bteam\s*lead\b"],
        "Problem Solving": [r"\bproblem\s*solving\b", r"\bcritical\s*thinking\b"],
        "Communication": [r"\bcommunication\b", r"\bclient\s*presentation\b"],
        "Collaboration": [r"\bcollaboration\b", r"\bcross-functional\b"],
        "System Design": [r"\bsystem\s*design\b", r"\barchitecture\b", r"\bscalable\s*systems\b"],
    }
}

# Related skill mappings for Partial Match calculation
PARTIAL_RELATIONSHIPS = {
    "PostgreSQL": ["SQL", "MySQL", "Relational Database"],
    "MySQL": ["SQL", "PostgreSQL"],
    "TypeScript": ["JavaScript"],
    "Next.js": ["React", "JavaScript"],
    "Docker": ["Linux", "DevOps"],
    "Kubernetes": ["Docker", "DevOps"],
    "FastAPI": ["Python", "Flask", "REST APIs"],
    "Django": ["Python", "Backend"],
    "React": ["JavaScript", "HTML5", "CSS3"],
    "Node.js": ["JavaScript", "Backend"],
    "Express.js": ["Node.js", "JavaScript"],
    "AWS": ["Cloud", "DevOps"],
    "Azure": ["Cloud", "DevOps"],
    "GCP": ["Cloud", "DevOps"],
    "PyTorch": ["Python", "Machine Learning"],
    "TensorFlow": ["Python", "Machine Learning"],
    "GitHub Actions": ["CI/CD", "Git"],
}

def extract_skills_from_text(text: str) -> Dict[str, Any]:
    """
    Scans the given raw text and extracts ONLY skills that actually match regex rules.
    Never invents or hallucinates skills.
    """
    clean_text = " " + text.lower() + " "
    detected_by_category: Dict[str, List[str]] = {}
    all_detected: List[str] = []

    for category, skills_dict in SKILL_TAXONOMY.items():
        detected_by_category[category] = []
        for skill_name, patterns in skills_dict.items():
            matched = False
            for pat in patterns:
                if re.search(pat, clean_text, flags=re.IGNORECASE):
                    matched = True
                    break
            if matched:
                detected_by_category[category].append(skill_name)
                all_detected.append(skill_name)

    # Flatten technical skills
    technical_skills = []
    for cat in ["Programming", "Frontend", "Backend", "Database", "Cloud", "DevOps", "AI/Data"]:
        technical_skills.extend(detected_by_category.get(cat, []))

    return {
        "all": sorted(list(set(all_detected))),
        "technical": sorted(list(set(technical_skills))),
        "tools": detected_by_category.get("Tools", []),
        "soft": detected_by_category.get("Soft Skills", []),
        "byCategory": detected_by_category,
        "count": len(all_detected)
    }
