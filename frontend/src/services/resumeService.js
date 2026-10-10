import { extractResumeText } from "./resumeExtractor.js";
import { parseResume } from "./resumeParser.js";
import { analyzeResumeData } from "./resumeAnalyzer.js";
import { calculateJobMatch } from "./jobMatcher.js";
import { generateDynamicRoadmap } from "./roadmapGenerator.js";
import { generateDynamicInterviewQuestions } from "./interviewGenerator.js";

/**
 * Validates document text on client side to match backend ResumeValidationService.
 */
export function validateResumeDocument(text) {
  if (!text || text.trim().length < 35) {
    return {
      isValid: false,
      reason: "Document contains too few words to be a resume.",
    };
  }

  const clean = text.toLowerCase();

  // Strong anti-signals
  const antiSignals = [
    /\bassignment\s+(?:#?\d+|one|two|three)\b/i,
    /\bhomework\s+(?:#?\d+|submission)\b/i,
    /\bproblem\s+statement\b/i,
    /\blab\s+(?:exercise|report|manual)\b/i,
    /\bsubmission\s+date\b/i,
    /\broll\s+no(?:umber)?\b/i,
    /\blecture\s+notes\b/i,
    /\bchapter\s+\d+\b/i,
    /\bjoin\s+us\s+for\b/i,
    /\bevent\s+(?:venue|date|time)\b/i,
    /\bfree\s+(?:entry|registration)\b/i,
    /\bscan\s+(?:the\s+)?qr\s+code\b/i,
    /\borganized\s+by\s+(?:the\s+)?department\b/i,
    /\binvoice\s+(?:number|#|date)\b/i,
  ];

  if (antiSignals.some((p) => p.test(clean))) {
    return {
      isValid: false,
      reason: "Document appears to be an assignment, poster, or non-career document.",
    };
  }

  // Check section headings
  const sectionPatterns = [
    /\b(?:work\s+)?experience\b/i,
    /\beducation\b/i,
    /\b(?:technical\s+)?skills\b/i,
    /\bprojects?\b/i,
    /\b(?:professional\s+)?summary\b/i,
    /\bcertifications?\b/i,
    /\binternships?\b/i,
  ];

  const matchedSections = sectionPatterns.filter((p) => p.test(clean)).length;
  const hasContact =
    /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/.test(text) ||
    /(?:(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/.test(text);

  if (matchedSections < 2 && !hasContact) {
    return {
      isValid: false,
      reason: "No standard resume headings or contact information detected.",
    };
  }

  return { isValid: true };
}

/**
 * Full Pipeline to process an uploaded resume file
 * @param {File} file
 * @param {string|null} targetRole
 * @param {object|null} targetJob Optional target job object { title, company, description }
 * @returns {Promise<object>} Complete dynamic resumeAnalysis object
 */
export async function processResumeFile(file, targetRole = null, targetJob = null) {
  // 1. Extract text from PDF / DOCX
  const extraction = await extractResumeText(file);

  return processResumeText(
    extraction.text,
    extraction.fileName,
    extraction.fileSize,
    extraction.fileType,
    targetRole,
    targetJob
  );
}

/**
 * Process raw text directly (also used for sample resumes and text input)
 */
export function processResumeText(
  rawText,
  fileName = "Resume.pdf",
  fileSize = "1.8 MB",
  fileType = "PDF",
  targetRole = null,
  targetJob = null
) {
  // Validate text before analysis
  const validation = validateResumeDocument(rawText);
  if (!validation.isValid) {
    throw new Error(
      "This doesn't appear to be a resume. Please upload a valid resume or CV in PDF or DOCX format."
    );
  }

  // 2. Parse text into sections, contact info, detected skills, metrics
  const parsed = parseResume(rawText);

  const effectiveRole = targetRole || parsed.candidateName || "Software Engineer";

  // 3. Analyze content, calculate Resume Score & ATS Score, strengths, weaknesses, rewrites
  const analysisResult = analyzeResumeData(parsed, effectiveRole);

  // 4. Job Match (CONDITIONAL: only if a target job description is provided)
  let jobMatchData = null;
  let activeSkillGaps = [];

  if (targetJob && targetJob.description && targetJob.description.trim()) {
    jobMatchData = calculateJobMatch(
      parsed.detectedSkills,
      targetJob.description,
      targetJob.title || effectiveRole,
      targetJob.company || "Target Company",
      parsed.sections || {}
    );
    activeSkillGaps = jobMatchData.skillGaps || [];
  } else {
    // If no target job is provided, DO NOT fabricate fake gaps!
    activeSkillGaps = [];
  }

  // 5. Generate Dynamic Learning Roadmap from actual skill gaps
  const dynamicRoadmap = generateDynamicRoadmap(
    activeSkillGaps,
    parsed.detectedSkills.technical,
    effectiveRole
  );

  // 6. Generate Dynamic Interview Questions from detected skills and skill gaps
  const interviewQuestions = generateDynamicInterviewQuestions(
    parsed.detectedSkills,
    activeSkillGaps,
    parsed.sections,
    effectiveRole
  );

  return {
    id: `analysis-${Date.now()}`,
    file_name: fileName,
    fileName,
    file_size: fileSize,
    fileSize,
    file_type: fileType,
    fileType,
    word_count: parsed.wordCount,
    wordCount: parsed.wordCount,
    uploaded_at: "Just now",
    uploadedAt: "Just now",
    target_role: targetRole,
    targetRole,
    raw_text: rawText,
    rawText,
    candidate_name: parsed.candidateName,
    candidateName: parsed.candidateName,
    contact_info: parsed.contact,
    contact: parsed.contact,
    sections: parsed.sections,
    detected_skills: parsed.detectedSkills,
    detectedSkills: parsed.detectedSkills,
    scores: {
      overall: analysisResult.overallScore,
      ats: analysisResult.atsScore,
      jobMatch: jobMatchData ? jobMatchData.overallMatch : null, // Conditional!
      skillsCount: parsed.detectedSkills.count,
      improvementsCount: analysisResult.improvementsCount,
      categories: analysisResult.categories,
    },
    summary_verdict: analysisResult.summaryVerdict,
    summaryVerdict: analysisResult.summaryVerdict,
    strengths: analysisResult.strengths,
    weaknesses: analysisResult.improvements,
    improvements: analysisResult.improvements,
    recommendations: analysisResult.improvements,
    ats_analysis: analysisResult.atsAnalysis,
    atsAnalysis: analysisResult.atsAnalysis,
    content_improvements: analysisResult.contentImprovements,
    contentImprovements: analysisResult.contentImprovements,
    target_job: jobMatchData
      ? {
          title: jobMatchData.jobTitle,
          company: jobMatchData.company,
          description: jobMatchData.description,
          overallMatch: jobMatchData.overallMatch,
          keywordMatch: jobMatchData.keywordMatch,
          experienceMatch: jobMatchData.experienceMatch,
          analyzedAt: "Just now",
        }
      : null,
    targetJob: jobMatchData
      ? {
          title: jobMatchData.jobTitle,
          company: jobMatchData.company,
          description: jobMatchData.description,
          overallMatch: jobMatchData.overallMatch,
          keywordMatch: jobMatchData.keywordMatch,
          experienceMatch: jobMatchData.experienceMatch,
          analyzedAt: "Just now",
        }
      : null,
    job_match: jobMatchData,
    jobMatch: jobMatchData,
    skill_gaps: activeSkillGaps,
    skillGaps: activeSkillGaps,
    roadmap: dynamicRoadmap,
    interview_questions: interviewQuestions,
    interviewQuestions,
  };
}

// SAMPLE RESUMES
export const SAMPLE_RESUME_A_FRONTEND = `ALEX MORGAN
alex.morgan@email.com | +1 (555) 234-5678 | San Francisco, CA
linkedin.com/in/alexmorgan | github.com/alexmorgan

PROFESSIONAL SUMMARY
Frontend Developer with 3+ years of experience building modern, responsive single-page applications with React, JavaScript, and Tailwind CSS. Focused on accessible UI components, state management, and API integrations.

TECHNICAL SKILLS
Languages & Core: JavaScript (ES6+), HTML5, CSS3, JSON
Libraries & Frameworks: React 18, Redux Toolkit, Tailwind CSS, Vite
Tools & Workflows: Git, GitHub, REST APIs, Postman, Figma, npm

WORK EXPERIENCE
Frontend Developer | PixelCraft Studio, San Francisco, CA
June 2022 – Present
- Developed modular React components for client eCommerce portals, improving code reusability across 4 production projects.
- Integrated RESTful APIs with Redux Toolkit for seamless client-side state synchronization.
- Converted design mockups from Figma into pixel-perfect, responsive HTML5/CSS3 layouts.
- Collaborated with QA team to resolve cross-browser rendering inconsistencies across mobile and desktop.

Junior Web Developer | InnovateTech Labs, Austin, TX
July 2021 – May 2022
- Maintained company client portals using vanilla JavaScript, HTML5, and CSS3.
- Implemented client-side form validation and interactive modal dialogues.
- Participated in weekly Agile standups and submitted pull requests via GitHub.

TECHNICAL PROJECTS
Penguin Gallery Application | React, JavaScript, CSS3
- Developed an interactive penguin-themed gallery application featuring dynamic image filtering and responsive card layouts.
- Implemented intuitive navigation controls and smooth state transitions.

TaskMaster Dashboard | React, Redux, LocalStorage
- Built a drag-and-drop task management tool supporting custom categories and search filtering.

EDUCATION
Bachelor of Science in Computer Science
University of California, Davis | 2017 – 2021`;

export const SAMPLE_RESUME_B_BACKEND_AI = `JORDAN REYES
jordan.reyes@email.com | +1 (555) 876-5432 | Seattle, WA
linkedin.com/in/jordanreyes | github.com/jordanreyes

PROFESSIONAL SUMMARY
Backend & AI Engineer with 4 years of experience architecting high-throughput distributed APIs, relational data pipelines, and machine learning models in Python and Go.

TECHNICAL SKILLS
Languages: Python, Go, SQL, Bash
Backend & APIs: FastAPI, Django, Flask, REST APIs, gRPC, Microservices
Databases & Cache: PostgreSQL, Redis, MongoDB
Cloud & DevOps: AWS (EC2, S3, RDS), Docker, Kubernetes, CI/CD, Linux
AI / Data: PyTorch, Scikit-Learn, Pandas, NumPy, NLP

WORK EXPERIENCE
Backend Engineer | CloudScale Systems, Seattle, WA
August 2022 – Present
- Built asynchronous microservices using FastAPI and PostgreSQL, serving 12,000+ daily requests with sub-180ms response times.
- Designed relational schemas and optimized indexing queries with EXPLAIN ANALYZE, reducing database CPU load by 35%.
- Containerized core services with Docker and managed deployment pipelines on AWS ECS.

Data Science Intern | DataSphere Analytics, Boston, MA
June 2021 – July 2022
- Developed predictive classification models using Python, Scikit-Learn, and Pandas on customer behavior datasets.
- Implemented automated data cleaning pipelines and generated SQL performance reports.

PROJECTS
Vector Search Document Retrieval | Python, FastAPI, PyTorch, Docker
- Built an embedding-based document retrieval service using PyTorch and semantic similarity search.

EDUCATION
Bachelor of Science in Software Engineering
University of Washington | 2018 – 2022`;
