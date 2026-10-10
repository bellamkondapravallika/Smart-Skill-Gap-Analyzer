import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileCheck2,
  FileText,
  GraduationCap,
  MessageSquareQuote,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
} from "lucide-react";
import { DashboardShell } from "../components/DashboardShell";
import { useApp } from "../context/useApp";

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, analysis, targetJob, history, loadPastAnalysis } = useApp();

  const displayName = user?.full_name || user?.name || "Professional";

  const handleViewReport = (historyId) => {
    loadPastAnalysis(historyId);
    navigate("/analysis-results");
  };

  // EMPTY STATE: If no resume has been analyzed yet
  if (!analysis) {
    return (
      <DashboardShell
        title={`Welcome back, ${displayName}`}
        subtitle="Your resume readiness and career progress at a glance."
      >
        <div className="panel-card empty-state-card">
          <div className="empty-state-icon">
            <FileText size={36} />
          </div>
          <h2>No resume analyzed yet</h2>
          <p className="empty-state-text">
            Upload your resume in PDF or DOCX format to generate your personalized career analysis, ATS compatibility check, and skill gap roadmap.
          </p>
          <div className="empty-state-actions">
            <Link to="/resume-analyzer" className="primary-btn">
              <Upload size={16} /> Upload Resume
            </Link>
          </div>
        </div>
      </DashboardShell>
    );
  }

  // Real scores from uploaded resume
  const scores = analysis.scores || {};
  const resumeScore = scores.overall ?? 0;
  const atsScore = scores.ats ?? 0;
  const hasTargetJob = Boolean(
    (targetJob && (targetJob.description || targetJob.overallMatch || targetJob.overall_match)) ||
    (analysis.target_job || analysis.targetJob)
  );

  const activeJob = targetJob || analysis.target_job || analysis.targetJob;
  const jobMatchScore = hasTargetJob
    ? (activeJob?.overall_match ?? activeJob?.overallMatch ?? scores.jobMatch ?? null)
    : null;

  const gapsList = analysis.skill_gaps || analysis.skillGaps || [];
  const skillGapsCount = gapsList.length;

  const detectedSkillsObj = analysis.detected_skills || analysis.detectedSkills || {};
  const allSkills = detectedSkillsObj.all || [];
  const skillsCount = scores.skillsCount ?? scores.skills_count ?? allSkills.length ?? 0;
  const fileName = analysis.file_name || analysis.fileName || "Uploaded_Resume.pdf";
  const targetRole = analysis.target_role || analysis.targetRole || user?.target_role || "Software Engineer";

  const strengthsList = analysis.strengths || [];
  const improvementsList = analysis.improvements || analysis.weaknesses || [];

  return (
    <DashboardShell
      title={`Welcome back, ${displayName}`}
      subtitle="Your resume readiness and career progress at a glance."
      action={
        <Link to="/resume-analyzer" className="primary-btn">
          <Upload size={14} /> Analyze New Resume
        </Link>
      }
    >
      <div className="dashboard-content-flow">
        {/* COMPACT METRICS ROW */}
        <div className="metrics-compact-row">
          {/* 1. Resume Score */}
          <div className="compact-metric-card">
            <div className="metric-card-top">
              <span className="metric-card-label">Resume Score</span>
              <div className="metric-icon-wrap icon-success">
                <FileText size={16} />
              </div>
            </div>
            <div className="metric-card-value-row">
              <span className="metric-large-num">{resumeScore}</span>
              <span className="metric-denom">/100</span>
            </div>
            <span className="metric-sub-note">
              {resumeScore >= 80 ? "Strong Baseline" : resumeScore >= 65 ? "Good Foundation" : "Needs Refinement"}
            </span>
          </div>

          {/* 2. ATS Score */}
          <div className="compact-metric-card">
            <div className="metric-card-top">
              <span className="metric-card-label">ATS Score</span>
              <div className="metric-icon-wrap icon-primary">
                <FileCheck2 size={16} />
              </div>
            </div>
            <div className="metric-card-value-row">
              <span className="metric-large-num">{atsScore}</span>
              <span className="metric-denom">/100</span>
            </div>
            <span className="metric-sub-note">
              {atsScore >= 75 ? "Parser Safe" : "Action Required"}
            </span>
          </div>

          {/* 3. Target Match */}
          <div className="compact-metric-card">
            <div className="metric-card-top">
              <span className="metric-card-label">Job Match</span>
              <div className="metric-icon-wrap icon-neutral">
                <Target size={16} />
              </div>
            </div>
            {hasTargetJob && jobMatchScore != null ? (
              <>
                <div className="metric-card-value-row">
                  <span className="metric-large-num">{jobMatchScore}%</span>
                </div>
                <span className="metric-sub-note truncate">
                  {activeJob?.title || activeJob?.job_title || targetRole}
                </span>
              </>
            ) : (
              <>
                <div className="metric-card-value-row">
                  <span className="metric-text-placeholder">Not added yet</span>
                </div>
                <Link to="/job-description" className="metric-action-link">
                  <Plus size={12} /> Add Target Job
                </Link>
              </>
            )}
          </div>

          {/* 4. Skill Gaps */}
          <div className="compact-metric-card">
            <div className="metric-card-top">
              <span className="metric-card-label">Skill Gaps</span>
              <div className="metric-icon-wrap icon-warning">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="metric-card-value-row">
              <span className="metric-large-num">{skillGapsCount}</span>
            </div>
            <span className="metric-sub-note">
              {skillGapsCount > 0 ? "Priority gap areas" : "No gaps identified"}
            </span>
          </div>
        </div>

        {/* NEXT RECOMMENDED ACTION CARD */}
        <div className="panel-card" style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)", borderColor: "rgba(99, 102, 241, 0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <div>
              <div className="eyebrow" style={{ color: "#818cf8" }}>
                <Sparkles size={13} /> Next Recommended Action
              </div>
              {!hasTargetJob ? (
                <>
                  <h3 style={{ fontSize: "1.1rem", margin: "4px 0" }}>Benchmark Against a Specific Role</h3>
                  <p className="muted-text" style={{ fontSize: "0.875rem" }}>
                    Paste a job description to calculate exact match percentage and uncover missing competencies.
                  </p>
                </>
              ) : (
                <>
                  <h3 style={{ fontSize: "1.1rem", margin: "4px 0" }}>Practice Stack-Specific Interview Questions</h3>
                  <p className="muted-text" style={{ fontSize: "0.875rem" }}>
                    Review questions generated for your verified technologies and run a live mock evaluation.
                  </p>
                </>
              )}
            </div>
            <div>
              {!hasTargetJob ? (
                <Link to="/job-description" className="primary-btn">
                  <BriefcaseBusiness size={14} /> Add Target Job &rarr;
                </Link>
              ) : (
                <div style={{ display: "flex", gap: 10 }}>
                  <Link to="/interview-preparation" className="primary-btn">
                    <MessageSquareQuote size={14} /> Practice Interview &rarr;
                  </Link>
                  <Link to="/learning-roadmap" className="secondary-btn small-btn">
                    <GraduationCap size={14} /> View Roadmap
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RESUME HEALTH: Category Progress Bars */}
        <div className="panel-card resume-health-card">
          <div className="panel-header-clean">
            <div>
              <h3 className="section-title">Resume Health &amp; Category Breakdown</h3>
              <p className="section-subtitle">
                Diagnostic metrics evaluated from <strong>{fileName}</strong>
              </p>
            </div>
            <Link to="/analysis-results" className="action-sublink">
              View Detailed Report &rarr;
            </Link>
          </div>

          <div className="health-categories-grid">
            {scores.categories?.map((cat) => (
              <div key={cat.name} className="health-bar-item">
                <div className="health-bar-head">
                  <span className="health-name">{cat.name}</span>
                  <span className="health-score-val">
                    <strong>{cat.score}%</strong>
                    <span className={`status-pill-small ${cat.score >= 80 ? "status-good" : cat.score >= 65 ? "status-mid" : "status-low"}`}>
                      {cat.status}
                    </span>
                  </span>
                </div>
                <div className="health-track">
                  <div
                    className="health-fill"
                    style={{
                      width: `${cat.score}%`,
                      backgroundColor:
                        cat.score >= 80 ? "var(--primary)" : cat.score >= 65 ? "#6366f1" : "#f59e0b",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick detected skills summary */}
          <div className="health-skills-preview">
            <span className="preview-label">Verified Technologies ({skillsCount}):</span>
            <div className="pills-scroll-wrap">
              {allSkills.slice(0, 10).map((sk) => (
                <span key={sk} className="micro-skill-pill">
                  {sk}
                </span>
              ))}
              {allSkills.length > 10 && (
                <span className="micro-skill-pill more">
                  +{allSkills.length - 10} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2-COLUMN SECTION: TOP STRENGTHS & TOP IMPROVEMENT AREAS */}
        <div className="two-col-grid">
          {/* Top Strengths */}
          <div className="panel-card">
            <div className="panel-header-clean">
              <div>
                <h3 className="section-title">Verified Strengths</h3>
                <p className="section-subtitle">Positive indicators found in your resume</p>
              </div>
              <span className="count-badge-subtle">
                {strengthsList.length} Found
              </span>
            </div>

            <div className="items-compact-list">
              {strengthsList.slice(0, 3).map((item, idx) => (
                <div key={idx} className="compact-item-row">
                  <CheckCircle2 size={16} className="item-icon-success shrink-0" />
                  <div className="item-body">
                    <strong className="item-title">{item.title}</strong>
                    <p className="item-desc">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Improvement Areas */}
          <div className="panel-card">
            <div className="panel-header-clean">
              <div>
                <h3 className="section-title">Priority Improvements</h3>
                <p className="section-subtitle">Actionable fixes to increase recruiter callbacks</p>
              </div>
              <Link to="/resume-improvement" className="action-sublink">
                Improver &rarr;
              </Link>
            </div>

            <div className="items-compact-list">
              {improvementsList.slice(0, 3).map((item, idx) => (
                <div key={item.id || idx} className="compact-item-row">
                  <AlertTriangle size={16} className="item-icon-warning shrink-0" />
                  <div className="item-body">
                    <div className="item-title-row">
                      <strong className="item-title">{item.issue}</strong>
                      <span className={`priority-tag ${(item.priority || "MEDIUM").toLowerCase()}`}>
                        {item.priority || "MEDIUM"}
                      </span>
                    </div>
                    <p className="item-desc">{item.why}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RECENT ANALYSIS */}
        <div className="panel-card">
          <div className="panel-header-clean">
            <div>
              <h3 className="section-title">Recent Analysis</h3>
              <p className="section-subtitle">Resume history and past evaluation records</p>
            </div>
            <Link to="/history" className="action-sublink">
              View History ({history.length}) &rarr;
            </Link>
          </div>

          {history.length > 0 ? (
            <div className="recent-list-rows">
              {history.slice(0, 3).map((item) => (
                <div key={item.id} className="recent-row">
                  <div className="recent-file-col">
                    <FileText size={16} className="file-icon-dim shrink-0" />
                    <div>
                      <strong className="recent-name">{item.fileName}</strong>
                      <span className="recent-meta">
                        {item.role} &bull; {item.date}
                      </span>
                    </div>
                  </div>

                  <div className="recent-scores-col">
                    <div className="score-mini-pill">
                      <span>Resume</span>
                      <strong>{item.resumeScore}/100</strong>
                    </div>
                    <div className="score-mini-pill">
                      <span>ATS</span>
                      <strong>{item.atsScore}/100</strong>
                    </div>
                    {item.matchScore != null && (
                      <div className="score-mini-pill highlight">
                        <span>Match</span>
                        <strong>{item.matchScore}%</strong>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="secondary-btn small-btn"
                    onClick={() => handleViewReport(item.id)}
                  >
                    View Report &rarr;
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-text" style={{ fontSize: "0.85rem" }}>
              Active analysis saved for {fileName}.
            </p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
