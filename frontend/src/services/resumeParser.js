import { SKILL_CATEGORIES } from "./skillDictionary.js";

// Common resume section header keywords
const SECTION_KEYWORDS = {
  summary: [
    "summary",
    "professional summary",
    "career summary",
    "executive summary",
    "about me",
    "profile",
    "objective",
    "career objective",
  ],
  experience: [
    "experience",
    "work experience",
    "professional experience",
    "employment history",
    "work history",
    "internship",
    "internships",
  ],
  projects: [
    "projects",
    "technical projects",
    "personal projects",
    "key projects",
    "academic projects",
    "portfolio projects",
  ],
  skills: [
    "skills",
    "technical skills",
    "core competencies",
    "technologies",
    "tech stack",
    "skills & competencies",
    "skills & tools",
    "tools & technologies",
  ],
  education: [
    "education",
    "academic background",
    "academic history",
    "degrees",
    "qualifications",
  ],
  certifications: [
    "certifications",
    "certificates",
    "credentials",
    "licenses",
    "courses",
  ],
  achievements: [
    "achievements",
    "awards",
    "honors",
    "accomplishments",
    "publications",
  ],
  languages: [
    "languages",
    "spoken languages",
  ],
};

const STRONG_ACTION_VERBS = [
  "architected", "engineered", "spearheaded", "developed", "built", "designed",
  "implemented", "streamlined", "optimized", "automated", "deployed", "authored",
  "refactored", "mentored", "delivered", "integrated", "managed", "coordinated",
  "orchestrated", "led", "boosted", "accelerated", "established", "reduced",
  "increased", "scaled", "formulated", "executed", "launched", "created"
];

const WEAK_VERB_PATTERNS = [
  { pattern: /\b(?:worked on|work on)\b/i, fixWord: "Engineered" },
  { pattern: /\b(?:responsible for|responsibility was)\b/i, fixWord: "Spearheaded" },
  { pattern: /\b(?:helped with|helped to|assisted in|assisted with)\b/i, fixWord: "Collaborated to deliver" },
  { pattern: /\b(?:did|handled|involved in)\b/i, fixWord: "Orchestrated" },
  { pattern: /\b(?:duties included)\b/i, fixWord: "Executed core responsibilities including" },
  { pattern: /\b(?:made|created a)\b/i, fixWord: "Architected and delivered" },
];

/**
 * Parses raw text into structured resume sections, contact info, detected skills, and metrics
 * @param {string} rawText
 * @returns {object} structured resume data
 */
export function parseResume(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("No text content available to parse.");
  }

  const cleanText = rawText.replace(/\r\n/g, "\n");
  const lines = cleanText.split("\n").map((l) => l.trim()).filter(Boolean);

  // 1. Extract contact information
  const contact = extractContactInfo(cleanText, lines);

  // 2. Identify and slice sections
  const sections = extractSections(cleanText, lines);

  // 3. Detect skills across all sections
  const detectedSkills = extractSkills(cleanText);

  // 4. Extract bullet points from experience and projects
  const bullets = extractBullets(sections);

  // 5. Detect quantifiable metrics
  const metrics = extractMetrics(cleanText);

  // 6. Action verb frequency
  const actionVerbCount = countActionVerbs(cleanText);

  // 7. Find weak statements for improvement
  const weakStatements = findWeakStatements(bullets);

  return {
    rawText: cleanText,
    candidateName: contact.name,
    contact,
    sections,
    detectedSkills,
    bullets,
    metrics,
    actionVerbCount,
    weakStatements,
    wordCount: cleanText.split(/\s+/).filter(Boolean).length,
    lineCount: lines.length,
  };
}

/**
 * Extracts candidate contact information
 */
function extractContactInfo(text, lines) {
  // Candidate Name extraction heuristic:
  // Usually in the first 1-3 non-empty lines, doesn't contain "@", "http", or common section headers
  let candidateName = "Candidate";
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const candidate = lines[i];
    if (
      candidate.length >= 3 &&
      candidate.length <= 40 &&
      !candidate.includes("@") &&
      !candidate.includes("http") &&
      !candidate.includes("www") &&
      !candidate.includes("|") &&
      !/resume|curriculum|vitae|page|contact/i.test(candidate) &&
      /^[A-Za-z\s.'-]+$/.test(candidate)
    ) {
      candidateName = candidate;
      break;
    }
  }

  // Email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : null;

  // Phone: standard international or US phone formats
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : null;

  // LinkedIn
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|profile)\/[a-zA-Z0-9_-]+/i);
  const linkedin = linkedinMatch ? linkedinMatch[0] : null;

  // GitHub
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  const github = githubMatch ? githubMatch[0] : null;

  // Portfolio or personal website
  const portfolioMatch = text.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.(?:vercel\.app|netlify\.app|dev|io|tech|me|co)\b/i);
  const portfolio = portfolioMatch ? portfolioMatch[0] : null;

  // Location heuristic
  const locationMatch = text.match(/(?:Location|Address)?\s*[:-]?\s*([A-Za-z\s]+,\s*[A-Za-z]{2,}(?:\s+\d{5})?)/);
  const location = locationMatch ? locationMatch[1].trim() : null;

  return {
    name: candidateName,
    email,
    phone,
    linkedin,
    github,
    portfolio,
    location,
  };
}

/**
 * Slices the resume text into sections based on recognized headings
 */
function extractSections(text, lines) {
  const sections = {
    summary: "",
    experience: "",
    projects: "",
    skills: "",
    education: "",
    certifications: "",
    achievements: "",
    languages: "",
    other: "",
  };

  const detectedHeaders = [];

  lines.forEach((line, index) => {
    const cleanLine = line.trim().toLowerCase().replace(/[:#*_-]/g, "").trim();

    // Check if line matches any section keyword
    for (const [sectionKey, keywords] of Object.entries(SECTION_KEYWORDS)) {
      if (keywords.includes(cleanLine) || keywords.some((kw) => cleanLine === kw.toLowerCase())) {
        detectedHeaders.push({
          section: sectionKey,
          lineIndex: index,
          originalHeader: line,
        });
        break;
      }
    }
  });

  // If headers were detected, slice text between header line indexes
  if (detectedHeaders.length > 0) {
    detectedHeaders.sort((a, b) => a.lineIndex - b.lineIndex);

    for (let i = 0; i < detectedHeaders.length; i++) {
      const current = detectedHeaders[i];
      const nextIndex = i + 1 < detectedHeaders.length ? detectedHeaders[i + 1].lineIndex : lines.length;
      const sectionContent = lines.slice(current.lineIndex + 1, nextIndex).join("\n").trim();
      sections[current.section] = sectionContent;
    }
  } else {
    // Fallback: If no standard uppercase/clean headers were found, do fuzzy scan
    sections.other = text;
  }

  return sections;
}

/**
 * Detects skills from text against our dictionary
 */
function extractSkills(text) {
  const normalizedText = text.toLowerCase();
  const detectedByCategory = {
    programming: [],
    frontend: [],
    backend: [],
    database: [],
    cloudDevops: [],
    testing: [],
    tools: [],
    aiData: [],
    softSkills: [],
  };

  const allDetected = new Set();

  for (const [categoryKey, categoryData] of Object.entries(SKILL_CATEGORIES)) {
    for (const skill of categoryData.skills) {
      const hasSkill = skill.aliases.some((alias) => {
        // Safe regex boundary matching
        const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        // Special boundary handling for symbols like C++, C#, .NET
        const regex = new RegExp(`(?:^|[^a-zA-Z0-9_#+])${escaped}(?:$|[^a-zA-Z0-9_#+])`, "i");
        return regex.test(normalizedText);
      });

      if (hasSkill) {
        if (!allDetected.has(skill.name)) {
          allDetected.add(skill.name);
          detectedByCategory[categoryKey].push(skill.name);
        }
      }
    }
  }

  // Combine technical domains for dashboard display
  const technical = [
    ...detectedByCategory.programming,
    ...detectedByCategory.frontend,
    ...detectedByCategory.backend,
    ...detectedByCategory.database,
    ...detectedByCategory.cloudDevops,
    ...detectedByCategory.testing,
  ];

  return {
    all: Array.from(allDetected),
    byCategory: detectedByCategory,
    technical,
    tools: detectedByCategory.tools,
    aiData: detectedByCategory.aiData,
    soft: detectedByCategory.softSkills,
    count: allDetected.size,
  };
}

/**
 * Extracts bullet points from work experience and projects sections
 */
function extractBullets(sections) {
  const textToScan = [sections.experience, sections.projects, sections.other].filter(Boolean).join("\n");
  const rawLines = textToScan.split("\n");
  const bullets = [];

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 15) continue;

    // Bullet indicators
    if (/^[•\-*▪–—\d+.]\s*/.test(trimmed)) {
      bullets.push(trimmed.replace(/^[•\-*▪–—\d+.]\s*/, "").trim());
    } else if (trimmed.length > 30 && /^[A-Z]/.test(trimmed)) {
      // Sentences starting with uppercase that look like statements
      bullets.push(trimmed);
    }
  }

  return bullets.slice(0, 30);
}

/**
 * Extracts measurable achievements and metrics
 */
function extractMetrics(text) {
  const metricRegex = /\b(?:\d+[%kKmMbB]?|\$\d+(?:,\d+)*(?:\.\d+)?|\d+\+|\d+x|\d+\s*(?:percent|users|clients|requests|ms|seconds|minutes|hours|days|weeks|months|years))\b/g;
  const matches = text.match(metricRegex) || [];
  return {
    list: Array.from(new Set(matches)).slice(0, 15),
    count: matches.length,
    hasMetrics: matches.length > 0,
  };
}

/**
 * Counts usage of strong action verbs
 */
function countActionVerbs(text) {
  const normalized = text.toLowerCase();
  let count = 0;
  STRONG_ACTION_VERBS.forEach((verb) => {
    const regex = new RegExp(`\\b${verb}\\b`, "g");
    const matches = normalized.match(regex);
    if (matches) count += matches.length;
  });
  return count;
}

/**
 * Identifies weak statements in resume bullets that need improvement
 */
function findWeakStatements(bullets) {
  const weakList = [];

  for (const bullet of bullets) {
    for (const rule of WEAK_VERB_PATTERNS) {
      if (rule.pattern.test(bullet)) {
        weakList.push({
          original: bullet,
          replacementVerb: rule.fixWord,
          length: bullet.length,
        });
        break;
      }
    }
  }

  // If no explicitly weak verb found, pick shorter vague bullets
  if (weakList.length === 0 && bullets.length > 0) {
    const shortBullets = bullets.filter((b) => b.length < 70 && !/\d+%|\d+x|\$\d+/i.test(b));
    shortBullets.slice(0, 4).forEach((b) => {
      weakList.push({
        original: b,
        replacementVerb: "Engineered and delivered",
        length: b.length,
      });
    });
  }

  return weakList.slice(0, 5);
}
