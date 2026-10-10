import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Layers,
  MessageSquareQuote,
  Play,
  Plus,
  Sparkles,
  Target,
  Trash2,
  X,
} from "lucide-react";
import { DashboardShell } from "../components/DashboardShell";
import { useApp } from "../context/useApp";

export function LearningRoadmapPage() {
  const {
    analysis,
    targetJob,
    roadmap,
    toggleMilestone,
    toggleWeekComplete,
    removeRoadmapItem,
    reorderRoadmapItem,
    addCustomRoadmapMilestone,
    showToast,
  } = useApp();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newWhy, setNewWhy] = useState("");
  const [newTargetLevel, setNewTargetLevel] = useState("Production Proficient");
  const [newEffort, setNewEffort] = useState("8–10 hours");
  const [newTask, setNewTask] = useState("");
  const [newObjectives, setNewObjectives] = useState("");

  // EMPTY STATE: If no resume has been analyzed yet
  if (!analysis) {
    return (
      <DashboardShell
        title="Personalized Learning Roadmap"
        subtitle="A milestone curriculum tailored directly to your resume and career gaps."
      >
        <div className="panel-card empty-state-card">
          <div className="empty-state-icon">
            <GraduationCap size={36} />
          </div>
          <h2>Analyze a resume first</h2>
          <p className="empty-state-text">
            Upload your resume to generate a personalized learning roadmap adapted to your exact skill gaps.
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

  const activeRoadmap = roadmap && roadmap.length > 0 ? roadmap : analysis.roadmap || [];
  const hasTargetJob = Boolean(
    (targetJob && (targetJob.description || targetJob.overallMatch)) ||
    (analysis.target_job || analysis.targetJob)
  );

  const totalMilestones = activeRoadmap.reduce(
    (acc, w) => acc + (w.milestones?.length || 0),
    0
  );
  const completedMilestones = activeRoadmap.reduce(
    (acc, w) => acc + (w.milestones?.filter((m) => m.done).length || 0),
    0
  );
  const progressPercent =
    totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const handleStartLearning = () => {
    const firstWeek = activeRoadmap[0]?.focus || "Week 1";
    showToast(`Starting ${firstWeek}! Dive into your first practical milestone.`);
    const el = document.getElementById("roadmap-item-0");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleAddCustomSubmit = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) {
      showToast("Please enter a skill name.", "warning");
      return;
    }

    const objectivesList = newObjectives
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    addCustomRoadmapMilestone({
      skill: newSkill.trim(),
      why: newWhy.trim(),
      targetLevel: newTargetLevel,
      estimatedEffort: newEffort,
      task: newTask.trim(),
      objectives: objectivesList,
    });

    setNewSkill("");
    setNewWhy("");
    setNewTask("");
    setNewObjectives("");
    setAddModalOpen(false);
  };

  return (
    <DashboardShell
      title="Personalized Learning Roadmap"
      subtitle={`Curriculum dynamically calibrated for ${analysis.file_name || analysis.fileName || "your resume"}.`}
      action={
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            className="secondary-btn small-btn"
            onClick={() => setAddModalOpen(true)}
          >
            <Plus size={14} /> Add Skill to Roadmap
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={handleStartLearning}
            disabled={activeRoadmap.length === 0}
          >
            <Play size={14} /> Start Learning
          </button>
        </div>
      }
    >
      <div className="roadmap-page-container">
        {/* Banner with Progress */}
        <div className="panel-card roadmap-summary-banner">
          <div className="summary-banner-left">
            <span className="eyebrow subtle">Personalized Mastery Track</span>
            <h2 className="banner-title">Dynamic Career Curriculum</h2>
            <p className="section-subtitle" style={{ marginTop: 4 }}>
              Milestones adapt exclusively to your verified resume competencies and target role requirements.
            </p>

            <div className="milestones-count-row" style={{ marginTop: 12 }}>
              <span>
                <strong>{completedMilestones}</strong> of <strong>{totalMilestones}</strong> practical tasks completed
              </span>
              <span>&bull;</span>
              <span>
                <strong>{progressPercent}%</strong> Overall Progress
              </span>
            </div>
          </div>

          <div className="summary-banner-right">
            <div className="radial-progress-pill">
              <span className="radial-num">{progressPercent}%</span>
              <span className="radial-label">Mastery</span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="roadmap-progress-track-wrap" style={{ marginTop: 14 }}>
          <div className="progress-track" style={{ height: 8 }}>
            <div
              className="progress-fill"
              style={{
                width: `${progressPercent}%`,
                background: "linear-gradient(90deg, var(--primary), #10b981)",
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>

        {/* Notice if no target job is added */}
        {!hasTargetJob && (
          <div className="panel-card" style={{ marginTop: 16, background: "rgba(59, 130, 246, 0.04)", borderColor: "rgba(59, 130, 246, 0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <strong style={{ fontSize: "0.95rem" }}>Target Job Not Yet Benchmark</strong>
                <p className="muted-text" style={{ fontSize: "0.85rem", marginTop: 2 }}>
                  Showing foundational technical advancement. Add a specific job description to generate role-specific gap tracks.
                </p>
              </div>
              <Link to="/job-description" className="primary-btn compact small-btn">
                <BriefcaseBusiness size={14} /> Add Target Job
              </Link>
            </div>
          </div>
        )}

        {/* Empty state if user cleared roadmap */}
        {activeRoadmap.length === 0 ? (
          <div className="panel-card empty-state-card" style={{ marginTop: 20 }}>
            <div className="empty-state-icon">
              <Layers size={32} />
            </div>
            <h3>Your roadmap is currently empty</h3>
            <p className="empty-state-text">
              Add skills manually using the button below or benchmark against a target job to generate milestones automatically.
            </p>
            <div className="empty-state-actions">
              <button
                type="button"
                className="primary-btn"
                onClick={() => setAddModalOpen(true)}
              >
                <Plus size={15} /> Add Custom Skill
              </button>
            </div>
          </div>
        ) : (
          /* Roadmap Items List */
          <div className="roadmap-timeline-grid" style={{ marginTop: 22 }}>
            {activeRoadmap.map((weekItem, idx) => {
              const weekTotal = weekItem.milestones?.length || 0;
              const weekDone = weekItem.milestones?.filter((m) => m.done).length || 0;
              const weekProgress = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0;

              return (
                <div
                  key={weekItem.id}
                  id={`roadmap-item-${idx}`}
                  className={`panel-card roadmap-week-card ${
                    weekItem.completed ? "week-completed" : ""
                  }`}
                >
                  <div className="roadmap-card-header">
                    <div className="week-badge-row">
                      <span className="roadmap-week-pill">{weekItem.week}</span>
                      <span
                        className={`priority-tag ${
                          weekItem.priority?.toLowerCase().includes("high") ? "high" : "medium"
                        }`}
                      >
                        {weekItem.priority || "HIGH PRIORITY"}
                      </span>
                      <span className="time-badge">
                        <Clock size={12} /> {weekItem.estimatedHours || "8–10 hrs"}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {/* Reorder controls (Requirement 9) */}
                      <button
                        type="button"
                        className="ghost-btn small-btn"
                        onClick={() => reorderRoadmapItem(idx, -1)}
                        disabled={idx === 0}
                        title="Move Up"
                        style={{ padding: 4 }}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        className="ghost-btn small-btn"
                        onClick={() => reorderRoadmapItem(idx, 1)}
                        disabled={idx === activeRoadmap.length - 1}
                        title="Move Down"
                        style={{ padding: 4 }}
                      >
                        <ArrowDown size={14} />
                      </button>

                      {/* Remove item (Requirement 9) */}
                      <button
                        type="button"
                        className="ghost-btn small-btn text-danger"
                        onClick={() => removeRoadmapItem(weekItem.id)}
                        title="Remove from Roadmap"
                        style={{ padding: 4 }}
                      >
                        <Trash2 size={14} />
                      </button>

                      {/* Mark Complete (Requirement 9) */}
                      <button
                        type="button"
                        className={`week-toggle-btn ${
                          weekItem.completed ? "btn-completed" : "btn-pending"
                        }`}
                        onClick={() => toggleWeekComplete(weekItem.id)}
                      >
                        {weekItem.completed ? (
                          <>
                            <Check size={13} /> Completed
                          </>
                        ) : (
                          "Mark Complete"
                        )}
                      </button>
                    </div>
                  </div>

                  <h3 className="week-focus-title">{weekItem.focus}</h3>

                  {/* Why You Need It (Requirement 9) */}
                  <p className="week-outcome-text" style={{ marginTop: 6 }}>
                    <strong>Why You Need It:</strong> {weekItem.outcome}
                  </p>

                  {/* Competency Levels Row (Requirement 9) */}
                  <div style={{
                    display: "flex",
                    gap: 16,
                    margin: "12px 0",
                    padding: "10px 14px",
                    background: "rgba(255, 255, 255, 0.03)",
                    borderRadius: 8,
                    fontSize: "0.85rem",
                    border: "1px solid var(--border)",
                    flexWrap: "wrap"
                  }}>
                    <div>
                      <span className="text-muted" style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase" }}>Current Level:</span>
                      <strong>{weekItem.currentLevel || "Beginner / Foundational"}</strong>
                    </div>
                    <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 16 }}>
                      <span className="text-muted" style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase" }}>Target Level:</span>
                      <strong style={{ color: "var(--primary)" }}>{weekItem.targetLevel || "Production Proficient"}</strong>
                    </div>
                    <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 16 }}>
                      <span className="text-muted" style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase" }}>Progress:</span>
                      <strong>{weekProgress}% ({weekDone}/{weekTotal})</strong>
                    </div>
                  </div>

                  {/* Practical Task / Project (Requirement 9) */}
                  {(weekItem.practiceTask || weekItem.projectTask) && (
                    <div style={{ margin: "10px 0", padding: "10px 14px", background: "rgba(99, 102, 241, 0.05)", borderRadius: 8, border: "1px solid rgba(99, 102, 241, 0.2)" }}>
                      <strong style={{ color: "var(--primary)", fontSize: "0.825rem", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                        Practical Task / Project Deliverable:
                      </strong>
                      <p style={{ fontSize: "0.875rem", color: "var(--text)", lineHeight: 1.45 }}>
                        {weekItem.projectTask || weekItem.practiceTask}
                      </p>
                    </div>
                  )}

                  {/* Milestones Checklist / Learning Objectives */}
                  <div className="milestones-block" style={{ marginTop: 14 }}>
                    <h4 className="milestones-heading">Learning Objectives &amp; Tasks</h4>
                    <div className="milestones-list">
                      {weekItem.milestones?.map((m) => (
                        <label
                          key={m.id}
                          className={`milestone-item ${m.done ? "done" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={m.done}
                            onChange={() => toggleMilestone(weekItem.id, m.id)}
                          />
                          <span className="milestone-title">{m.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Curated Resources */}
                  {weekItem.resources && weekItem.resources.length > 0 && (
                    <div className="resources-block" style={{ marginTop: 14 }}>
                      <h4 className="resources-heading">Curated Resources</h4>
                      <div className="resources-pills">
                        {weekItem.resources.map((res, i) => (
                          <a
                            key={i}
                            href={res.link || res.url}
                            target="_blank"
                            rel="noreferrer"
                            className="resource-pill"
                          >
                            <BookOpen size={13} />
                            <span>{res.title}</span>
                            <ExternalLink size={11} className="shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA to Interview Prep */}
        <div className="panel-card roadmap-footer-box" style={{ marginTop: 22 }}>
          <div>
            <h3 className="card-title">Test your technical interview readiness</h3>
            <p className="section-subtitle" style={{ marginTop: 4 }}>
              Practice questions generated directly from your resume and targeted roadmap skills.
            </p>
          </div>
          <Link to="/interview-preparation" className="primary-btn">
            <MessageSquareQuote size={15} /> Practice Interview Questions &rarr;
          </Link>
        </div>
      </div>

      {/* Add Custom Skill Modal (Requirement 9) */}
      {addModalOpen && (
        <div className="modal-backdrop" onClick={() => setAddModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: "1.15rem" }}>Add Skill to Roadmap</h3>
              <button
                type="button"
                className="icon-only-btn"
                onClick={() => setAddModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <p className="muted-text" style={{ fontSize: "0.85rem", marginBottom: 16 }}>
              Manually add a skill or learning milestone to customize your personalized curriculum.
            </p>

            <form onSubmit={handleAddCustomSubmit}>
              <div className="field-block">
                <label>Skill / Technology Name</label>
                <input
                  type="text"
                  className="plain-input"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="e.g. Next.js 14, Docker, GraphQL"
                  required
                />
              </div>

              <div className="field-block" style={{ marginTop: 12 }}>
                <label>Why You Need It</label>
                <input
                  type="text"
                  className="plain-input"
                  value={newWhy}
                  onChange={(e) => setNewWhy(e.target.value)}
                  placeholder="e.g. Required by target full-stack roles for server-side rendering."
                />
              </div>

              <div className="form-two-col" style={{ marginTop: 12 }}>
                <div className="field-block">
                  <label>Target Level</label>
                  <select
                    className="plain-input"
                    value={newTargetLevel}
                    onChange={(e) => setNewTargetLevel(e.target.value)}
                  >
                    <option value="Production Proficient">Production Proficient</option>
                    <option value="Intermediate Developer">Intermediate Developer</option>
                    <option value="Advanced / System Architect">Advanced / System Architect</option>
                  </select>
                </div>
                <div className="field-block">
                  <label>Estimated Effort</label>
                  <input
                    type="text"
                    className="plain-input"
                    value={newEffort}
                    onChange={(e) => setNewEffort(e.target.value)}
                    placeholder="e.g. 10 hours"
                  />
                </div>
              </div>

              <div className="field-block" style={{ marginTop: 12 }}>
                <label>Practical Project / Task</label>
                <input
                  type="text"
                  className="plain-input"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="e.g. Build an SSR dashboard with server actions and route handlers."
                />
              </div>

              <div className="field-block" style={{ marginTop: 12 }}>
                <label>Learning Objectives (one per line)</label>
                <textarea
                  rows={3}
                  className="plain-input"
                  value={newObjectives}
                  onChange={(e) => setNewObjectives(e.target.value)}
                  placeholder="Master core routing & rendering&#10;Implement data fetching with caching&#10;Deploy to production container"
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn" style={{ flex: 1 }}>
                  Add to Roadmap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
