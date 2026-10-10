import { SKILL_CATEGORIES } from "./skillDictionary.js";

const SKILL_SPECIFICS = {
  TypeScript: {
    learn: [
      "Types & Interfaces",
      "Generics & Utility Types",
      "Type Narrowing & Discriminated Unions",
      "React + TypeScript Component Architecture",
    ],
    project:
      "Migrate an existing React component library to strict TypeScript with generic API handlers and zero 'any' types.",
    estimatedTime: "1–2 weeks (10–15 hours)",
  },
  React: {
    learn: [
      "Custom Hooks (useMemo, useCallback, useRef)",
      "State Management (Zustand / Redux Toolkit)",
      "React 18 Concurrent Rendering",
      "Component Composition & Optimization",
    ],
    project:
      "Build an interactive analytics dashboard featuring virtualized data grids and optimistic UI state transitions.",
    estimatedTime: "2 weeks (15–20 hours)",
  },
  "Next.js": {
    learn: [
      "App Router & React Server Components",
      "Server Actions & Mutations",
      "Streaming UI with Suspense",
      "Static vs Dynamic Caching Patterns",
    ],
    project:
      "Build a fast, SEO-optimized e-commerce storefront with server actions and revalidation triggers.",
    estimatedTime: "1–2 weeks (12–15 hours)",
  },
  "Node.js": {
    learn: [
      "Event Loop & Asynchronous I/O",
      "RESTful Architecture & Middleware",
      "JWT Authentication & Role-Based Access Control",
      "Error Handling & Logging Best Practices",
    ],
    project:
      "Build a production-grade REST API backend with rate-limiting, centralized error handling, and automated integration tests.",
    estimatedTime: "1–2 weeks (10–14 hours)",
  },
  "Express.js": {
    learn: [
      "Routing & Nested Controllers",
      "Custom Error Middleware",
      "CORS & Security Headers (Helmet)",
      "Request Validation with Zod",
    ],
    project:
      "Build a secure RESTful API microservice with validation middleware and JWT token verification.",
    estimatedTime: "1 week (8–10 hours)",
  },
  Python: {
    learn: [
      "Type Annotations & Modern Syntax",
      "Asynchronous Programming with asyncio",
      "FastAPI / Pydantic Schemas",
      "Object-Oriented Design & Generators",
    ],
    project:
      "Develop an asynchronous background data processing service with structured logging and OpenAPI docs.",
    estimatedTime: "1–2 weeks (10–14 hours)",
  },
  FastAPI: {
    learn: [
      "Dependency Injection System",
      "Pydantic V2 Request & Response Models",
      "Async Endpoint Concurrency",
      "Automated OpenAPI / Swagger Docs",
    ],
    project:
      "Build a high-performance REST API with OAuth2 password bearer tokens and SQLAlchemy async sessions.",
    estimatedTime: "1 week (8–12 hours)",
  },
  Docker: {
    learn: [
      "Dockerfile Multi-Stage Builds",
      "Docker Compose Multi-Service Stacks",
      "Volume Management & Network Isolation",
      "Image Optimization & Non-Root Containers",
    ],
    project:
      "Containerize a full-stack application (React frontend, API backend, PostgreSQL database) with unified Compose configuration.",
    estimatedTime: "1–2 weeks (10–12 hours)",
  },
  Kubernetes: {
    learn: [
      "Pods, Deployments & ReplicaSets",
      "Services, Ingress & TLS Termination",
      "ConfigMaps & Secrets Management",
      "Horizontal Pod Autoscaling",
    ],
    project:
      "Deploy a multi-service containerized application to a local Minikube cluster with Ingress routing.",
    estimatedTime: "2 weeks (15–20 hours)",
  },
  PostgreSQL: {
    learn: [
      "Relational Schema Modeling & Foreign Keys",
      "Indexing Strategies (B-Tree, GIN) & EXPLAIN ANALYZE",
      "Complex JOINs, Window Functions & CTEs",
      "ACID Transactions & Database Migrations",
    ],
    project:
      "Design a relational e-commerce schema with database migrations, composite indexes, and complex reporting queries.",
    estimatedTime: "1–2 weeks (10–14 hours)",
  },
  MongoDB: {
    learn: [
      "Document Modeling & Embedding vs Referencing",
      "Aggregation Pipelines & Indexing",
      "Transactions & Replica Sets",
      "Mongoose / Motor ODM Integration",
    ],
    project:
      "Build an analytical logging system using MongoDB aggregation pipelines for group, sort, and facet queries.",
    estimatedTime: "1 week (8–10 hours)",
  },
  Redis: {
    learn: [
      "Key-Value Caching & TTL Expiration",
      "Pub/Sub Messaging Patterns",
      "Sorted Sets for Leaderboards",
      "Distributed Locks with Redlock",
    ],
    project:
      "Implement an API rate limiter and cache layer using Redis with cache-aside invalidation.",
    estimatedTime: "4–6 days (6–8 hours)",
  },
  AWS: {
    learn: [
      "S3 & CloudFront Asset Distribution",
      "ECS / Fargate Container Deployment",
      "IAM Policies & Least-Privilege Security",
      "CloudWatch Metrics, Alarms & Logs",
    ],
    project:
      "Deploy a containerized application to AWS ECS with CloudFront distribution and automated SSL certificates.",
    estimatedTime: "2 weeks (15–18 hours)",
  },
  Testing: {
    learn: [
      "Unit Testing Business Logic (Jest / Vitest)",
      "React Testing Library User Events",
      "Mock Service Worker (MSW) API Mocking",
      "End-to-End Testing with Playwright / Cypress",
    ],
    project:
      "Write a comprehensive test suite covering core state stores, custom hooks, and user interaction flows with >85% coverage.",
    estimatedTime: "1 week (8–12 hours)",
  },
  "CI/CD": {
    learn: [
      "GitHub Actions Workflow Syntax",
      "Matrix Builds for Node/Python Versions",
      "Automated Lint, Test & Security Scanning",
      "Automated Deployment Secrets Management",
    ],
    project:
      "Create a GitHub Actions pipeline that lints code, runs unit tests, and deploys to staging upon pull request merge.",
    estimatedTime: "4–7 days (6–10 hours)",
  },
  "Tailwind CSS": {
    learn: [
      "Utility-First Layout & Flex/Grid",
      "Responsive Breakpoints & Mobile-First Design",
      "Arbitrary Variants & Dark Mode",
      "Custom Theme Configuration & Plugins",
    ],
    project:
      "Build a responsive, accessible dashboard UI using Tailwind CSS with cohesive typography and dark theme toggle.",
    estimatedTime: "4–6 days (6–8 hours)",
  },
  GraphQL: {
    learn: [
      "Schema Definition Language (SDL)",
      "Queries, Mutations & Subscriptions",
      "DataLoader Pattern for N+1 Queries",
      "Apollo Client Cache & Optimistic Updates",
    ],
    project:
      "Engineer a GraphQL service with batched queries, pagination, and client cache normalization.",
    estimatedTime: "1–2 weeks (10–14 hours)",
  },
};

/**
 * Extracts required skills from job description text
 */
export function extractJobRequiredSkills(jdText) {
  if (!jdText || typeof jdText !== "string") return [];

  const normalized = jdText.toLowerCase();
  const required = new Set();

  for (const category of Object.values(SKILL_CATEGORIES)) {
    for (const skill of category.skills) {
      const isPresent = skill.aliases.some((alias) => {
        const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(?:^|[^a-zA-Z0-9_#+])${escaped}(?:$|[^a-zA-Z0-9_#+])`, "i");
        return regex.test(normalized);
      });

      if (isPresent) {
        required.add(skill.name);
      }
    }
  }

  // If very few specific keywords detected, fallback to core engineering skills mentioned
  if (required.size === 0) {
    if (/frontend|react|web/i.test(normalized)) {
      ["React", "JavaScript", "HTML5", "CSS3", "Git"].forEach((s) => required.add(s));
    } else if (/backend|api|server|database/i.test(normalized)) {
      ["Node.js", "Python", "SQL", "REST API", "Git"].forEach((s) => required.add(s));
    }
  }

  return Array.from(required);
}

/**
 * Compares resume skills against a real job description
 */
export function calculateJobMatch(
  resumeSkills,
  jdText,
  jobTitle = "Target Role",
  company = "Target Company",
  sections = {}
) {
  if (!jdText || !jdText.trim()) {
    return null;
  }

  const jdRequiredSkills = extractJobRequiredSkills(jdText);
  const candidateSkills = new Set(
    (resumeSkills?.all || []).map((s) => s.toLowerCase())
  );

  const matched = [];
  const missing = [];
  const partiallyMatched = [];

  jdRequiredSkills.forEach((skillName) => {
    const isDirectMatch = candidateSkills.has(skillName.toLowerCase());

    if (isDirectMatch) {
      matched.push(skillName);
    } else {
      const isPartial = checkPartialMatch(skillName, candidateSkills);
      if (isPartial) {
        partiallyMatched.push({
          requiredSkill: skillName,
          relatedSkillFound: isPartial,
        });
      }
      missing.push(skillName);
    }
  });

  const totalRequired = Math.max(1, jdRequiredSkills.length);
  const scoreRaw = ((matched.length + partiallyMatched.length * 0.4) / totalRequired) * 100;
  const overallMatch = Math.min(98, Math.max(25, Math.round(scoreRaw)));

  const keywordMatch = Math.min(
    95,
    Math.max(30, Math.round((matched.length / totalRequired) * 100) + 5)
  );

  const jdHasSenior = /senior|lead|principal|staff|5\+|7\+/i.test(jdText);
  const experienceMatch = jdHasSenior ? 68 : 84;

  // Evidence Breakdown
  const expText = ((sections?.experience || "") + " " + (sections?.work_experience || "")).toLowerCase();
  const projText = ((sections?.projects || "") + " " + (sections?.technical_projects || "")).toLowerCase();
  const practicalContext = `${expText} ${projText}`;

  const allDetected = resumeSkills?.all || [];
  const strongEvidence = [];
  const weakEvidence = [];

  allDetected.forEach((sk) => {
    const escaped = sk.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const reg = new RegExp(`\\b${escaped}\\b`, "i");
    if (reg.test(practicalContext)) {
      strongEvidence.push(sk);
    } else {
      weakEvidence.push(sk);
    }
  });

  // Generate structured skill gaps for missing skills (Requirement 8)
  const skillGaps = missing.map((skill, index) => {
    const priority = index < 2 ? "High" : index < 4 ? "Medium" : "Low";
    const specifics = SKILL_SPECIFICS[skill] || {
      learn: [
        `${skill} Core Fundamentals & Syntax`,
        `${skill} Architecture & Design Patterns`,
        "Production Best Practices & Error Handling",
        `Integration with ${jobTitle} Tech Stack`,
      ],
      project: `Build a practical proof-of-concept demonstrating hands-on implementation of ${skill} in a realistic workflow.`,
      estimatedTime: priority === "High" ? "1–2 weeks (10–14 hours)" : "3–5 days (6–8 hours)",
    };

    const why = `Required by the target role (${jobTitle})${
      company ? ` at ${company}` : ""
    } and not currently demonstrated in your resume.`;

    return {
      id: `gap-${index + 1}`,
      skill,
      name: skill,
      priority,
      status: "Missing",
      why,
      importance: why,
      learn: specifics.learn,
      what_to_learn: specifics.learn,
      project: specifics.project,
      practical_project: specifics.project,
      suggested_project: specifics.project,
      recommendation: `Learn: ${specifics.learn.slice(0, 3).join(", ")}. Practical Project: ${specifics.project}`,
      estimatedTime: specifics.estimatedTime,
      effort: specifics.estimatedTime,
      roadmapWeek: (index % 4) + 1,
    };
  });

  // Add partial matches as medium priority gaps
  partiallyMatched.forEach((partial, pIndex) => {
    const pSkill = partial.requiredSkill;
    const specifics = SKILL_SPECIFICS[pSkill] || {
      learn: [
        `Advanced ${pSkill} Patterns`,
        `Transitioning from ${partial.relatedSkillFound} to ${pSkill}`,
        "Production Optimization",
      ],
      project: `Build a feature using ${pSkill} leveraging your existing domain knowledge.`,
      estimatedTime: "4–7 days (6–10 hours)",
    };

    const why = `Required by ${jobTitle}. You possess ${partial.relatedSkillFound}, which relates to required ${pSkill}.`;

    skillGaps.push({
      id: `gap-partial-${pIndex + 1}`,
      skill: pSkill,
      name: pSkill,
      priority: "Medium",
      status: "Partial",
      why,
      importance: why,
      learn: specifics.learn,
      what_to_learn: specifics.learn,
      project: specifics.project,
      practical_project: specifics.project,
      suggested_project: specifics.project,
      recommendation: `Bridge foundation to master ${pSkill}. Practical Project: ${specifics.project}`,
      estimatedTime: specifics.estimatedTime,
      effort: specifics.estimatedTime,
      roadmapWeek: (pIndex % 4) + 1,
    });
  });

  const summary = `Your resume matches ${matched.length} of ${totalRequired} core skills required for ${jobTitle}${
    company ? ` at ${company}` : ""
  }. Bridging the ${missing.length} missing skill${missing.length === 1 ? "" : "s"} will increase your competitiveness to ${Math.min(95, overallMatch + 20)}%.`;

  return {
    jobTitle,
    company,
    description: jdText,
    overallMatch,
    skillMatch: Math.round(scoreRaw),
    keywordMatch,
    experienceMatch,
    matchedSkills: matched,
    missingSkills: missing,
    partiallyMatchedSkills: partiallyMatched,
    skillGaps,
    strongEvidence,
    weakEvidence,
    strong_evidence: strongEvidence,
    weak_evidence: weakEvidence,
    you_already_have: matched,
    summary,
    totalRequiredSkills: totalRequired,
    analyzedAt: "Just now",
  };
}

function checkPartialMatch(requiredSkill, candidateSkills) {
  const partialMap = {
    "Next.js": ["react"],
    TypeScript: ["javascript"],
    PostgreSQL: ["mysql", "sql", "sqlite"],
    Docker: ["linux", "git"],
    Kubernetes: ["docker"],
    FastAPI: ["python", "django", "flask"],
    "Express.js": ["node.js", "javascript"],
    "React Native": ["react"],
    Vitest: ["jest", "unit testing"],
  };

  const related = partialMap[requiredSkill];
  if (related) {
    for (const r of related) {
      if (candidateSkills.has(r)) return r;
    }
  }

  return null;
}
