import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  Code2,
  GraduationCap,
  Info,
  Layers,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { DashboardShell } from "../components/DashboardShell";
import { useApp } from "../context/useApp";

export function SkillGapPage() {
  const { analysis, targetJob, addSkillToRoadmap } = useApp();
  const [activeTab, setActiveTab] = useState("all"); // "all", "missing", "have", "strong", "weak"

  // 1. EMPTY STATE: If no resume has been analyzed yet
  if (!analysis) {
    return (
      <DashboardShell
        title="Skill Gap Diagnostics"
        subtitle="Benchmark your competencies against industry expectations."
      >
        <div className="panel-card empty-state-card">
          <div className="empty-state-icon">
            <Target size={36} />
          </div>
          <h2>Analyze a resume first</h2>
          <p className="empty-state-text">
            Upload your resume to extract your current technical skills and diagnose gap areas.
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
  const activeJob = targetJob || analysis.target_job || analysis.targetJob;
  const hasTargetJob = Boolean(activeJob && matchData);

  const fileName = analysis.file_name || analysis.fileName || "Uploaded_Resume.pdf";
  const allResumeSkills = analysis.detected_skills?.all || analysis.detectedSkills?.all || [];
  const skillsCount = analysis.scores?.skillsCount || analysis.scores?.skills_count || allResumeSkills.length;

  // Calculate evidence for fallback when no target job is loaded
  const expText = ((analysis.sections?.experience || "") + " " + (analysis.sections?.work_experience || "")).toLowerCase();
  const projText = ((analysis.sections?.projects || "") + " " + (analysis.sections?.technical_projects || "")).toLowerCase();
  const practicalContext = `${expText} ${projText}`;

  const defaultStrongEvidence = allResumeSkills.filter((sk) => {
    const escaped = sk.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`, "i").test(practicalContext);
  });
  const defaultWeakEvidence = allResumeSkills.filter(
    (sk) => !defaultStrongEvidence.includes(sk)
  );

  // 2. STATE: If resume is uploaded, but NO target job has been provided
  if (!hasTargetJob) {
    return (
      <DashboardShell
        title="Skill Gap Diagnostics"
        subtitle="Personalized skill analysis based on your uploaded resume."
        action={
          <Link to="/job-description" className="primary-btn">
            <BriefcaseBusiness size={14} /> Add Target Job
          </Link>
        }
      >
        <div className="skill-gap-page-container">
          <div className="panel-card empty-state-card" style={{ padding: "32px 24px" }}>
            <div className="empty-state-icon" style={{ background: "rgba(59, 130, 246, 0.1)", color: "var(--primary)" }}>
              <Target size={32} />
            </div>
            <h2>Add a target job to see personalized skill gaps.</h2>
            <p className="empty-state-text" style={{ maxWidth: 540 }}>
              Skill gaps are calculated strictly by comparing your actual resume against the specific requirements of a target role. We never display fake gaps or assumed roles.
            </p>
            <div className="empty-state-actions">
              <Link to="/job-description" className="primary-btn">
                <BriefcaseBusiness size={15} /> Add a Target Job Description
              </Link>
            </div>
          </div>

          {/* Evidence split of detected skills */}
          <div className="grid-two-col" style={{ marginTop: 22 }}>
            <div className="panel-card">
              <div className="panel-header-clean">
                <div>
                  <div className="section-eyebrow success-eyebrow">
                    <ShieldCheck size={14} /> Strong Evidence ({defaultStrongEvidence.length})
                  </div>
                  <h3 className="section-title">Backed by Projects &amp; Experience</h3>
                </div>
              </div>
              <p className="section-subtitle" style={{ marginBottom: 12 }}>
                Skills mentioned in your work history or portfolio bullets with demonstrated practical application:
              </p>
              <div className="tag-cloud">
                {defaultStrongEvidence.length > 0 ? (
                  defaultStrongEvidence.map((s) => (
                    <span key={s} className="skill-pill matched-pill">
                      ✓ {s}
                    </span>
                  ))
                ) : (
                  <span className="muted-text">Add project bullets to demonstrate applied skills.</span>
                )}
              </div>
            </div>

            <div className="panel-card">
              <div className="panel-header-clean">
                <div>
                  <div className="section-eyebrow warning-eyebrow">
                    <Info size={14} /> Weak Evidence ({defaultWeakEvidence.length})
                  </div>
                  <h3 className="section-title">Listed as Keywords Only</h3>
                </div>
              </div>
              <p className="section-subtitle" style={{ marginBottom: 12 }}>
                Skills listed in your skills section but lacking direct mention in project or experience bullets:
              </p>
              <div className="tag-cloud">
                {defaultWeakEvidence.length > 0 ? (
                  defaultWeakEvidence.map((s) => (
                    <span key={s} className="skill-pill tech">
                      • {s}
                    </span>
                  ))
                ) : (
                  <span className="muted-text">All listed skills have project evidence.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  // 3. TARGET JOB ACTIVE: 4 Core Sections Required by Prompt
  // Section 1: You Already Have
  // Section 2: Missing / Need to Improve
  // Section 3: Strong Evidence
  // Section 4: Weak Evidence

  const targetJobTitle = activeJob?.title || activeJob?.job_title || analysis.target_role || analysis.targetRole || "Target Role";
  const targetCompany = activeJob?.company;

  const matchedSkills = matchData?.matched_skills || matchData?.matchedSkills || matchData?.you_already_have || matchData?.youAlreadyHave || [];
  const missingGaps = matchData?.skill_gaps || matchData?.skillGaps || [];
  const strongEvidence = matchData?.strong_evidence || matchData?.strongEvidence || defaultStrongEvidence;
  const weakEvidence = matchData?.weak_evidence || matchData?.weakEvidence || defaultWeakEvidence;

  return (
    <DashboardShell
      title="Skill Gap Diagnostics"
      subtitle={`Personalized competency benchmarking for ${targetJobTitle}${targetCompany ? ` at ${targetCompany}` : ""}.`}
      action={
        <Link to="/learning-roadmap" className="primary-btn">
          <GraduationCap size={15} /> Build My Roadmap &rarr;
        </Link>
      }
    >
      <div className="skill-gap-page-container">
        {/* Top Summary Banner */}
        <div className="panel-card role-overview-banner">
          <div className="banner-left">
            <span className="eyebrow subtle">Personalized Job Alignment</span>
            <h2 className="banner-title">{targetJobTitle} Fit</h2>
            <p className="section-subtitle" style={{ marginTop: 4 }}>
              Comparing {skillsCount} verified skills in your resume against the requirements of this opening.
            </p>
          </div>
          <div className="banner-right">
            <div className="metric-pill-large">
              <span>Overall Match</span>
              <strong>{matchData.overall_match ?? matchData.overallMatch ?? 0}%</strong>
            </div>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="filter-tabs-row" style={{ marginTop: 20 }}>
          <div className="segmented-control">
            <button
              type="button"
              className={`segment-btn ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Sections
            </button>
            <button
              type="button"
              className={`segment-btn ${activeTab === "missing" ? "active" : ""}`}
              onClick={() => setActiveTab("missing")}
            >
              Missing Gaps ({missingGaps.length})
            </button>
            <button
              type="button"
              className={`segment-btn ${activeTab === "have" ? "active" : ""}`}
              onClick={() => setActiveTab("have")}
            >
              You Already Have ({matchedSkills.length})
            </button>
            <button
              type="button"
              className={`segment-btn ${activeTab === "strong" ? "active" : ""}`}
              onClick={() => setActiveTab("strong")}
            >
              Strong Evidence ({strongEvidence.length})
            </button>
            <button
              type="button"
              className={`segment-btn ${activeTab === "weak" ? "active" : ""}`}
              onClick={() => setActiveTab("weak")}
            >
              Weak Evidence ({weakEvidence.length})
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 1. MISSING / NEED TO IMPROVE SECTION */}
        {/* ============================================================ */}
        {(activeTab === "all" || activeTab === "missing") && (
          <div className="panel-card" style={{ marginTop: 20 }}>
            <div className="panel-header-clean">
              <div>
                <div className="section-eyebrow warning-eyebrow">
                  <AlertTriangle size={14} /> Missing / Need to Improve
                </div>
                <h3 className="section-title">Priority Skill Gaps to Bridge</h3>
              </div>
              <span className="badge-count-warning">
                {missingGaps.length} Identified Gaps
              </span>
            </div>

            <p className="section-subtitle" style={{ marginBottom: 16 }}>
              Competencies required by the target job description that are not currently demonstrated in your resume.
            </p>

            {missingGaps.length === 0 ? (
              <div className="empty-sub-card">
                <CheckCircle2 size={24} className="text-success" />
                <p>No major skill gaps detected! Your resume matches the key technical requirements.</p>
              </div>
            ) : (
              <div className="gap-cards-grid">
                {missingGaps.map((item) => {
                  const skillName = item.skill || item.name;
                  const priority = item.priority || "High";
                  const whyText = item.why || item.importance || `Required by ${targetJobTitle} and not demonstrated in your resume.`;
                  const learnList = item.learn || item.what_to_learn || [
                    `${skillName} Core Fundamentals`,
                    `${skillName} Architecture Patterns`,
                    "Production Best Practices",
                  ];
                  const projectText = item.project || item.practical_project || item.suggested_project || `Build a practical project implementing ${skillName}.`;
                  const effortText = item.effort || item.estimatedTime || "1–2 weeks";

                  return (
                    <div key={skillName} className="gap-card">
                      <div className="gap-top-row">
                        <div className="gap-name-group">
                          <span className="gap-warn-symbol">⚠</span>
                          <strong>{skillName}</strong>
                        </div>
                        <span
                          className={`priority-tag ${
                            priority.toLowerCase().includes("high")
                              ? "high"
                              : priority.toLowerCase().includes("medium")
                              ? "medium"
                              : "low"
                          }`}
                        >
                          {priority}
                        </span>
                      </div>

                      {/* Why it matters */}
                      <div style={{ marginTop: 8 }}>
                        <span className="rec-label" style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
                          Why it matters:
                        </span>
                        <p className="gap-importance" style={{ marginTop: 2, fontSize: "0.86rem" }}>
                          {whyText}
                        </p>
                      </div>

                      {/* What to learn */}
                      <div className="gap-rec-box" style={{ marginTop: 10, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px" }}>
                        <span className="rec-label" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.78rem", color: "var(--primary)" }}>
                          <BookOpen size={13} /> What to learn:
                        </span>
                        <ul style={{ margin: "6px 0 0 16px", padding: 0, fontSize: "0.83rem", color: "var(--text)" }}>
                          {learnList.map((t, idx) => (
                            <li key={idx} style={{ marginBottom: 3 }}>{t}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Suggested Practical Project */}
                      <div style={{ marginTop: 10, background: "rgba(59, 130, 246, 0.04)", border: "1px solid rgba(59, 130, 246, 0.15)", borderRadius: 8, padding: "10px 12px" }}>
                        <span className="rec-label" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.78rem", color: "var(--primary)" }}>
                          <Code2 size={13} /> Suggested practical project:
                        </span>
                        <p style={{ marginTop: 4, fontSize: "0.83rem", color: "var(--text)", lineHeight: 1.45 }}>
                          {projectText}
                        </p>
                      </div>

                      {/* Card Footer */}
                      <div className="gap-card-footer" style={{ marginTop: 12 }}>
                        <span className="est-time">
                          <Clock size={12} /> {effortText}
                        </span>
                        <button
                          type="button"
                          className="primary-btn compact small-btn add-roadmap-btn"
                          onClick={() => addSkillToRoadmap(skillName, priority)}
                        >
                          <Plus size={13} /> Add to Roadmap
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* 2. YOU ALREADY HAVE SECTION */}
        {/* ============================================================ */}
        {(activeTab === "all" || activeTab === "have") && (
          <div className="panel-card" style={{ marginTop: 20 }}>
            <div className="panel-header-clean">
              <div>
                <div className="section-eyebrow success-eyebrow">
                  <CheckCircle2 size={14} /> You Already Have
                </div>
                <h3 className="section-title">Verified Skills Matching Job Requirements</h3>
              </div>
              <span className="badge-count-success">
                {matchedSkills.length} Verified Competencies
              </span>
            </div>

            <p className="section-subtitle" style={{ marginBottom: 14 }}>
              These required skills were successfully detected and verified in your resume.
            </p>

            <div className="tag-cloud">
              {matchedSkills.length > 0 ? (
                matchedSkills.map((skill) => (
                  <span key={skill} className="skill-pill matched-pill">
                    ✓ {skill}
                  </span>
                ))
              ) : (
                <span className="muted-text">No direct keyword overlap with this job description yet.</span>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 3. STRONG EVIDENCE SECTION */}
        {/* ============================================================ */}
        {(activeTab === "all" || activeTab === "strong") && (
          <div className="panel-card" style={{ marginTop: 20 }}>
            <div className="panel-header-clean">
              <div>
                <div className="section-eyebrow" style={{ color: "var(--primary)", borderColor: "rgba(59, 130, 246, 0.2)" }}>
                  <ShieldCheck size={14} /> Strong Evidence
                </div>
                <h3 className="section-title">Demonstrated in Experience &amp; Projects</h3>
              </div>
              <span className="badge-count-info">
                {strongEvidence.length} Backed Skills
              </span>
            </div>

            <p className="section-subtitle" style={{ marginBottom: 14 }}>
              These competencies are backed by practical achievements, technical bullets, or project descriptions in your resume. Recruiters have verifiable proof of your hands-on ability.
            </p>

            <div className="tag-cloud">
              {strongEvidence.length > 0 ? (
                strongEvidence.map((skill) => (
                  <span key={skill} className="skill-pill" style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--success)", borderColor: "rgba(16, 185, 129, 0.25)" }}>
                    <Award size={12} style={{ marginRight: 4 }} /> {skill}
                  </span>
                ))
              ) : (
                <span className="muted-text">Add detailed project bullets to turn keywords into strong evidence.</span>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 4. WEAK EVIDENCE SECTION */}
        {/* ============================================================ */}
        {(activeTab === "all" || activeTab === "weak") && (
          <div className="panel-card" style={{ marginTop: 20 }}>
            <div className="panel-header-clean">
              <div>
                <div className="section-eyebrow warning-eyebrow">
                  <Info size={14} /> Weak Evidence
                </div>
                <h3 className="section-title">Listed Only as Keywords</h3>
              </div>
              <span className="badge-count-warning">
                {weakEvidence.length} Unsubstantiated Skills
              </span>
            </div>

            <p className="section-subtitle" style={{ marginBottom: 14 }}>
              These skills are listed in your technical skills section, but lack backing project bullets or work experience descriptions. Recruiters may consider them unverified.
            </p>

            <div className="tag-cloud">
              {weakEvidence.length > 0 ? (
                weakEvidence.map((skill) => (
                  <span key={skill} className="skill-pill tech" style={{ background: "rgba(245, 158, 11, 0.08)", color: "#b45309", borderColor: "rgba(245, 158, 11, 0.25)" }}>
                    • {skill}
                  </span>
                ))
              ) : (
                <span className="muted-text">All listed skills have supporting project evidence.</span>
              )}
            </div>

            <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: 8, fontSize: "0.85rem", color: "var(--muted)" }}>
              <strong>Tip to elevate weak evidence:</strong> Use the <Link to="/resume-improvement" style={{ color: "var(--primary)", textDecoration: "underline" }}>Resume Improver</Link> to craft focused bullet points illustrating how you applied these tools in production.
            </div>
          </div>
        )}

        {/* Bottom Roadmap CTA */}
        <div className="panel-card roadmap-cta-box" style={{ marginTop: 24 }}>
          <div>
            <h3 className="card-title">Ready to close these skill gaps?</h3>
            <p className="section-subtitle" style={{ marginTop: 4 }}>
              Follow your dynamically personalized learning schedule generated directly from these missing competencies.
            </p>
          </div>
          <Link to="/learning-roadmap" className="primary-btn">
            Build My Roadmap <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
