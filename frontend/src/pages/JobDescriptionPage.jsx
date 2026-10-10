import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock,
  Layers,
  Lightbulb,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import { DashboardShell } from "../components/DashboardShell";
import { useApp } from "../context/useApp";

export function JobDescriptionPage() {
  const {
    analysis,
    targetJob,
    compareWithJobDescription,
    clearTargetJob,
    addSkillToRoadmap,
    showToast,
  } = useApp();

  const [jobTitle, setJobTitle] = useState(
    targetJob?.title || analysis?.target_role || analysis?.targetRole || ""
  );
  const [company, setCompany] = useState(targetJob?.company || "");
  const [jobDescription, setJobDescription] = useState(targetJob?.description || "");
  const [isComparing, setIsComparing] = useState(false);

  const handleLoadSampleJD = (type) => {
    if (type === "frontend") {
      setJobTitle("Frontend Developer");
      setCompany("Stripe");
      setJobDescription(`We are looking for a Frontend Developer to join our core product engineering team.
Requirements:
- Strong proficiency in modern JavaScript (ES6+), React 18, HTML5, and CSS3.
- Proven hands-on experience with TypeScript, interfaces, and typed component architecture.
- Solid understanding of REST APIs, state management (Redux/Zustand), and web performance optimization.
- Experience with automated testing using Jest or React Testing Library.
- Knowledge of Next.js, responsive Tailwind CSS styling, and Git version control workflows.`);
    } else {
      setJobTitle("Backend & Cloud Engineer");
      setCompany("CloudStream Infrastructure");
      setJobDescription(`We are hiring a Backend Engineer to scale our distributed cloud services.
Requirements:
- Strong experience in Python or Go building asynchronous RESTful APIs and microservices.
- Solid background with PostgreSQL relational database modeling, query tuning, and Redis caching.
- Hands-on experience with Docker containerization, Kubernetes, and automated CI/CD pipelines.
- Familiarity with AWS cloud services (ECS, S3, IAM) and automated testing frameworks.`);
    }
    showToast(`Loaded ${type === "frontend" ? "Frontend" : "Backend"} job description template`);
  };

  const handleAnalyzeMatch = async (e) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      showToast("Add the actual job description to calculate an accurate match.", "warning");
      return;
    }

    if (!jobTitle.trim()) {
      showToast("Please enter a target role title.", "warning");
      return;
    }

    if (!analysis) {
      showToast("Please analyze a resume first to compare with this job.", "warning");
      return;
    }

    setIsComparing(true);
    try {
      const result = await compareWithJobDescription(jobDescription, jobTitle, company);
      if (result) {
        const score = result.overall_match ?? result.overallMatch ?? 0;
        showToast(`Analyzed match for ${jobTitle}! Match score: ${score}%`);
      }
    } catch (err) {
      console.error("Job comparison error:", err);
      showToast("Could not compare job description.", "warning");
    } finally {
      setIsComparing(false);
    }
  };

  // EMPTY STATE: If no resume has been analyzed yet
  if (!analysis) {
    return (
      <DashboardShell
        title="Target Job Match"
        subtitle="Benchmark your resume against a specific job description."
      >
        <div className="panel-card empty-state-card">
          <div className="empty-state-icon">
            <BriefcaseBusiness size={36} />
          </div>
          <h2>Analyze a resume first</h2>
          <p className="empty-state-text">
            To compare your skills against a specific job opening, first upload and analyze your resume.
          </p>
          <div className="empty-state-actions">
            <Link to="/resume-analyzer" className="primary-btn">
              <Sparkles size={16} /> Upload Resume
            </Link>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const matchData = analysis.job_match || analysis.jobMatch;
  const hasTargetJob = Boolean(targetJob && targetJob.description && matchData);

  const matchedSkills = matchData?.matched_skills || matchData?.matchedSkills || [];
  const missingSkills = matchData?.missing_skills || matchData?.missingSkills || [];
  const skillGaps = matchData?.skill_gaps || matchData?.skillGaps || [];
  const overallMatch = matchData?.overall_match ?? matchData?.overallMatch ?? 0;
  const keywordMatch = matchData?.keyword_match ?? matchData?.keywordMatch ?? 0;
  const experienceMatch = matchData?.experience_match ?? matchData?.experienceMatch ?? 0;

  return (
    <DashboardShell
      title="Target Job Match"
      subtitle="Compare your actual resume skills against any target job opening."
      action={
        hasTargetJob && (
          <Link to="/skill-gap" className="primary-btn">
            <Target size={14} /> View Skill Gaps &rarr;
          </Link>
        )
      }
    >
      <div className="job-match-container">
        {/* INPUT FORM CARD */}
        <div className="panel-card">
          <div className="panel-header-clean">
            <div>
              <h3 className="section-title">Job Description Comparison</h3>
              <p className="section-subtitle">
                Enter your target role and paste the job description to calculate your authentic match score.
              </p>
            </div>
            {hasTargetJob && (
              <button
                type="button"
                className="ghost-btn small-btn text-danger"
                onClick={clearTargetJob}
                title="Clear target job"
              >
                <Trash2 size={13} /> Reset Comparison
              </button>
            )}
          </div>

          {/* Quick template load pills */}
          <div className="sample-test-bar" style={{ marginBottom: 14 }}>
            <span className="sample-bar-label">
              <Sparkles size={13} /> Sample JDs:
            </span>
            <button
              type="button"
              className="ghost-pill-btn"
              onClick={() => handleLoadSampleJD("frontend")}
            >
              Frontend Developer JD
            </button>
            <button
              type="button"
              className="ghost-pill-btn"
              onClick={() => handleLoadSampleJD("backend")}
            >
              Backend &amp; Cloud JD
            </button>
          </div>

          <form onSubmit={handleAnalyzeMatch}>
            <div className="form-two-col">
              <div className="field-block">
                <label htmlFor="jd-title-input" className="field-label">Target Role Title *</label>
                <div className="input-wrap">
                  <BriefcaseBusiness size={15} />
                  <input
                    id="jd-title-input"
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer, Full Stack Developer"
                    required
                  />
                </div>
              </div>

              <div className="field-block">
                <label htmlFor="jd-company-input" className="field-label">Company Name (Optional)</label>
                <div className="input-wrap">
                  <Building2 size={15} />
                  <input
                    id="jd-company-input"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Microsoft, Stripe, Google"
                  />
                </div>
              </div>
            </div>

            <div className="field-block" style={{ marginTop: 14 }}>
              <label htmlFor="jd-desc-input" className="field-label">Job Description / Requirements *</label>
              <textarea
                id="jd-desc-input"
                rows={7}
                className="plain-input"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description or bullet list of required qualifications here..."
                required
              />
            </div>

            <div style={{ marginTop: 18 }}>
              <button
                type="submit"
                className="primary-btn"
                disabled={isComparing || !jobDescription.trim() || !jobTitle.trim()}
              >
                {isComparing ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" /> Analyzing Job Match...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} /> Analyze Job Match
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* CONDITIONAL MATCH RESULTS */}
        {!hasTargetJob ? (
          <div className="panel-card empty-state-card" style={{ marginTop: 20 }}>
            <div className="empty-state-icon" style={{ background: "rgba(59, 130, 246, 0.1)", color: "var(--primary)" }}>
              <Target size={30} />
            </div>
            <h3>Add a target job to see personalized skill gaps.</h3>
            <p className="empty-state-text" style={{ maxWidth: 500 }}>
              Enter a target role and paste a job description above to evaluate your candidate-job alignment without fabricated metrics.
            </p>
          </div>
        ) : (
          <div className="match-results-flow" style={{ marginTop: 22 }}>
            {/* Match Metrics Cards: Overall Match, Keyword Match, Experience Alignment, Missing Skills */}
            <div className="metrics-compact-row">
              <div className="compact-metric-card">
                <div className="metric-card-top">
                  <span className="metric-card-label">Overall Match</span>
                  <div className="metric-icon-wrap icon-primary">
                    <Target size={16} />
                  </div>
                </div>
                <div className="metric-card-value-row">
                  <span className="metric-large-num">{overallMatch}%</span>
                </div>
                <span className="metric-sub-note">
                  {matchedSkills.length} of {matchData.totalRequiredSkills || (matchedSkills.length + missingSkills.length)} requirements
                </span>
              </div>

              <div className="compact-metric-card">
                <div className="metric-card-top">
                  <span className="metric-card-label">Keyword Match</span>
                  <div className="metric-icon-wrap icon-success">
                    <CheckCircle2 size={16} />
                  </div>
                </div>
                <div className="metric-card-value-row">
                  <span className="metric-large-num">{keywordMatch}%</span>
                </div>
                <span className="metric-sub-note">ATS keyword alignment</span>
              </div>

              <div className="compact-metric-card">
                <div className="metric-card-top">
                  <span className="metric-card-label">Experience Alignment</span>
                  <div className="metric-icon-wrap icon-neutral">
                    <BriefcaseBusiness size={16} />
                  </div>
                </div>
                <div className="metric-card-value-row">
                  <span className="metric-large-num">{experienceMatch}%</span>
                </div>
                <span className="metric-sub-note">Seniority &amp; scope</span>
              </div>

              <div className="compact-metric-card">
                <div className="metric-card-top">
                  <span className="metric-card-label">Missing Skills</span>
                  <div className="metric-icon-wrap icon-warning">
                    <AlertTriangle size={16} />
                  </div>
                </div>
                <div className="metric-card-value-row">
                  <span className="metric-large-num">{missingSkills.length}</span>
                </div>
                <span className="metric-sub-note">Gaps to bridge</span>
              </div>
            </div>

            {/* Comparison Summary */}
            <div className="panel-card" style={{ marginTop: 20 }}>
              <div className="match-summary-box">
                <strong style={{ fontSize: "0.95rem" }}>Comparison Summary:</strong>
                <p style={{ marginTop: 4, color: "var(--text)", fontSize: "0.9rem" }}>
                  {matchData.summary || `Your resume matches ${matchedSkills.length} requirements for ${jobTitle}${company ? ` at ${company}` : ""}.`}
                </p>
              </div>

              {/* Matched Skills vs Missing Skills */}
              <div className="matched-missing-split" style={{ marginTop: 20 }}>
                {/* Matched Skills */}
                <div className="matched-container">
                  <h4 className="split-subhead text-success">
                    <CheckCircle2 size={15} /> Matched Skills ({matchedSkills.length})
                  </h4>
                  <div className="tag-cloud">
                    {matchedSkills.length > 0 ? (
                      matchedSkills.map((sk) => (
                        <span key={sk} className="skill-pill matched-pill">
                          ✓ {sk}
                        </span>
                      ))
                    ) : (
                      <span className="muted-text" style={{ fontSize: "0.85rem" }}>
                        No direct keyword matches found.
                      </span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="missing-container" style={{ marginTop: 18 }}>
                  <h4 className="split-subhead text-warning">
                    <AlertTriangle size={15} /> Missing Skills ({missingSkills.length})
                  </h4>
                  <div className="gap-cards-grid">
                    {skillGaps.map((gap) => (
                      <div key={gap.skill || gap.name} className="gap-card">
                        <div className="gap-top-row">
                          <div className="gap-name-group">
                            <span className="gap-warn-symbol">⚠</span>
                            <strong>{gap.skill || gap.name}</strong>
                          </div>
                          <span className={`priority-tag ${(gap.priority || "High").toLowerCase().includes("high") ? "high" : "medium"}`}>
                            {gap.priority || "High"}
                          </span>
                        </div>

                        <p className="gap-importance">{gap.why || gap.importance}</p>

                        <div className="gap-rec-box">
                          <span className="rec-label">Recommended Learning:</span>
                          <p>{gap.recommendation || `Learn core principles of ${gap.skill || gap.name}.`}</p>
                        </div>

                        <div className="gap-card-footer">
                          <span className="est-time">
                            <Clock size={12} /> {gap.effort || gap.estimatedTime || "1–2 weeks"}
                          </span>
                          <button
                            type="button"
                            className="secondary-btn small-btn add-roadmap-btn"
                            onClick={() => addSkillToRoadmap(gap.skill || gap.name, gap.priority || "High")}
                          >
                            <Plus size={13} /> Add to Roadmap
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Experience Alignment & Missing Keywords */}
              <div className="grid-two-col" style={{ marginTop: 22 }}>
                <div className="panel-card" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <h4 className="split-subhead" style={{ color: "var(--primary)" }}>
                    <BriefcaseBusiness size={15} /> Experience Alignment
                  </h4>
                  <p style={{ fontSize: "0.86rem", color: "var(--text)", marginTop: 6, lineHeight: 1.5 }}>
                    {experienceMatch >= 80
                      ? `Your seniority and technical breadth closely match the expectations for ${jobTitle}. Highlighting relevant project deliverables will emphasize your hands-on leadership.`
                      : `The job description indicates a higher level of scope or specialized years of experience. We recommend framing your project work around architecture decisions and measurable deliverables.`}
                  </p>
                </div>

                <div className="panel-card" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <h4 className="split-subhead" style={{ color: "var(--warning)" }}>
                    <Search size={15} /> Missing Keywords
                  </h4>
                  <div className="tag-cloud" style={{ marginTop: 8 }}>
                    {missingSkills.slice(0, 6).map((kw) => (
                      <span key={kw} className="skill-pill tech" style={{ background: "rgba(245, 158, 11, 0.08)", color: "#b45309" }}>
                        ! {kw}
                      </span>
                    ))}
                    {missingSkills.length === 0 && (
                      <span className="muted-text" style={{ fontSize: "0.85rem" }}>All key ATS terms found!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Recommended Improvements */}
              <div style={{ marginTop: 20, padding: "16px", background: "rgba(59, 130, 246, 0.04)", border: "1px solid rgba(59, 130, 246, 0.15)", borderRadius: 10 }}>
                <h4 style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.95rem", color: "var(--primary)" }}>
                  <Lightbulb size={16} /> Recommended Improvements
                </h4>
                <ul style={{ margin: "8px 0 0 18px", padding: 0, fontSize: "0.87rem", color: "var(--text)", lineHeight: 1.6 }}>
                  <li>Integrate the top missing keywords (<strong>{missingSkills.slice(0, 3).join(", ") || "None"}</strong>) into your technical skills and project descriptions.</li>
                  <li>Add your completed learning roadmap milestones to your resume as live projects to demonstrate practical competency.</li>
                  <li>Use the Resume Improver to lead experience bullets with strong engineering action verbs.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
