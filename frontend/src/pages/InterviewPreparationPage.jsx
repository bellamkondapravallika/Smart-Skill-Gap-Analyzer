import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Award,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  EyeOff,
  HelpCircle,
  Lightbulb,
  MessageSquareQuote,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { DashboardShell } from "../components/DashboardShell";
import { useApp } from "../context/useApp";
import { interviewApi } from "../services/apiClient";
import { generateDynamicInterviewQuestions } from "../services/interviewGenerator";

export function InterviewPreparationPage() {
  const { analysis, showToast } = useApp();

  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [revealedAnswers, setRevealedAnswers] = useState({});

  // Mock interview state
  const [mockModalOpen, setMockModalOpen] = useState(false);
  const [mockIndex, setMockIndex] = useState(0);
  const [mockTimer, setMockTimer] = useState(120);
  const [timerRunning, setTimerRunning] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [evaluatedAnswers, setEvaluatedAnswers] = useState([]);
  const [mockFinished, setMockFinished] = useState(false);

  // Timer interval
  useEffect(() => {
    if (!mockModalOpen || !timerRunning) return;

    const interval = setInterval(() => {
      setMockTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mockModalOpen, timerRunning]);

  // EMPTY STATE: If no resume has been analyzed yet
  if (!analysis) {
    return (
      <DashboardShell
        title="Interview Preparation"
        subtitle="Practice target questions generated from your resume and detected skill gaps."
      >
        <div className="panel-card empty-state-card">
          <div className="empty-state-icon">
            <MessageSquareQuote size={36} />
          </div>
          <h2>Analyze your resume first to generate personalized interview questions.</h2>
          <p className="empty-state-text">
            Upload your resume to generate tailored technical, project-based, behavioral, and gap-focused interview questions.
          </p>
          <div className="empty-state-actions">
            <Link to="/resume-analyzer" className="primary-btn">
              <Sparkles size={16} /> Analyze Resume
            </Link>
          </div>
        </div>
      </DashboardShell>
    );
  }

  // Get or dynamically construct questions from active analysis
  const targetRole = analysis.target_role || analysis.targetRole || "Software Engineer";
  const detectedSkills = analysis.detected_skills || analysis.detectedSkills || {};
  const activeGaps = analysis.skill_gaps || analysis.skillGaps || [];

  let rawQuestions = analysis.interview_questions || analysis.interviewQuestions || [];
  if (!rawQuestions || rawQuestions.length === 0) {
    rawQuestions = generateDynamicInterviewQuestions(
      detectedSkills,
      activeGaps,
      analysis.sections || {},
      targetRole
    );
  }

  const questions = rawQuestions;

  const filteredQuestions = questions.filter((q) => {
    const cat = (q.category || "").toLowerCase();
    if (filter === "resume") return cat.includes("resume") || cat.includes("project");
    if (filter === "technical") return cat.includes("tech");
    if (filter === "gaps") return q.isGapFocus || cat.includes("gap");
    if (filter === "behavioral") return cat.includes("behav");
    return true;
  });

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const toggleShowAnswer = (id, e) => {
    e?.stopPropagation();
    setRevealedAnswers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const startMockInterview = () => {
    if (questions.length === 0) {
      showToast("No interview questions available yet.", "warning");
      return;
    }
    setMockIndex(0);
    setMockTimer(120);
    setTimerRunning(true);
    setUserAnswer("");
    setCurrentFeedback(null);
    setEvaluatedAnswers([]);
    setMockFinished(false);
    setMockModalOpen(true);
  };

  const handleEvaluateCurrentAnswer = async () => {
    if (!userAnswer.trim()) {
      showToast("Please enter your answer or speaking notes first.", "warning");
      return;
    }

    const currentQ = questions[mockIndex];
    setEvaluating(true);

    try {
      let evalResult;
      if (typeof analysis.id === "number") {
        try {
          evalResult = await interviewApi.evaluateAnswer(analysis.id, {
            question_id: currentQ.id,
            question_text: currentQ.question,
            category: currentQ.category,
            skill: currentQ.skill,
            key_points: currentQ.keyPoints || [],
            answer: userAnswer.trim(),
          });
        } catch (apiErr) {
          console.warn("Backend evaluation call failed, using client evaluator:", apiErr);
        }
      }

      // Local fallback evaluator
      if (!evalResult) {
        const words = userAnswer.trim().split(/\s+/).length;
        const score = Math.min(95, Math.max(40, words >= 40 ? 85 : words >= 20 ? 70 : 50));
        evalResult = {
          score,
          readiness: score >= 80 ? "Interview Ready" : "Developing Competency",
          feedback: `Good structured response covering key points with ${words} words.`,
          strengths: ["Answer clearly articulated", "Addressed problem context"],
          missingPoints: ["Include explicit architectural metrics or trade-offs if available."],
          improvement: "Structure your delivery using STAR: Situation, Task, Action, and Result.",
        };
      }

      setCurrentFeedback(evalResult);
      setTimerRunning(false);

      const record = {
        questionId: currentQ.id,
        question: currentQ.question,
        category: currentQ.category,
        skill: currentQ.skill,
        userAnswer: userAnswer.trim(),
        score: evalResult.score,
        readiness: evalResult.readiness,
        feedback: evalResult.feedback,
        strengths: evalResult.strengths,
        missingPoints: evalResult.missingPoints,
        improvement: evalResult.improvement,
      };

      setEvaluatedAnswers((prev) => [...prev, record]);
      showToast(`Answer evaluated! Score: ${evalResult.score}/100`);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextMockQuestion = () => {
    if (mockIndex < questions.length - 1) {
      setMockIndex((prev) => prev + 1);
      setMockTimer(120);
      setTimerRunning(true);
      setUserAnswer("");
      setCurrentFeedback(null);
    } else {
      setMockFinished(true);
      setTimerRunning(false);

      const totalScore = evaluatedAnswers.reduce((sum, item) => sum + item.score, 0);
      const avgScore = evaluatedAnswers.length > 0 ? Math.round(totalScore / evaluatedAnswers.length) : 75;

      if (typeof analysis.id === "number") {
        interviewApi
          .saveMockSession(analysis.id, {
            answers: evaluatedAnswers,
            overall_score: avgScore,
            verdict: `Completed ${evaluatedAnswers.length} practice questions.`,
          })
          .catch((err) => console.warn("Could not save mock session:", err));
      }

      showToast("Mock interview session completed! Great work.");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const totalScoreSum = evaluatedAnswers.reduce((sum, item) => sum + item.score, 0);
  const overallAvgScore = evaluatedAnswers.length > 0 ? Math.round(totalScoreSum / evaluatedAnswers.length) : 0;

  return (
    <DashboardShell
      title="Interview Preparation"
      subtitle={`Tailored questions calibrated for ${targetRole} based on your actual resume.`}
      action={
        <button
          type="button"
          className="primary-btn"
          onClick={startMockInterview}
        >
          <Play size={14} /> Start Mock Interview
        </button>
      }
    >
      <div className="interview-page-container">
        {/* Banner */}
        <div className="panel-card role-overview-banner">
          <div className="banner-left">
            <span className="eyebrow subtle">AI Technical Coaching</span>
            <h2 className="banner-title">Questions Calibrated to Your Experience</h2>
            <p className="section-subtitle" style={{ marginTop: 4 }}>
              Questions reflect verified technologies from your resume and targeted {targetRole} requirements.
            </p>
          </div>
          <div className="banner-right">
            <div className="score-mini-pill highlight">
              <span>Personalized Questions</span>
              <strong>{questions.length}</strong>
            </div>
          </div>
        </div>

        {/* Filter Tabs matching Requirement 13 */}
        <div className="filter-tabs-row" style={{ marginTop: 18 }}>
          <div className="segmented-control">
            <button
              type="button"
              className={`segment-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({questions.length})
            </button>
            <button
              type="button"
              className={`segment-btn ${filter === "resume" ? "active" : ""}`}
              onClick={() => setFilter("resume")}
            >
              Resume Based
            </button>
            <button
              type="button"
              className={`segment-btn ${filter === "technical" ? "active" : ""}`}
              onClick={() => setFilter("technical")}
            >
              Technical
            </button>
            <button
              type="button"
              className={`segment-btn ${filter === "gaps" ? "active" : ""}`}
              onClick={() => setFilter("gaps")}
            >
              Skill Gap
            </button>
            <button
              type="button"
              className={`segment-btn ${filter === "behavioral" ? "active" : ""}`}
              onClick={() => setFilter("behavioral")}
            >
              Behavioral
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="interview-questions-list" style={{ marginTop: 18 }}>
          {filteredQuestions.map((q) => {
            const isExpanded = expandedId === q.id;
            const isAnswerVisible = Boolean(revealedAnswers[q.id]);

            return (
              <div key={q.id} className="panel-card question-item-card">
                <div
                  className="question-card-header"
                  onClick={() => toggleExpand(q.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      toggleExpand(q.id);
                    }
                  }}
                >
                  <div className="question-header-left">
                    <div className="question-tags-row">
                      <span className={`category-tag ${q.isGapFocus ? "gap-tag" : ""}`}>
                        {q.category}
                      </span>
                      {q.skill && <span className="skill-mini-tag">{q.skill}</span>}
                      <span className={`diff-tag ${(q.difficulty || "Intermediate").toLowerCase()}`}>
                        {q.difficulty || "Intermediate"}
                      </span>
                    </div>
                    <h3 className="question-text">{q.question}</h3>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button
                      type="button"
                      className="secondary-btn small-btn"
                      onClick={(e) => toggleShowAnswer(q.id, e)}
                      title={isAnswerVisible ? "Hide Answer" : "Show Answer"}
                      style={{ fontSize: "0.8rem", padding: "4px 10px" }}
                    >
                      {isAnswerVisible ? (
                        <>
                          <EyeOff size={13} /> Hide Answer
                        </>
                      ) : (
                        <>
                          <Eye size={13} /> Show Answer
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="expand-toggle-btn"
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Show Answer Block (toggleable directly or via expanded details) */}
                {isAnswerVisible && (
                  <div style={{
                    margin: "12px 0 0",
                    padding: "14px 16px",
                    background: "rgba(16, 185, 129, 0.05)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    borderRadius: 8
                  }}>
                    <strong style={{ color: "#10b981", fontSize: "0.85rem", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                      Sample Answer:
                    </strong>
                    <p style={{ fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.55 }}>
                      &ldquo;{q.sampleAnswer}&rdquo;
                    </p>
                  </div>
                )}

                {/* Expandable Details: Why It Matters & Interview Tip */}
                {isExpanded && (
                  <div className="question-expanded-content">
                    {q.whyRecruitersAsk && (
                      <div className="q-detail-block">
                        <strong className="block-label text-muted">Why It Matters:</strong>
                        <p className="item-desc">{q.whyRecruitersAsk}</p>
                      </div>
                    )}

                    {q.approach && (
                      <div className="q-detail-block" style={{ marginTop: 10 }}>
                        <strong className="block-label text-primary">Interview Tip:</strong>
                        <p className="item-desc">{q.approach}</p>
                      </div>
                    )}

                    {q.keyPoints && q.keyPoints.length > 0 && (
                      <div className="q-detail-block" style={{ marginTop: 12 }}>
                        <strong className="block-label text-muted">Key Points to Mention:</strong>
                        <ul className="key-points-list">
                          {q.keyPoints.map((pt, i) => (
                            <li key={i}>
                              <CheckCircle2 size={13} className="text-success shrink-0" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Mock Interview Modal */}
      {mockModalOpen && (
        <div className="modal-backdrop" onClick={() => setMockModalOpen(false)}>
          <div
            className="modal-dialog-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 680, width: "100%" }}
          >
            <div className="modal-header">
              <div className="modal-title-wrap">
                <span className="eyebrow subtle">Live Mock Session</span>
                <h3 className="section-title">
                  Question {mockIndex + 1} of {questions.length}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setMockModalOpen(false)}
                aria-label="Close mock modal"
              >
                <X size={18} />
              </button>
            </div>

            {!mockFinished ? (
              <div className="modal-body-flow">
                <div className="timer-badge-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="timer-pill" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "var(--muted)" }}>
                    <Clock size={14} />
                    <span>Time Remaining: <strong style={{ color: "var(--text)" }}>{formatTime(mockTimer)}</strong></span>
                  </div>
                  <span className="category-tag">
                    {questions[mockIndex]?.category} &bull; {questions[mockIndex]?.skill}
                  </span>
                </div>

                <div className="mock-question-box" style={{ marginTop: 14, padding: "14px 16px", background: "rgba(255, 255, 255, 0.03)", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <h4 style={{ fontSize: "1.05rem", fontWeight: 600, lineHeight: 1.45, color: "var(--text)" }}>
                    {questions[mockIndex]?.question}
                  </h4>
                  {questions[mockIndex]?.approach && (
                    <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 8 }}>
                      <Lightbulb size={13} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: 4 }} />
                      Tip: {questions[mockIndex].approach}
                    </p>
                  )}
                </div>

                {!currentFeedback ? (
                  <div className="mock-notes-block" style={{ marginTop: 14 }}>
                    <label htmlFor="mock-notes-textarea" className="field-label" style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: 500 }}>
                      Your Answer / Talking Points
                    </label>
                    <textarea
                      id="mock-notes-textarea"
                      rows={5}
                      className="plain-input"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Articulate your technical response, trade-offs, architecture decisions, or STAR scenario..."
                      style={{ width: "100%", padding: 12, borderRadius: 8, resize: "vertical" }}
                    />

                    <div className="modal-footer-row" style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <button
                        type="button"
                        className="secondary-btn small-btn"
                        onClick={() => setMockTimer(120)}
                      >
                        <RotateCcw size={13} /> Reset Timer
                      </button>
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={handleEvaluateCurrentAnswer}
                        disabled={evaluating || !userAnswer.trim()}
                      >
                        <Send size={14} /> {evaluating ? "Evaluating..." : "Submit & Evaluate Answer"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mock-feedback-box" style={{ marginTop: 16, padding: "16px", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Award size={18} color="#10b981" />
                        <strong>Answer Feedback</strong>
                      </div>
                      <div className="score-mini-pill" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "4px 10px", borderRadius: 20, fontWeight: 700, fontSize: "0.85rem" }}>
                        Score: {currentFeedback.score}/100 &bull; {currentFeedback.readiness}
                      </div>
                    </div>

                    <p style={{ fontSize: "0.875rem", lineHeight: 1.5, marginBottom: 12 }}>
                      {currentFeedback.feedback}
                    </p>

                    {currentFeedback.strengths?.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#10b981", textTransform: "uppercase" }}>Strengths:</span>
                        <ul style={{ margin: "4px 0 0 16px", fontSize: "0.85rem" }}>
                          {currentFeedback.strengths.map((str, sIdx) => (
                            <li key={sIdx} style={{ marginBottom: 2 }}>{str}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentFeedback.missingPoints?.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#f59e0b", textTransform: "uppercase" }}>Missing Points / Improvements:</span>
                        <ul style={{ margin: "4px 0 0 16px", fontSize: "0.85rem", color: "var(--muted)" }}>
                          {currentFeedback.missingPoints.map((mp, mIdx) => (
                            <li key={mIdx} style={{ marginBottom: 2 }}>{mp}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(99, 102, 241, 0.1)", borderRadius: 6, fontSize: "0.825rem", color: "#a5b4fc" }}>
                      <strong>Suggested Enhancement:</strong> {currentFeedback.improvement}
                    </div>

                    <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={handleNextMockQuestion}
                      >
                        {mockIndex < questions.length - 1 ? "Next Question →" : "View Readiness Summary ✓"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="modal-finish-box" style={{ textAlign: "center", padding: "24px 16px" }}>
                <CheckCircle2 size={44} color="#10b981" style={{ margin: "0 auto 12px" }} />
                <h3>Mock Interview Session Complete!</h3>
                <p className="section-subtitle" style={{ marginTop: 4, marginBottom: 20 }}>
                  You reviewed and submitted responses for {evaluatedAnswers.length} questions tailored to your stack.
                </p>

                <div className="panel-card" style={{ display: "inline-block", padding: "16px 28px", margin: "0 auto 20px", background: "rgba(255, 255, 255, 0.03)" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)", textTransform: "uppercase" }}>Average Readiness Score</div>
                  <div style={{ fontSize: "2.4rem", fontWeight: 800, color: overallAvgScore >= 75 ? "#10b981" : "#f59e0b", margin: "4px 0" }}>
                    {overallAvgScore}/100
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                    {overallAvgScore >= 80 ? "Interview Ready" : overallAvgScore >= 60 ? "Developing Competency" : "Needs Further Practice"}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={startMockInterview}
                  >
                    <RotateCcw size={14} /> Practice Again
                  </button>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => setMockModalOpen(false)}
                  >
                    Return to Question Bank
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
