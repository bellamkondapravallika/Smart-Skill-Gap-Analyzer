from typing import List, Dict, Any

# Knowledge Base for Skill Milestones
SKILL_LEARNING_TRACKS = {
    "TypeScript": {
        "title": "TypeScript Fundamentals & Strict Types",
        "objective": "Master TypeScript type annotations, interfaces, generics, and migrate JavaScript components safely.",
        "topics": ["Basic Types & Type Inference", "Interfaces vs Type Aliases", "Generics & Utility Types", "Typed React Props & State"],
        "practiceTask": "Convert a vanilla JavaScript stateful utility into fully typed TypeScript with no 'any' types.",
        "projectTask": "Build a typed REST client library with generic response interfaces and error handling.",
        "estimatedHours": "10 hrs"
    },
    "Docker": {
        "title": "Docker Containerization & Microservice Packaging",
        "objective": "Build multi-stage Dockerfiles, manage local images/containers, and coordinate multi-service architectures.",
        "topics": ["Docker CLI & Image Layers", "Multi-stage Dockerfile Optimization", "Volume Mounting & Networking", "Docker Compose Multi-Container Orchestration"],
        "practiceTask": "Write a multi-stage Dockerfile for a web service reducing final image size under 150MB.",
        "projectTask": "Containerize a full-stack application (frontend, backend, database) with docker-compose.",
        "estimatedHours": "8 hrs"
    },
    "PostgreSQL": {
        "title": "PostgreSQL Relational Modeling & Index Optimization",
        "objective": "Design normalized database schemas, write complex joins, and optimize query execution plans.",
        "topics": ["Relational Schema Normalization", "Indexing Strategies (B-Tree, GIN)", "Transactions & ACID Guarantees", "Query Optimization with EXPLAIN ANALYZE"],
        "practiceTask": "Write an optimized SQL migration with foreign keys, compound indexes, and check constraints.",
        "projectTask": "Design and benchmark a high-throughput user audit trail schema with partitioning.",
        "estimatedHours": "9 hrs"
    },
    "Node.js": {
        "title": "Node.js Asynchronous Runtime & Event Loop",
        "objective": "Master asynchronous programming, event-driven architecture, streams, and resilient server-side services.",
        "topics": ["Event Loop Architecture & Libuv", "Buffer & Streams Processing", "Cluster & Worker Threads", "Error Handling & Graceful Shutdown"],
        "practiceTask": "Build a high-performance stream pipeline to process large JSON files without exceeding memory limits.",
        "projectTask": "Implement an event-driven file processing worker using Node.js event emitters and streams.",
        "estimatedHours": "10 hrs"
    },
    "Express.js": {
        "title": "Express.js REST API Architecture & Middleware",
        "objective": "Structure modular RESTful services with validation middleware, authentication, and error boundaries.",
        "topics": ["Middleware Pipelines & Error Handlers", "Router Modularization", "JWT Authentication Middleware", "Input Validation & Rate Limiting"],
        "practiceTask": "Create custom rate-limiting and authorization middleware from scratch.",
        "projectTask": "Build a modular CRUD API with route validation, JWT authentication, and structured logging.",
        "estimatedHours": "8 hrs"
    },
    "FastAPI": {
        "title": "FastAPI Asynchronous Microservices & Pydantic Validation",
        "objective": "Build high-speed asynchronous REST APIs with automatic OpenAPI documentation and strict data validation.",
        "topics": ["Async / Await Endpoints", "Pydantic Models & Data Serialization", "Dependency Injection Framework", "SQLAlchemy Async Integration"],
        "practiceTask": "Implement custom Pydantic validators and dependency injectors for request context.",
        "projectTask": "Build a production-ready asynchronous API with automated test suite and OpenAPI specs.",
        "estimatedHours": "8 hrs"
    },
    "Kubernetes": {
        "title": "Kubernetes Cluster Management & Deployment",
        "objective": "Deploy, scale, and manage containerized applications across Kubernetes clusters.",
        "topics": ["Pods, Deployments, and Services", "ConfigMaps & Secrets", "Ingress Controllers", "Horizontal Pod Autoscaling (HPA)"],
        "practiceTask": "Create Kubernetes YAML manifests for deployment, service, and ingress with health checks.",
        "projectTask": "Deploy an autoscaling application cluster with rolling zero-downtime updates.",
        "estimatedHours": "12 hrs"
    },
    "AWS": {
        "title": "AWS Cloud Infrastructure & Serverless",
        "objective": "Architect scalable cloud systems leveraging core AWS compute, storage, and networking services.",
        "topics": ["EC2, ECS & Fargate", "S3 Storage & IAM Role Policies", "Lambda Serverless Functions", "CloudWatch Monitoring & Alerts"],
        "practiceTask": "Configure IAM least-privilege policies and upload assets to secure S3 buckets.",
        "projectTask": "Deploy a serverless background processing pipeline using Lambda, SQS, and S3.",
        "estimatedHours": "10 hrs"
    },
    "GraphQL": {
        "title": "GraphQL Schema Design & Federation",
        "objective": "Design expressive schemas, eliminate over-fetching, and solve N+1 problems with DataLoader.",
        "topics": ["Schemas, Types, Queries & Mutations", "Resolvers & Execution Context", "N+1 Problem & DataLoader", "Subscriptions & Realtime"],
        "practiceTask": "Implement DataLoader caching to batch database queries in a GraphQL resolver.",
        "projectTask": "Build a unified GraphQL gateway aggregating multiple relational tables.",
        "estimatedHours": "8 hrs"
    },
    "CI/CD": {
        "title": "Automated CI/CD Pipelines & Testing Workflows",
        "objective": "Automate linting, unit testing, security scans, and deployment on every pull request.",
        "topics": ["GitHub Actions Workflows", "Automated Lint & Test Gates", "Build Artifact Caching", "Automated Deployment Strategies"],
        "practiceTask": "Write a GitHub Actions YAML matrix testing Python/Node across versions.",
        "projectTask": "Build an end-to-end pipeline that lints, tests, builds Docker image, and triggers staging deployment.",
        "estimatedHours": "6 hrs"
    },
}

def generate_dynamic_roadmap(
    skill_gaps: List[Dict[str, Any]],
    candidate_skills: List[str] = None,
    target_role: str = "Software Engineer"
) -> List[Dict[str, Any]]:
    """
    Dynamically generates a milestone curriculum tailored exclusively to detected gaps.
    Does NOT include skills already present in candidate's resume.
    """
    candidate_skills_set = set([s.lower() for s in (candidate_skills or [])])
    
    # Filter gaps: only keep skills NOT in candidate's existing skills
    gaps_to_learn = []
    for gap in skill_gaps:
        name = gap.get("name", "")
        if name and name.lower() not in candidate_skills_set:
            gaps_to_learn.append(gap)

    # If no gaps or all skills present, generate advanced optimization roadmap
    if not gaps_to_learn:
        return [
            {
                "id": "road-1",
                "week": "Week 1",
                "focus": "System Architecture & Scalability",
                "priority": "HIGH PRIORITY",
                "estimatedHours": "8 hrs",
                "outcome": f"Elevate your {target_role} profile with high-scale architecture and distributed design principles.",
                "topics": ["High-Availability Design", "Caching Strategies (Redis/CDN)", "Database Partitioning"],
                "practiceTask": "Draft a system design diagram for a distributed service handling 100k requests/min.",
                "projectTask": "Benchmark latency across caching tiers in your core application.",
                "completed": False,
                "milestones": [
                    {"id": "m-1-1", "title": "System Design Architecture review", "done": False},
                    {"id": "m-1-2", "title": "End-to-end performance benchmarking", "done": False}
                ],
                "resources": [
                    {"title": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer"}
                ]
            }
        ]

    roadmap = []
    for index, gap in enumerate(gaps_to_learn[:6]): # Up to 6 customized milestones
        skill_name = gap.get("name", "Key Technology")
        priority = gap.get("priority", "HIGH PRIORITY")
        week_num = f"Week {index + 1}"

        track = SKILL_LEARNING_TRACKS.get(skill_name, {
            "title": f"{skill_name} Core Principles & Practical Application",
            "objective": f"Acquire production-grade competency in {skill_name} aligned with {target_role} requirements.",
            "topics": [
                f"{skill_name} Fundamentals & Architecture",
                f"Best Practices, Design Patterns & Error Handling in {skill_name}",
                f"Testing, Debugging & Performance with {skill_name}",
                f"Integration into existing production stack"
            ],
            "practiceTask": f"Complete hands-on exercises and implement a standalone module with {skill_name}.",
            "projectTask": f"Integrate {skill_name} into an end-to-end feature with automated tests.",
            "estimatedHours": "8 hrs"
        })

        roadmap.append({
            "id": f"road-{index + 1}",
            "week": week_num,
            "focus": f"{skill_name} - {track['title']}",
            "priority": priority,
            "estimatedHours": track["estimatedHours"],
            "outcome": track["objective"],
            "topics": track["topics"],
            "practiceTask": track["practiceTask"],
            "projectTask": track["projectTask"],
            "completed": False,
            "milestones": [
                {"id": f"m-{index + 1}-1", "title": f"Complete fundamentals and study core concepts of {skill_name}", "done": False},
                {"id": f"m-{index + 1}-2", "title": f"Practice task: {track['practiceTask'][:60]}...", "done": False},
                {"id": f"m-{index + 1}-3", "title": f"Project milestone: {track['projectTask'][:60]}...", "done": False}
            ],
            "resources": [
                {"title": f"Official {skill_name} Documentation", "url": "https://google.com/search?q=" + skill_name + "+documentation"},
                {"title": f"{skill_name} Production Best Practices Guide", "url": "https://google.com/search?q=" + skill_name + "+best+practices"}
            ]
        })

    return roadmap
