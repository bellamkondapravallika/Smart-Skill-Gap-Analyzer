import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Copy,
  FileCheck2,
  FileText,
  Layers,
  Sparkles,
  Wrench,
  Code2,
  Users2,
  Cpu,
} from "lucide-react";
import { DashboardShell } from "../components/DashboardShell";
import { ScoreRing } from "../components/ScoreRing";
import { useApp } from "../context/useApp";

export function AnalysisResultsPage() {
  const { analysis, showToast } = useApp();
  const [copiedId, setCopiedId] = useState(null);

  const handleCopySuggestion = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    showToast("Improved statement copied to clipboard!");
    setTimeout(() => setCopiedId(null), 3000);
  };

  // 16. EMPTY STATE: If no resume has been analyzed yet
  if (!analysis) {
    return (
      <DashboardShell
        title="Resume Analysis Report"
        subtitle="Detailed diagnostic overview of your resume."
      >
        <div className="panel-card empty-state-card">
          <div className="empty-state-icon">
            <FileText size={36} />
          </div>
          <h2>No resume analyzed yet</h2>
          <p className="empty-state-text">
            Upload your resume to generate your dynamic resume score, ATS evaluation, detected skills matrix, and bullet improvements.
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

  const scores = analysis.scores || {};
  const atsData = analysis.ats_analysis || analysis.atsAnalysis || {};
  const detectedSkills = analysis.detected_skills || analysis.detectedSkills || {};
  const fileName = analysis.file_name || analysis.fileName || "Uploaded_Resume.pdf";
  const candidateName = analysis.candidate_name || analysis.candidateName;
  const targetRole = analysis.target_role || analysis.targetRole || "Software Engineer";
  const wordCount = analysis.word_count || analysis.wordCount || 0;
  const summaryVerdict = analysis.summary_verdict || analysis.summaryVerdict || "";
  const strengths = analysis.strengths || [];
  const improvements = analysis.improvements || analysis.weaknesses || [];

  return (
    <DashboardShell
      title="Your Resume Analysis"
      subtitle={`Detailed diagnostic report generated from ${fileName}.`}
      action={
        <div className="header-actions-group">
          <Link to="/job-description" className="secondary-btn small-btn">
            <BriefcaseBusiness size={14} /> Compare With a Job
          </Link>
          <Link to="/resume-improvement" className="primary-btn">
            <Sparkles size={14} /> Improve My Resume
          </Link>
        </div>
      }
    >
      <div className="analysis-results-container">
        {/* TOP SUMMARY CARDS */}
        <div className="metrics-compact-row">
          <div className="compact-metric-card">
            <div className="metric-card-top">
              <span className="metric-card-label">Resume Score</span>
              <div className="metric-icon-wrap icon-success">
                <FileText size={16} />
              </div>
            </div>
            <div className="metric-card-value-row">
              <span className="metric-large-num">{scores.overall}</span>
              <span className="metric-denom">/100</span>
            </div>
            <span className="metric-sub-note">
              {scores.overall >= 80 ? "Strong Baseline" : scores.overall >= 65 ? "Good Foundation" : "Needs Refinement"}
            </span>
          </div>

          <div className="compact-metric-card">
            <div className="metric-card-top">
              <span className="metric-card-label">ATS Score</span>
              <div className="metric-icon-wrap icon-primary">
                <FileCheck2 size={16} />
              </div>
            </div>
            <div className="metric-card-value-row">
              <span className="metric-large-num">{scores.ats}</span>
              <span className="metric-denom">/100</span>
            </div>
            <span className="metric-sub-note">
              {scores.ats >= 80 ? "Parser Safe" : "Action Required"}
            </span>
          </div>

          <div className="compact-metric-card">
            <div className="metric-card-top">
              <span className="metric-card-label">Skills Detected</span>
              <div className="metric-icon-wrap icon-neutral">
                <Layers size={16} />
              </div>
            </div>
            <div className="metric-card-value-row">
              <span className="metric-large-num">{scores.skillsCount}</span>
            </div>
            <span className="metric-sub-note">Verified competencies</span>
          </div>

          <div className="compact-metric-card">
            <div className="metric-card-top">
              <span className="metric-card-label">Improvement Areas</span>
              <div className="metric-icon-wrap icon-warning">
                <AlertTriangle size={16} />
              </div>
            </div>
            <div className="metric-card-value-row">
              <span className="metric-large-num">{scores.improvementsCount}</span>
            </div>
            <span className="metric-sub-note">Actionable recommendations</span>
          </div>
        </div>

        {/* OVERALL SCORE & BREAKDOWN */}
        <div className="panel-card overall-score-card">
          <div className="score-hero-row">
            <div className="score-dial-col">
              <ScoreRing
                score={scores.overall}
                size={120}
                strokeWidth={10}
                label="Resume"
                subtitle="Overall"
                tone={scores.overall >= 80 ? "success" : scores.overall >= 65 ? "primary" : "warning"}
              />
            </div>
            <div className="score-verdict-col">
              <div className="verdict-tag-row">
                <span className={`badge-pill ${scores.overall >= 80 ? "good" : "warning"}`}>
                  {scores.overall}/100 &bull; {scores.overall >= 80 ? "Competitive" : "Developing"}
                </span>
                <span className="file-analyzed-tag">
                  <FileText size={12} /> {fileName}
                </span>
                {candidateName && (
                  <span className="file-analyzed-tag">
                    Candidate: {candidateName}
                  </span>
                )}
              </div>
              <h2 className="score-headline">Why this score was calculated</h2>
              <p className="score-explanation-text">
                &ldquo;{summaryVerdict}&rdquo;
              </p>
              <div className="score-meta-metrics">
                <span>
                  <strong>Target Role:</strong> {targetRole}
                </span>
                <span>
                  <strong>Word Count:</strong> {wordCount} words
                </span>
                <span>
                  <strong>ATS Status:</strong> {atsData?.verdict || "Evaluated"}
                </span>
              </div>
            </div>
          </div>

          {/* Category Progress Bars */}
          <div className="category-scores-section">
            <h4 className="card-title" style={{ marginBottom: 12 }}>Category Breakdown</h4>
            <div className="category-bars-grid">
              {scores.categories?.map((cat) => (
                <div key={cat.name} className="cat-bar-item">
                  <div className="cat-bar-header">
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-val">
                      <strong>{cat.score}%</strong>
                      <small className="cat-badge">{cat.status}</small>
                    </span>
                  </div>
                  <div className="cat-track">
                    <div
                      className="cat-fill"
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
          </div>
        </div>

        {/* WHAT YOU'RE DOING WELL (Actual Findings) */}
        <div className="panel-card">
          <div className="panel-header-clean">
            <div>
              <div className="section-eyebrow success-eyebrow">
                <CheckCircle2 size={14} /> Positive Highlights
              </div>
              <h3 className="section-title">What You&apos;re Doing Well</h3>
            </div>
            <span className="badge-count-success">
              {analysis.strengths?.length || 0} Strengths Identified
            </span>
          </div>

          <div className="strengths-list-grid">
            {analysis.strengths?.map((item, idx) => (
              <div key={idx} className="strength-card">
                <div className="strength-check-icon">
                  <Check size={14} />
                </div>
                <div>
                  <h4 className="strength-title">{item.title}</h4>
                  <p className="strength-detail">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WHAT NEEDS IMPROVEMENT (Actual Findings with Why and How) */}
        <div className="panel-card">
          <div className="panel-header-clean">
            <div>
              <div className="section-eyebrow warning-eyebrow">
                <AlertTriangle size={14} /> Actionable Diagnostics
              </div>
              <h3 className="section-title">What Needs Improvement</h3>
            </div>
            <span className="badge-count-warning">
              {analysis.improvements?.length || 0} Issues to Address
            </span>
          </div>

          <p className="section-subtitle" style={{ marginBottom: 16 }}>
            Address these recommendations in order of priority to maximize your recruiter callback rate.
          </p>

          <div className="improvements-list">
            {analysis.improvements?.map((item) => (
              <div key={item.id} className="improvement-card">
                <div className="improvement-header">
                  <div className="improvement-title-group">
                    <span className={`priority-tag ${item.priority.toLowerCase()}`}>
                      {item.priority}
                    </span>
                    <h4 className="improvement-title">{item.issue}</h4>
                  </div>
                </div>

                <div className="improvement-body">
                  <div className="improvement-col">
                    <strong className="block-label text-muted">Why it matters:</strong>
                    <p className="item-desc">{item.why}</p>
                  </div>
                  <div className="improvement-col">
                    <strong className="block-label text-primary">How to improve:</strong>
                    <p className="item-desc">{item.how}</p>
                    {item.example && (
                      <div className="improvement-example">
                        <span>Example:</span> {item.example}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ATS CHECK (Individual Checks & Warnings) */}
        <div className="panel-card">
          <div className="panel-header-clean">
            <div>
              <div className="section-eyebrow primary-eyebrow">
                <FileCheck2 size={14} /> ATS Parser Compatibility
              </div>
              <h3 className="section-title">Applicant Tracking System (ATS) Check</h3>
            </div>
            <div className="score-mini-pill highlight">
              <span>ATS Score</span>
              <strong>{atsData?.score || 80}/100</strong>
            </div>
          </div>

          <p className="section-subtitle" style={{ marginBottom: 16 }}>
            {atsData?.explanation}
          </p>

          <div className="ats-grid-layout">
            {/* Checks passed */}
            <div className="ats-checks-col">
              <h4 className="ats-col-heading">
                <CheckCircle2 size={15} className="text-success" /> Checks Passed ({atsData?.checksPassed?.length || 0})
              </h4>
              <div className="ats-checks-list">
                {atsData?.checksPassed?.map((chk, i) => (
                  <div key={i} className="ats-check-item">
                    <CheckCircle2 size={15} className="text-success shrink-0" />
                    <div>
                      <strong>{chk.label}</strong>
                      <p>{chk.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            <div className="ats-warnings-col">
              <h4 className="ats-col-heading">
                <AlertTriangle size={15} className="text-warning" /> Parser Warnings ({atsData?.warnings?.length || 0})
              </h4>
              <div className="ats-warnings-list">
                {atsData?.warnings?.length > 0 ? (
                  atsData.warnings.map((warn, i) => (
                    <div key={i} className="ats-warning-box">
                      <div className="warning-head">
                        <AlertTriangle size={15} className="text-warning shrink-0" />
                        <strong>{warn.title}</strong>
                      </div>
                      <p className="warning-detail">{warn.detail}</p>
                      <div className="warning-fix">
                        <span className="fix-label">Exact Fix:</span>
                        <p>{warn.fix}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="muted-text" style={{ fontSize: "0.85rem" }}>
                    No critical formatting warnings detected!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SKILLS DETECTED (Categorized from actual resume) */}
        <div className="panel-card">
          <div className="panel-header-clean">
            <div>
              <div className="section-eyebrow">
                <Layers size={14} /> Extracted Competencies
              </div>
              <h3 className="section-title">Skills Detected in Your Resume</h3>
            </div>
            <span className="count-badge-subtle">
              {scores.skillsCount} Total Skills
            </span>
          </div>

          <p className="section-subtitle" style={{ marginBottom: 16 }}>
            Extracted directly from your document and categorized across engineering domains.
          </p>

          <div className="skills-categorized-grid">
            {/* Technical Skills */}
            <div className="skill-category-box">
              <div className="skill-cat-head">
                <Code2 size={16} />
                <h4>Technical Skills ({detectedSkills?.technical?.length || 0})</h4>
              </div>
              <div className="tag-cloud">
                {detectedSkills?.technical?.length > 0 ? (
                  detectedSkills.technical.map((skill) => (
                    <span key={skill} className="skill-pill tech">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="muted-text" style={{ fontSize: "0.8rem" }}>No technical skills parsed</span>
                )}
              </div>
            </div>

            {/* Tools */}
            <div className="skill-category-box">
              <div className="skill-cat-head">
                <Wrench size={16} />
                <h4>Tools &amp; Environment ({detectedSkills?.tools?.length || 0})</h4>
              </div>
              <div className="tag-cloud">
                {detectedSkills?.tools?.length > 0 ? (
                  detectedSkills.tools.map((skill) => (
                    <span key={skill} className="skill-pill tool">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="muted-text" style={{ fontSize: "0.8rem" }}>No developer tools parsed</span>
                )}
              </div>
            </div>

            {/* AI / Data */}
            {detectedSkills?.aiData?.length > 0 && (
              <div className="skill-category-box">
                <div className="skill-cat-head">
                  <Cpu size={16} />
                  <h4>AI &amp; Data ({detectedSkills.aiData.length})</h4>
                </div>
                <div className="tag-cloud">
                  {detectedSkills.aiData.map((skill) => (
                    <span key={skill} className="skill-pill tech">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Soft Skills */}
            <div className="skill-category-box">
              <div className="skill-cat-head">
                <Users2 size={16} />
                <h4>Soft &amp; Professional Skills ({detectedSkills?.soft?.length || 0})</h4>
              </div>
              <div className="tag-cloud">
                {detectedSkills?.soft?.length > 0 ? (
                  detectedSkills.soft.map((skill) => (
                    <span key={skill} className="skill-pill soft">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="muted-text" style={{ fontSize: "0.8rem" }}>No soft skills detected</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT IMPROVEMENTS (Before & After) */}
        <div className="panel-card">
          <div className="panel-header-clean">
            <div>
              <div className="section-eyebrow success-eyebrow">
                <Sparkles size={14} /> Bullet Point Transformations
              </div>
              <h3 className="section-title">Resume Content Improvements</h3>
            </div>
            <Link to="/resume-improvement" className="action-sublink">
              Interactive Improver &rarr;
            </Link>
          </div>

          <p className="section-subtitle" style={{ marginBottom: 16 }}>
            Weak or passive statements detected in your resume, rewritten with strong action verbs and quantified impact.
          </p>

          <div className="content-suggestions-list">
            {analysis.contentImprovements?.map((item) => (
              <div key={item.id} className="suggestion-pair-card">
                <div className="suggestion-pair-head">
                  <span className="section-badge">{item.section}</span>
                  <span className="impact-note">{item.impact}</span>
                </div>

                <div className="before-after-grid">
                  <div className="before-box">
                    <div className="state-label current-label">CURRENT (Weak)</div>
                    <p className="bullet-text">&ldquo;{item.current}&rdquo;</p>
                  </div>

                  <div className="after-box">
                    <div className="state-label improved-label">IMPROVED (High Impact)</div>
                    <p className="bullet-text">&ldquo;{item.improved}&rdquo;</p>
                  </div>
                </div>

                <div className="suggestion-actions">
                  <button
                    type="button"
                    className="primary-btn compact small-btn"
                    onClick={() => handleCopySuggestion(item.id, item.improved)}
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check size={13} /> Copied to Clipboard!
                      </>
                    ) : (
                      <>
                        <Copy size={13} /> Copy Suggestion
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
