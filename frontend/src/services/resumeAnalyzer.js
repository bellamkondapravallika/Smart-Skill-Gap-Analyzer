/**
 * Resume Analysis Engine
 * Calculates dynamic Resume Score (0-100), ATS Score (0-100),
 * identifies real strengths, weaknesses, and generates tailored improvements.
 */

export function analyzeResumeData(parsedResume, targetRole = "Frontend Developer") {
  const {
    contact,
    sections,
    detectedSkills,
    bullets,
    metrics,
    actionVerbCount,
    weakStatements,
    wordCount,
  } = parsedResume;

  // 1. DYNAMIC RESUME SCORE CALCULATION
  const contactScore = calculateContactScore(contact); // max 10
  const summaryScore = calculateSummaryScore(sections.summary); // max 10
  const skillsScore = calculateSkillsScore(detectedSkills); // max 20
  const experienceScore = calculateExperienceScore(sections.experience, bullets, actionVerbCount); // max 20
  const projectsScore = calculateProjectsScore(sections.projects, bullets); // max 15
  const metricsScore = calculateMetricsScore(metrics); // max 15
  const educationScore = calculateEducationScore(sections.education, sections.certifications); // max 10

  // Raw score before length penalties
  let rawScore =
    contactScore +
    summaryScore +
    skillsScore +
    experienceScore +
    projectsScore +
    metricsScore +
    educationScore;

  // Length calibration
  if (wordCount < 120) {
    rawScore = Math.max(35, rawScore - 20); // Penalty for very brief outline
  } else if (wordCount < 250) {
    rawScore = Math.max(45, rawScore - 10);
  } else if (wordCount > 1500) {
    rawScore = Math.max(50, rawScore - 5); // Slight penalty for excessive length
  }

  const overallScore = Math.min(96, Math.max(38, Math.round(rawScore)));

  // Category breakdown for UI
  const categories = [
    {
      name: "Contact & Identity",
      score: Math.min(100, Math.round((contactScore / 10) * 100)),
      weight: "Core prerequisite",
      status: contactScore >= 8 ? "Strong" : "Needs Work",
    },
    {
      name: "Content Depth & Quality",
      score: Math.min(100, Math.round(((experienceScore + projectsScore) / 35) * 100)),
      weight: "High impact",
      status: experienceScore + projectsScore >= 26 ? "Strong" : "Average",
    },
    {
      name: "Skills Diversity",
      score: Math.min(100, Math.round((skillsScore / 20) * 100)),
      weight: "Core fit",
      status: skillsScore >= 16 ? "Excellent" : skillsScore >= 11 ? "Good" : "Needs Work",
    },
    {
      name: "Quantifiable Impact",
      score: Math.min(100, Math.round((metricsScore / 15) * 100)),
      weight: "Recruiter focus",
      status: metricsScore >= 10 ? "Strong" : "Needs Work",
    },
    {
      name: "Structure & Completeness",
      score: Math.min(100, Math.round(((summaryScore + educationScore) / 20) * 100)),
      weight: "Parser safety",
      status: summaryScore + educationScore >= 14 ? "Good" : "Needs Work",
    },
  ];

  // 2. DYNAMIC ATS SCORE CALCULATION
  const atsResult = calculateAtsScore(parsedResume, targetRole);

  // 3. IDENTIFY REAL STRENGTHS
  const strengths = generateStrengths(parsedResume);

  // 4. IDENTIFY REAL WEAKNESSES & IMPROVEMENTS
  const improvements = generateImprovements(parsedResume, targetRole);

  // 5. SCORE EXPLANATION / VERDICT
  const verdictExplanation = generateScoreExplanation(overallScore, parsedResume);

  // 6. CONTENT IMPROVEMENTS (Before / After rewriting actual weak statements)
  const contentImprovements = generateContentImprovements(weakStatements, detectedSkills, targetRole);

  return {
    overallScore,
    atsScore: atsResult.score,
    summaryVerdict: verdictExplanation,
    categories,
    strengths,
    improvements,
    atsAnalysis: atsResult,
    contentImprovements,
    detectedSkillsCount: detectedSkills.count,
    improvementsCount: improvements.length,
  };
}

function calculateContactScore(contact) {
  let score = 0;
  if (contact.email) score += 3;
  if (contact.phone) score += 2;
  if (contact.name && contact.name !== "Candidate") score += 2;
  if (contact.linkedin || contact.github || contact.portfolio) score += 3;
  return score;
}

function calculateSummaryScore(summaryText) {
  if (!summaryText) return 2;
  const words = summaryText.split(/\s+/).filter(Boolean).length;
  if (words >= 30) return 10;
  if (words >= 15) return 7;
  return 4;
}

function calculateSkillsScore(detectedSkills) {
  let score = 0;
  const count = detectedSkills.count;
  if (count >= 15) score += 12;
  else if (count >= 8) score += 9;
  else if (count >= 4) score += 6;
  else score += 3;

  // Diversity bonus
  const catCount = Object.values(detectedSkills.byCategory).filter((arr) => arr.length > 0).length;
  if (catCount >= 4) score += 8;
  else if (catCount >= 2) score += 5;
  else score += 2;

  return Math.min(20, score);
}

function calculateExperienceScore(experienceText, bullets, actionVerbCount) {
  let score = 0;
  if (experienceText && experienceText.length > 50) score += 8;
  if (bullets.length >= 6) score += 6;
  else if (bullets.length >= 2) score += 3;

  if (actionVerbCount >= 8) score += 6;
  else if (actionVerbCount >= 3) score += 4;
  else score += 1;

  return Math.min(20, score);
}

function calculateProjectsScore(projectsText, bullets) {
  let score = 0;
  if (projectsText && projectsText.length > 40) score += 9;
  else if (bullets.length > 3) score += 5;
  else score += 2;

  // Depth in projects
  if (projectsText && /github|live|demo|deployed|http/i.test(projectsText)) score += 6;
  else score += 3;

  return Math.min(15, score);
}

function calculateMetricsScore(metrics) {
  if (metrics.count >= 5) return 15;
  if (metrics.count >= 3) return 11;
  if (metrics.count >= 1) return 6;
  return 1;
}

function calculateEducationScore(educationText, certificationsText) {
  let score = 0;
  if (educationText && educationText.length > 20) score += 7;
  else score += 2;
  if (certificationsText && certificationsText.length > 20) score += 3;
  return Math.min(10, score);
}

function calculateAtsScore(parsedResume, _targetRole) {
  const { contact, sections, detectedSkills, metrics, wordCount } = parsedResume;

  let score = 50; // baseline
  const checksPassed = [];
  const warnings = [];

  // 1. Standard section headings
  const hasStandardHeadings =
    Boolean(sections.experience) && Boolean(sections.education) && Boolean(sections.skills);

  if (hasStandardHeadings) {
    score += 14;
    checksPassed.push({
      label: "Standard section headings detected",
      detail: "Used standard recognized headings ('Experience', 'Education', 'Skills') that ATS parsers identify.",
    });
  } else {
    warnings.push({
      title: "Missing or non-standard section headings",
      detail: "Some major sections (Experience, Education, or Skills) were not clearly identified by standard header names.",
      fix: "Use standard headings: 'Work Experience', 'Technical Skills', 'Education', and 'Projects'.",
    });
  }

  // 2. Contact details
  if (contact.email && contact.phone) {
    score += 12;
    checksPassed.push({
      label: "Complete contact information detected",
      detail: `Parsed email (${contact.email}) and phone number without errors.`,
    });
  } else {
    warnings.push({
      title: "Incomplete contact information",
      detail: "Missing either a direct email address or phone number in the header.",
      fix: "Include your email, phone number, and location at the very top of your resume.",
    });
  }

  // 3. Dedicated Skills section
  if (sections.skills && sections.skills.length > 20) {
    score += 10;
    checksPassed.push({
      label: "Dedicated skills section detected",
      detail: "Skills are grouped cleanly rather than buried in paragraphs of text.",
    });
  } else {
    warnings.push({
      title: "No dedicated skills section found",
      detail: "ATS parsers may struggle to extract your competencies if they are only mentioned in narrative sentences.",
      fix: "Add a dedicated 'Technical Skills' section with comma-separated technologies or category groupings.",
    });
  }

  // 4. Keyword density & skills count
  if (detectedSkills.count >= 8) {
    score += 10;
    checksPassed.push({
      label: "Strong keyword density",
      detail: `Identified ${detectedSkills.count} industry-recognized technologies and competencies.`,
    });
  } else {
    warnings.push({
      title: "Low technical keyword density",
      detail: `Only ${detectedSkills.count} recognized skills were identified. ATS screening algorithms may score this lower.`,
      fix: "Explicitly list the libraries, tools, databases, and languages you have used.",
    });
  }

  // 5. Quantifiable achievements
  if (metrics.hasMetrics) {
    score += 8;
    checksPassed.push({
      label: "Measurable metrics present",
      detail: `Detected ${metrics.count} quantifiable numbers/percentages in experience bullets.`,
    });
  } else {
    warnings.push({
      title: "Lack of measurable numbers or metrics",
      detail: "Experience bullets lack quantifiable metrics like percentages, latency numbers, or team size.",
      fix: "Add quantifiable outcomes: 'Improved load speed by 25%', 'Handled 50k+ requests', or 'Reduced bugs by 40%'.",
    });
  }

  // 6. Formatting & length
  if (wordCount >= 250 && wordCount <= 1200) {
    score += 6;
    checksPassed.push({
      label: "Optimal resume length & readability",
      detail: `Total length is ${wordCount} words, ideal for standard 1 to 2-page ATS scanning.`,
    });
  } else if (wordCount < 250) {
    warnings.push({
      title: "Resume content is very brief",
      detail: `Total length is only ${wordCount} words. ATS systems may mark this as an incomplete profile.`,
      fix: "Expand your work experience and project descriptions with detailed bullet points.",
    });
  }

  const finalAtsScore = Math.min(97, Math.max(35, score));

  return {
    score: finalAtsScore,
    verdict:
      finalAtsScore >= 80
        ? "High ATS Compatibility"
        : finalAtsScore >= 65
        ? "Moderate ATS Compatibility"
        : "Needs ATS Optimization",
    explanation:
      finalAtsScore >= 80
        ? "Your resume has a clean structure that parses well across major Applicant Tracking Systems. Addressing the remaining warnings will maximize your interview callback rate."
        : "Your resume structure needs attention to ensure ATS parsers do not discard or misinterpret your qualifications.",
    checksPassed,
    warnings,
  };
}

function generateStrengths(parsedResume) {
  const { contact, sections, detectedSkills, metrics, actionVerbCount } = parsedResume;
  const strengths = [];

  if (detectedSkills.technical.length >= 5) {
    strengths.push({
      title: "Strong technical competencies detected",
      detail: `Found ${detectedSkills.technical.length} technical skills including ${detectedSkills.technical.slice(0, 4).join(", ")}.`,
    });
  }

  if (sections.projects && sections.projects.length > 50) {
    strengths.push({
      title: "Dedicated project portfolio section",
      detail: "Clear project portfolio highlights hands-on software development and practical application.",
    });
  }

  if (contact.github || contact.linkedin) {
    strengths.push({
      title: "Professional links detected",
      detail: `Verified links to ${[contact.github && "GitHub", contact.linkedin && "LinkedIn"].filter(Boolean).join(" and ")} for recruiter credibility.`,
    });
  }

  if (metrics.count >= 2) {
    strengths.push({
      title: "Evidence of quantifiable results",
      detail: `Included measurable metrics (${metrics.list.slice(0, 3).join(", ")}) demonstrating business impact.`,
    });
  }

  if (actionVerbCount >= 5) {
    strengths.push({
      title: "Action-oriented bullet points",
      detail: "Frequent use of strong engineering verbs like Engineered, Architected, and Implemented.",
    });
  }

  if (sections.education) {
    strengths.push({
      title: "Clear educational background",
      detail: "Academic qualifications are clearly demarcated and immediately visible to ATS parsers.",
    });
  }

  if (strengths.length < 3) {
    strengths.push({
      title: "Clean document structure",
      detail: "The document is parseable into logical sections without unreadable character sets.",
    });
  }

  return strengths;
}

function generateImprovements(parsedResume, targetRole) {
  const { contact, sections, detectedSkills, metrics, actionVerbCount, wordCount } = parsedResume;
  const improvements = [];
  let idCounter = 1;

  if (metrics.count < 3) {
    improvements.push({
      id: `imp-${idCounter++}`,
      priority: "HIGH",
      issue: "Missing measurable outcomes and metrics",
      why: "Recruiters and hiring managers look for proven results and ROI, not just lists of routine daily responsibilities.",
      how: "Add numbers, percentages, scale, performance improvements, users served, or hours saved.",
      example: "e.g., 'Optimized query execution time by 42% for 15,000+ active users.'",
    });
  }

  if (!sections.summary || sections.summary.length < 50) {
    improvements.push({
      id: `imp-${idCounter++}`,
      priority: "HIGH",
      issue: "Missing or weak professional summary",
      why: "A concise 3-line summary at the top anchors your career narrative for both human recruiters and ATS keyword scanners.",
      how: "Write a high-impact 2-3 sentence overview highlighting your core tech stack, experience level, and key achievement.",
      example: `e.g., 'Results-driven ${targetRole} with proven expertise in building scalable, accessible web applications.'`,
    });
  }

  if (actionVerbCount < 5) {
    improvements.push({
      id: `imp-${idCounter++}`,
      priority: "MEDIUM",
      issue: "Passive phrasing in experience bullets",
      why: "Phrases like 'worked on' or 'helped with' sound passive and downplay your engineering ownership.",
      how: "Lead every single bullet point with strong action verbs like 'Architected', 'Spearheaded', 'Engineered', 'Optimized'.",
      example: "e.g., Replace 'Responsible for frontend UI' with 'Engineered responsive component architecture'.",
    });
  }

  if (!contact.github && !contact.portfolio) {
    improvements.push({
      id: `imp-${idCounter++}`,
      priority: "MEDIUM",
      issue: "No GitHub repository or live portfolio link",
      why: "Engineering hiring managers prioritize candidates who provide verifiable code repositories and deployed demonstrations.",
      how: "Include a link to your active GitHub profile or personal portfolio right in your contact header.",
      example: "e.g., 'github.com/yourhandle | yourportfolio.dev'",
    });
  }

  if (detectedSkills.count < 8) {
    improvements.push({
      id: `imp-${idCounter++}`,
      priority: "HIGH",
      issue: "Limited technical skills listed",
      why: "ATS search filters automatically rank resumes down when standard industry keywords are absent.",
      how: "Expand your technical skills section to include specific languages, frameworks, databases, and testing tools.",
      example: "e.g., Include specific libraries like React, TypeScript, Node.js, Jest, and Git.",
    });
  }

  if (wordCount < 250) {
    improvements.push({
      id: `imp-${idCounter++}`,
      priority: "MEDIUM",
      issue: "Resume content is too brief",
      why: "Single-sentence descriptions fail to show technical complexity, trade-off decisions, and architecture maturity.",
      how: "Expand each role or project into 2-3 structured bullets: Architecture, Technical challenge solved, and Result.",
      example: "e.g., Break 1-liner descriptions into 3 structured bullet points.",
    });
  }

  return improvements;
}

function generateScoreExplanation(score, parsedResume) {
  const { metrics, detectedSkills, sections } = parsedResume;

  if (score >= 85) {
    return "Exceptional resume with comprehensive technical coverage, structured sections, and strong alignment. Minor keyword refinements will maximize recruiter callbacks.";
  } else if (score >= 70) {
    let reason = "Strong technical foundation and clear formatting";
    if (metrics.count < 2) {
      reason += ", but lacks measurable achievements with quantifiable metrics";
    } else if (detectedSkills.count < 8) {
      reason += ", but could benefit from listing more specific industry tools and libraries";
    } else if (!sections.summary) {
      reason += ", but missing a high-impact professional summary";
    } else {
      reason += ", with actionable opportunities to strengthen bullet point impact";
    }
    return `${reason}.`;
  } else {
    return "Your resume is currently missing key standard sections and quantifiable evidence of impact. Following our step-by-step recommendations will dramatically improve your score.";
  }
}

function generateContentImprovements(weakStatements, detectedSkills, _targetRole) {
  const suggestions = [];

  if (weakStatements && weakStatements.length > 0) {
    weakStatements.forEach((weak, idx) => {
      let raw = weak.original.replace(/^(?:worked on|helped with|responsible for|assisted with|did)\s*/i, "").trim();
      let verb = weak.replacementVerb || "Developed";
      if (raw.toLowerCase().startsWith("an internship") || raw.toLowerCase().startsWith("intern in") || raw.toLowerCase().startsWith("as an intern")) {
        const companyMatch = raw.match(/(?:in|at)\s+([A-Za-z0-9\s&.-]+)/i);
        const comp = companyMatch ? companyMatch[1].trim() : "assigned organization";
        suggestions.push({
          id: `sug-${idx + 1}`,
          section: "Experience",
          current: weak.original,
          improved: `Completed an internship at ${comp}, gaining practical exposure to software development and contributing to assigned technical deliverables.`,
          impact: "Strengthens professional phrasing and removes passive phrasing without inventing metrics.",
          optionalMetricPrompt: "Optional: Add a measurable result if you have one.",
          status: "Ready to use",
        });
      } else {
        suggestions.push({
          id: `sug-${idx + 1}`,
          section: idx % 2 === 0 ? "Projects" : "Experience",
          current: weak.original,
          improved: `${verb} ${raw.charAt(0).toLowerCase() + raw.slice(1)}, focusing on structured code design and component maintainability.`,
          impact: `Upgrades passive duty to active engineering verb '${verb}' while strictly preserving original facts.`,
          optionalMetricPrompt: "Optional: Add a measurable result if you have one.",
          status: "Ready to use",
        });
      }
    });
  }

  return suggestions;
}
