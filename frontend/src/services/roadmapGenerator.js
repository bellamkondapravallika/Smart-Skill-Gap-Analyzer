/**
 * Dynamically generates a 4-week learning roadmap based on the candidate's ACTUAL detected skill gaps
 * @param {Array} skillGaps array of missing skill gap objects
 * @param {Array} detectedSkills list of skills candidate already possesses
 * @param {string} targetRole target role title
 * @returns {Array} 4-week structured roadmap
 */
export function generateDynamicRoadmap(skillGaps = [], detectedSkills = [], _targetRole = "Frontend Developer") {
  // If no skill gaps provided, generate advanced mastery track for their role
  const gapsToSchedule = [...skillGaps];

  if (gapsToSchedule.length === 0) {
    // Generate role advancement topics
    return [
      {
        id: "road-1",
        week: "Week 1",
        focus: "Advanced System Architecture & Performance",
        outcome: "Optimize application render cycles, bundle sizes, and network performance.",
        priority: "HIGH PRIORITY",
        estimatedHours: "8 hrs",
        completed: false,
        milestones: [
          { id: "m-1-1", title: "Audit Core Web Vitals using Chrome DevTools & Lighthouse", done: false },
          { id: "m-1-2", title: "Implement code splitting and dynamic imports for heavy components", done: false },
          { id: "m-1-3", title: "Optimize asset caching and memoization strategies", done: false },
        ],
        resources: [
          { title: "Web.dev Performance Guides", type: "Docs", link: "https://web.dev/fast/" },
        ],
      },
      {
        id: "road-2",
        week: "Week 2",
        focus: "Production Automated Testing & CI/CD",
        outcome: "Establish full test suite coverage and automated deployment checks.",
        priority: "MEDIUM PRIORITY",
        estimatedHours: "8 hrs",
        completed: false,
        milestones: [
          { id: "m-2-1", title: "Write component integration tests with mocking", done: false },
          { id: "m-2-2", title: "Set up GitHub Actions to run test suites on PRs", done: false },
          { id: "m-2-3", title: "Configure preview deployments on pull requests", done: false },
        ],
        resources: [
          { title: "GitHub Actions Documentation", type: "Guide", link: "https://docs.github.com/en/actions" },
        ],
      },
    ];
  }

  // Create weeks dynamically mapped to actual missing skills
  const roadmapWeeks = [];
  const maxWeeks = Math.min(4, Math.max(2, gapsToSchedule.length));

  for (let i = 0; i < maxWeeks; i++) {
    const gap = gapsToSchedule[i] || { skill: "Engineering Best Practices", priority: "MEDIUM PRIORITY" };
    const weekNum = i + 1;
    const skillName = gap.skill;

    const milestones = getMilestonesForSkill(skillName, detectedSkills);
    const resources = getResourcesForSkill(skillName);

    roadmapWeeks.push({
      id: `road-${weekNum}`,
      week: `Week ${weekNum}`,
      focus: `${skillName} Mastery & Application`,
      outcome: `Master core principles of ${skillName} and apply them to a production-grade portfolio project.`,
      priority: gap.priority || "HIGH PRIORITY",
      estimatedHours: gap.estimatedTime || "8-10 hrs",
      completed: false,
      milestones,
      resources,
    });
  }

  return roadmapWeeks;
}

function getMilestonesForSkill(skill, _detectedSkills) {
  const skillLower = skill.toLowerCase();

  if (skillLower.includes("typescript")) {
    return [
      { id: `m-${skill}-1`, title: "Understand primitive types, interfaces, and union types", done: false },
      { id: `m-${skill}-2`, title: "Type React props, hooks (useState, useReducer), and synthetic events", done: false },
      { id: `m-${skill}-3`, title: "Implement generic functions and utility types (Partial, Pick, Omit)", done: false },
      { id: `m-${skill}-4`, title: "Convert an existing JavaScript component or mini-app to strict TypeScript", done: false },
    ];
  }

  if (skillLower.includes("test") || skillLower.includes("jest") || skillLower.includes("rtl")) {
    return [
      { id: `m-${skill}-1`, title: "Configure Vitest/Jest and write basic assertion tests", done: false },
      { id: `m-${skill}-2`, title: "Query DOM elements using accessible RTL queries (getByRole, findByRole)", done: false },
      { id: `m-${skill}-3`, title: "Simulate user clicks and typing using @testing-library/user-event", done: false },
      { id: `m-${skill}-4`, title: "Mock asynchronous API requests and test loading and error states", done: false },
    ];
  }

  if (skillLower.includes("docker") || skillLower.includes("container")) {
    return [
      { id: `m-${skill}-1`, title: "Learn Docker fundamentals: images, containers, and layers", done: false },
      { id: `m-${skill}-2`, title: "Write a multi-stage Dockerfile to build and run a web app", done: false },
      { id: `m-${skill}-3`, title: "Configure docker-compose to run frontend, backend, and database together", done: false },
      { id: `m-${skill}-4`, title: "Optimize container image size using Alpine base images", done: false },
    ];
  }

  if (skillLower.includes("next")) {
    return [
      { id: `m-${skill}-1`, title: "Explore Next.js App Router, file-based routing, and layout nesting", done: false },
      { id: `m-${skill}-2`, title: "Understand Server Components vs 'use client' boundary conventions", done: false },
      { id: `m-${skill}-3`, title: "Implement data fetching with React cache, ISR, and Server Actions", done: false },
      { id: `m-${skill}-4`, title: "Deploy a full-stack Next.js application with metadata SEO to Vercel", done: false },
    ];
  }

  if (skillLower.includes("ci/cd") || skillLower.includes("actions")) {
    return [
      { id: `m-${skill}-1`, title: "Understand CI/CD core concepts: pipelines, triggers, and artifacts", done: false },
      { id: `m-${skill}-2`, title: "Create a GitHub Actions workflow to run ESLint and automated tests", done: false },
      { id: `m-${skill}-3`, title: "Configure automated branch protection rules requiring passing checks", done: false },
      { id: `m-${skill}-4`, title: "Automate preview deployment upon pull request creation", done: false },
    ];
  }

  if (skillLower.includes("sql") || skillLower.includes("postgres") || skillLower.includes("database")) {
    return [
      { id: `m-${skill}-1`, title: "Design relational schema with primary/foreign keys and normalization", done: false },
      { id: `m-${skill}-2`, title: "Write complex SELECT queries with JOINs, GROUP BY, and aggregates", done: false },
      { id: `m-${skill}-3`, title: "Optimize query execution with indexes and EXPLAIN ANALYZE", done: false },
      { id: `m-${skill}-4`, title: "Integrate an ORM/query builder (Prisma or SQLAlchemy) into an API", done: false },
    ];
  }

  // Generic customized milestone template
  return [
    { id: `m-${skill}-1`, title: `Learn core syntax, mental model, and best practices of ${skill}`, done: false },
    { id: `m-${skill}-2`, title: `Set up local development environment and run a hello-world project in ${skill}`, done: false },
    { id: `m-${skill}-3`, title: `Build a practical feature integrating ${skill} with your existing tech stack`, done: false },
    { id: `m-${skill}-4`, title: `Document the architectural trade-offs and push code to GitHub with tests`, done: false },
  ];
}

function getResourcesForSkill(skill) {
  const skillLower = skill.toLowerCase();

  if (skillLower.includes("typescript")) {
    return [
      { title: "TypeScript Official Handbook", type: "Docs", link: "https://www.typescriptlang.org/docs/" },
      { title: "React TypeScript Cheatsheet", type: "Guide", link: "https://react-typescript-cheatsheet.netlify.app/" },
    ];
  }
  if (skillLower.includes("test")) {
    return [
      { title: "React Testing Library Guide", type: "Docs", link: "https://testing-library.com/react" },
      { title: "Vitest Official Guide", type: "Guide", link: "https://vitest.dev/guide/" },
    ];
  }
  if (skillLower.includes("docker")) {
    return [
      { title: "Docker Getting Started Guide", type: "Docs", link: "https://docs.docker.com/get-started/" },
    ];
  }
  if (skillLower.includes("next")) {
    return [
      { title: "Next.js 14 App Router Tutorial", type: "Interactive", link: "https://nextjs.org/learn" },
    ];
  }

  return [
    { title: `${skill} Official Documentation & Guides`, type: "Docs", link: `https://www.google.com/search?q=${encodeURIComponent(skill + " documentation")}` },
  ];
}
