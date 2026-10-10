import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  FileText,
  Rocket,
  Sparkles,
  Target,
  Upload,
} from "lucide-react";
import { useApp } from "../context/useApp";

const featureCards = [
  {
    icon: FileText,
    title: "Instant Resume Parsing",
    text: "Extract your technical skills, work achievements, and project highlights with precision in seconds.",
  },
  {
    icon: Target,
    title: "Skill Gap Detection",
    text: "Pinpoint exact technology mismatches between your actual resume and your target job requirements.",
  },
  {
    icon: BarChart3,
    title: "ATS Compatibility Score",
    text: "Ensure applicant tracking systems don't reject your application due to formatting or missing keywords.",
  },
  {
    icon: BookOpen,
    title: "Personalized Roadmap",
    text: "Follow a tailored, week-by-week learning schedule with curated resources to close priority gaps.",
  },
];

const compactWorkflowSteps = [
  {
    num: "01",
    title: "Upload Resume",
    detail: "Drop in your PDF or DOCX file. Deep text validation rejects non-resume documents.",
    icon: Upload,
  },
  {
    num: "02",
    title: "Analyze",
    detail: "Evaluate actual content strength, keywords, and evidence-backed ATS compatibility.",
    icon: BarChart3,
  },
  {
    num: "03",
    title: "Find Skill Gaps",
    detail: "Compare verified competencies against your target job to find real missing skills.",
    icon: Target,
  },
  {
    num: "04",
    title: "Take Action",
    detail: "Improve weak bullets without fake metrics and execute your personalized roadmap.",
    icon: Rocket,
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, analysis } = useApp();

  const handleAnalyzeClick = () => {
    if (isAuthenticated) {
      navigate("/resume-analyzer");
    } else {
      navigate("/login", { state: { from: "/resume-analyzer" } });
    }
  };

  return (
    <div className="page-shell landing-shell">
      {/* Navbar */}
      <header className="top-nav">
        <div className="brand" aria-label="Smart Skill Gap Analyzer home">
          <div className="brand-icon">
            <Brain size={20} />
          </div>
          <span>
            Skill<span>Gap</span>
          </span>
        </div>

        <nav className="nav-links" aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          {isAuthenticated ? (
            <>
              <button className="text-nav-btn" onClick={() => navigate("/dashboard")}>
                Dashboard
              </button>
              <button className="primary-btn compact" onClick={() => navigate("/resume-analyzer")}>
                Upload Resume
              </button>
            </>
          ) : (
            <>
              <button className="text-nav-btn" onClick={() => navigate("/login")}>
                Login
              </button>
              <button className="primary-btn compact" onClick={() => navigate("/signup")}>
                Sign Up
              </button>
            </>
          )}
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="eyebrow" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
              <Sparkles size={15} /> AI CAREER INTELLIGENCE
            </div>
            <h1>
              Understand your resume. Close your skill gaps. <span>Get job-ready.</span>
            </h1>
            <p className="hero-description">
              Stop guessing why applications get ignored. Get an evidence-based ATS evaluation, pinpoint missing skills for your dream role, and follow a personalized roadmap to hireability.
            </p>

            <div className="hero-actions">
              <button
                className="primary-btn hero-primary-cta"
                onClick={handleAnalyzeClick}
              >
                Analyze My Resume <ArrowRight size={18} />
              </button>
              <a href="#how-it-works" className="secondary-btn">
                See How It Works
              </a>
            </div>

            <div className="trust-row">
              <span>
                <CheckCircle2 size={15} /> 100% Real resume extraction
              </span>
              <span>
                <CheckCircle2 size={15} /> Dynamic ATS compatibility check
              </span>
              <span>
                <CheckCircle2 size={15} /> Zero fabricated metrics or data
              </span>
            </div>
          </motion.div>

          {/* Hero Visual Mockup */}
          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="dashboard-preview">
              <div className="preview-header">
                <div>
                  <small>Career intelligence preview</small>
                  <h3>{analysis?.target_role || analysis?.targetRole || "Target Role Benchmark"}</h3>
                </div>
                <div className="score-ring">
                  <strong>{analysis?.scores?.overall ? `${analysis.scores.overall}/100` : "Active"}</strong>
                  <span>{analysis ? "resume" : "audit"}</span>
                </div>
              </div>

              <div className="progress-block">
                <div className="mini-labels">
                  <span>ATS Readiness</span>
                  <span>{analysis?.scores?.ats ? `${analysis.scores.ats}%` : "Dynamic"}</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${analysis?.scores?.ats || 75}%` }}
                  />
                </div>
              </div>

              <div className="tag-block good">
                <div className="tag-title">
                  <span>✓</span> Extracted Stack Highlights
                </div>
                <div className="tag-list">
                  {analysis?.detected_skills?.technical?.slice(0, 5).map((s) => (
                    <span key={s}>{s}</span>
                  )) || (
                    <>
                      <span>React</span>
                      <span>Python</span>
                      <span>TypeScript</span>
                      <span>Docker</span>
                      <span>SQL</span>
                    </>
                  )}
                </div>
              </div>

              <div className="tag-block weak">
                <div className="tag-title">
                  <span>!</span> Dynamic Skill Gap Engine
                </div>
                <div className="tag-list">
                  <span>Calculated from real job description</span>
                </div>
              </div>
            </div>

            <div className="floating-card top-card">
              <Target size={18} />
              <div>
                <strong>Zero Dummy Data</strong>
                <small>Calculated from your resume</small>
              </div>
            </div>

            <div className="floating-card bottom-card">
              <FileCheck2 size={18} />
              <div>
                <strong>ATS Audit Engine</strong>
                <small>Section &amp; keyword validation</small>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Compact How It Works Section (4 Compact Connected Cards) */}
        <section className="roadmap-preview-section" id="how-it-works">
          <div className="section-header" style={{ marginBottom: 32 }}>
            <span style={{ textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--primary)" }}>How It Works</span>
            <h2>Four simple steps to complete career clarity</h2>
            <p>Our intelligent pipeline analyzes your document, extracts true capabilities, and provides a clear path forward.</p>
          </div>

          <div
            className="compact-steps-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: 16,
              maxWidth: "100%",
              margin: "0 auto",
            }}
          >
            {compactWorkflowSteps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.num}
                  className="compact-step-card"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    padding: "20px 18px",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "var(--primary)",
                        background: "rgba(59, 130, 246, 0.08)",
                        padding: "3px 8px",
                        borderRadius: 6,
                      }}
                    >
                      {step.num}
                    </span>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: "var(--accent)",
                        color: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <StepIcon size={16} />
                    </div>
                  </div>

                  <h3 style={{ fontSize: "1.05rem", fontWeight: 600, margin: "0 0 6px 0", color: "var(--text)" }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: "0.86rem", color: "var(--muted)", margin: 0, lineHeight: 1.45, flex: 1 }}>
                    {step.detail}
                  </p>

                  {idx < compactWorkflowSteps.length - 1 && (
                    <div
                      className="step-connector-dot"
                      style={{
                        position: "absolute",
                        right: -10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 2,
                        display: "none", // Visible on large screens via CSS if desired
                      }}
                    >
                      <ChevronRight size={14} color="var(--muted)" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Feature Section */}
        <section className="feature-section" id="features">
          <div className="section-header">
            <span>Core Capabilities</span>
            <h2>Everything you need to close your skill gaps.</h2>
            <p>Transform your static resume into an intelligent, actionable career roadmap.</p>
          </div>

          <div className="feature-grid">
            {featureCards.map(({ icon: Icon, title, text }) => (
              <motion.article key={title} className="feature-card" whileHover={{ y: -4 }}>
                <div className="feature-icon">
                  <Icon size={22} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="bottom-cta-banner">
          <div className="cta-content">
            <h2>Ready to transform your technical career trajectory?</h2>
            <p>Upload your resume to uncover missing keywords, benchmark against target jobs, and follow a personalized path to hireability.</p>
            <button
              className="primary-btn hero-primary-cta"
              onClick={handleAnalyzeClick}
            >
              Analyze My Resume <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer-bar">
        <div className="brand" aria-label="Smart Skill Gap Analyzer home">
          <div className="brand-icon">
            <Brain size={18} />
          </div>
          <span>
            Skill<span>Gap</span>
          </span>
        </div>
        <p className="copyright">&copy; {new Date().getFullYear()} Smart Skill Gap Analyzer. Built for high-growth tech careers.</p>
      </footer>
    </div>
  );
}
