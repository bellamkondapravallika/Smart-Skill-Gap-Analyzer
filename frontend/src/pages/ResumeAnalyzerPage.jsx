import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  FileCheck2,
  FileText,
  FileWarning,
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { DashboardShell } from "../components/DashboardShell";
import { useApp } from "../context/useApp";
import { resumeApi } from "../services/apiClient";
import {
  processResumeFile,
  processResumeText,
  validateResumeDocument,
  SAMPLE_RESUME_A_FRONTEND,
  SAMPLE_RESUME_B_BACKEND_AI,
} from "../services/resumeService.js";

export function ResumeAnalyzerPage() {
  const navigate = useNavigate();
  const { user, targetJob, saveAnalysis, showToast } = useApp();
  const fileInputRef = useRef(null);

  const [inputMode, setInputMode] = useState("file"); // "file" | "paste"
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState("");
  const [targetRole, setTargetRole] = useState(user?.targetRole || user?.target_role || "");
  const [errorMessage, setErrorMessage] = useState("");
  const [isInvalidResume, setIsInvalidResume] = useState(false);
  const [invalidReason, setInvalidReason] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Six-step progress (Requirement 18)
  const analysisSteps = [
    { label: "1. Uploading resume file", status: "upload" },
    { label: "2. Extracting text & structure", status: "extract" },
    { label: "3. Validating resume indicators", status: "validate" },
    { label: "4. Detecting technical skills & tools", status: "skills" },
    { label: "5. Analyzing content & ATS compatibility", status: "analyze" },
    { label: "6. Preparing diagnostic report", status: "report" },
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file) => {
    setErrorMessage("");
    setIsInvalidResume(false);
    if (!file) return;

    const validExtensions = [".pdf", ".docx"];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setErrorMessage(
        "Unsupported file format. Please upload a valid resume or CV in PDF or DOCX format."
      );
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File exceeds 10 MB limit. Please upload a smaller file.");
      setSelectedFile(null);
      return;
    }

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    setSelectedFile({
      name: file.name,
      size: sizeFormatted,
      type: fileName.endsWith(".pdf") ? "PDF" : "DOCX",
      rawFile: file,
    });
    showToast(`Loaded ${file.name}`);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setErrorMessage("");
    setIsInvalidResume(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetUploadState = () => {
    setSelectedFile(null);
    setPastedText("");
    setErrorMessage("");
    setIsInvalidResume(false);
    setInvalidReason("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleLoadSample = (sampleType) => {
    setInputMode("paste");
    setErrorMessage("");
    setIsInvalidResume(false);
    if (sampleType === "frontend") {
      setPastedText(SAMPLE_RESUME_A_FRONTEND.trim());
      setTargetRole("Frontend Developer");
      showToast("Loaded Sample Resume A (Alex - Frontend Developer)");
    } else {
      setPastedText(SAMPLE_RESUME_B_BACKEND_AI.trim());
      setTargetRole("Backend Developer");
      showToast("Loaded Sample Resume B (Jordan - Backend & AI Engineer)");
    }
  };

  const handleStartAnalysis = async () => {
    setErrorMessage("");
    setIsInvalidResume(false);

    if (inputMode === "file" && !selectedFile) {
      setErrorMessage("Please select or drop a PDF or DOCX resume file to analyze.");
      return;
    }

    if (inputMode === "paste" && (!pastedText || pastedText.trim().length < 35)) {
      setErrorMessage("Please paste resume content with at least 35 characters.");
      return;
    }

    // Fast-check client side for paste mode
    if (inputMode === "paste") {
      const val = validateResumeDocument(pastedText);
      if (!val.isValid) {
        setIsInvalidResume(true);
        setInvalidReason(val.reason);
        return;
      }
    }

    setAnalyzing(true);
    setCurrentStepIndex(0);

    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < analysisSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    try {
      let analysisResult;

      try {
        if (inputMode === "file") {
          analysisResult = await resumeApi.uploadFile(selectedFile.rawFile, targetRole || undefined);
        } else {
          analysisResult = await resumeApi.uploadText(pastedText, targetRole || undefined);
        }
      } catch (apiErr) {
        // Check if error is validation error (HTTP 422 or message indicates not a resume)
        const errDetail = apiErr.response?.data?.detail || apiErr.message || "";
        if (
          apiErr.response?.status === 422 ||
          errDetail.toLowerCase().includes("doesn't appear to be a resume") ||
          errDetail.toLowerCase().includes("not appear to be a resume")
        ) {
          clearInterval(stepInterval);
          setAnalyzing(false);
          setIsInvalidResume(true);
          setInvalidReason(errDetail || "The document lacks candidate signals, standard sections, or contact details.");
          return;
        }

        // Offline / local processing fallback
        console.warn("Backend API unavailable, falling back to local extractor:", apiErr);
        if (inputMode === "file") {
          analysisResult = await processResumeFile(
            selectedFile.rawFile,
            targetRole || null,
            targetJob
          );
        } else {
          const isSampleB = pastedText.includes("JORDAN REYES");
          const docName = isSampleB ? "Jordan_Reyes_Backend_AI.pdf" : "Alex_Morgan_Frontend.pdf";
          analysisResult = processResumeText(
            pastedText,
            docName,
            "1.4 MB",
            "PDF",
            targetRole || null,
            targetJob
          );
        }
      }

      setTimeout(() => {
        clearInterval(stepInterval);
        saveAnalysis(analysisResult);
        setAnalyzing(false);
        showToast("Analysis complete! Viewing your verified report.");
        navigate("/analysis-results");
      }, 1600);
    } catch (err) {
      clearInterval(stepInterval);
      setAnalyzing(false);
      console.error("Resume processing error:", err);

      const msg = err.message || "";
      if (msg.toLowerCase().includes("doesn't appear to be a resume") || msg.toLowerCase().includes("assignment") || msg.toLowerCase().includes("poster")) {
        setIsInvalidResume(true);
        setInvalidReason(msg);
      } else {
        setErrorMessage(
          err.response?.data?.detail || err.message || "We couldn't analyze your resume right now. Please try again."
        );
      }
    }
  };

  return (
    <DashboardShell
      title="Analyze Your Resume"
      subtitle="Upload your resume to extract actual skills, calculate dynamic scores, and discover personalized gaps."
    >
      <div className="upload-page-container">
        {/* 1. INVALID RESUME STATE (Requirement 3 & 19) */}
        {isInvalidResume ? (
          <div className="panel-card empty-state-card" style={{ borderColor: "rgba(239, 68, 68, 0.4)", background: "rgba(239, 68, 68, 0.02)" }}>
            <div className="empty-state-icon" style={{ background: "rgba(239, 68, 68, 0.12)", color: "#ef4444" }}>
              <FileWarning size={38} />
            </div>
            <h2 style={{ color: "var(--text)", fontSize: "1.35rem", marginTop: 12 }}>
              This doesn&apos;t appear to be a resume.
            </h2>
            <p className="empty-state-text" style={{ maxWidth: 520, margin: "8px auto 20px" }}>
              Please upload a valid resume or CV in PDF or DOCX format. Our verification service checks for candidate contact details, work experience, education, and career headings.
            </p>

            {/* Document Guidance Matrix */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              maxWidth: 540,
              margin: "0 auto 24px",
              textAlign: "left",
              padding: 16,
              background: "rgba(255, 255, 255, 0.04)",
              borderRadius: 10,
              border: "1px solid var(--border)"
            }}>
              <div>
                <strong style={{ color: "#10b981", fontSize: "0.85rem", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  ✓ Accepted Documents:
                </strong>
                <ul style={{ listStyle: "none", padding: 0, fontSize: "0.85rem", color: "var(--text)" }}>
                  <li style={{ marginBottom: 4 }}>✓ PDF Resume / Curriculum Vitae</li>
                  <li>✓ DOCX Resume / Curriculum Vitae</li>
                </ul>
              </div>
              <div>
                <strong style={{ color: "#ef4444", fontSize: "0.85rem", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  ✕ Not Accepted:
                </strong>
                <ul style={{ listStyle: "none", padding: 0, fontSize: "0.85rem", color: "var(--muted)" }}>
                  <li style={{ marginBottom: 2 }}>✕ Screenshots / Images</li>
                  <li style={{ marginBottom: 2 }}>✕ College Posters / Event Flyers</li>
                  <li style={{ marginBottom: 2 }}>✕ Assignments &amp; Homework</li>
                  <li>✕ Invoices or Unrelated Documents</li>
                </ul>
              </div>
            </div>

            <div className="empty-state-actions">
              <button
                type="button"
                className="primary-btn"
                onClick={resetUploadState}
              >
                <Upload size={16} /> Upload Valid Resume
              </button>
            </div>
          </div>
        ) : analyzing ? (
          /* 2. REALISTIC ANIMATED LOADING EXPERIENCE (Requirements 17 & 18) */
          <div className="panel-card analysis-loading-card">
            <div className="analysis-loading-header">
              <div className="spinner-wrap">
                <Loader2 size={32} className="animate-spin text-primary" />
              </div>
              <h2 className="loading-title">Analyzing your resume...</h2>
              <p className="section-subtitle">
                Running data extraction, resume verification, and skill catalog diagnostics.
              </p>
            </div>

            <div className="analysis-progress-bar">
              <div
                className="analysis-progress-fill"
                style={{
                  width: `${((currentStepIndex + 1) / analysisSteps.length) * 100}%`,
                }}
              />
            </div>

            <div className="step-indicator-list">
              {analysisSteps.map((stepItem, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div
                    key={stepItem.status}
                    className={`step-indicator-row ${
                      isCompleted ? "completed" : isCurrent ? "current" : "pending"
                    }`}
                  >
                    <div className="step-status-icon">
                      {isCompleted ? (
                        <CheckCircle2 size={16} className="text-success" />
                      ) : isCurrent ? (
                        <Loader2 size={16} className="animate-spin text-primary" />
                      ) : (
                        <span className="step-circle-pending" />
                      )}
                    </div>
                    <span className="step-label">{stepItem.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* 3. UPLOAD INTERFACE */
          <div className="upload-flow-grid">
            <div className="panel-card upload-main-card">
              {/* Input mode selector */}
              <div className="input-mode-tabs">
                <button
                  type="button"
                  className={`mode-tab-btn ${inputMode === "file" ? "active" : ""}`}
                  onClick={() => setInputMode("file")}
                >
                  <Upload size={14} /> Upload File (PDF / DOCX)
                </button>
                <button
                  type="button"
                  className={`mode-tab-btn ${inputMode === "paste" ? "active" : ""}`}
                  onClick={() => setInputMode("paste")}
                >
                  <FileText size={14} /> Paste Resume Text
                </button>
              </div>

              {/* Sample Resumes Fast Tester */}
              <div className="sample-test-bar">
                <span className="sample-bar-label">
                  <Sparkles size={13} /> Quick Test:
                </span>
                <button
                  type="button"
                  className="ghost-pill-btn"
                  onClick={() => handleLoadSample("frontend")}
                >
                  Resume A (Frontend Dev)
                </button>
                <button
                  type="button"
                  className="ghost-pill-btn"
                  onClick={() => handleLoadSample("backend")}
                >
                  Resume B (Backend &amp; AI)
                </button>
              </div>

              {/* File upload zone */}
              {inputMode === "file" ? (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />

                  <div
                    className={`drag-drop-zone ${dragActive ? "drag-active" : ""}`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="upload-icon-circle">
                      <Upload size={24} />
                    </div>
                    <h3 className="card-title">Upload your resume</h3>
                    <p className="upload-prompt">
                      Drag &amp; drop or <span className="text-link-highlight">browse files</span> from your computer
                    </p>
                    <div className="upload-meta-pills">
                      <span>Supported: PDF, DOCX</span>
                      <span>Maximum file size: 10 MB</span>
                    </div>
                  </div>

                  {/* Selected file card with info and Remove / Analyze buttons */}
                  {selectedFile && (
                    <div className="selected-file-card">
                      <div className="file-info-col">
                        <div className="file-badge-icon">
                          <FileText size={20} />
                        </div>
                        <div>
                          <strong className="file-name-text">{selectedFile.name}</strong>
                          <div className="file-details-text">
                            <span>{selectedFile.size}</span> &bull; <span>{selectedFile.type}</span> &bull; <span>Ready to parse</span>
                          </div>
                        </div>
                      </div>

                      <div className="file-actions-row">
                        <button
                          type="button"
                          className="ghost-btn small-btn text-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile();
                          }}
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Paste text zone */
                <div className="paste-text-zone">
                  <label htmlFor="resume-paste-input" className="field-label">
                    Paste Resume Content
                  </label>
                  <textarea
                    id="resume-paste-input"
                    className="plain-input textarea-paste"
                    rows={12}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste your resume text here (Summary, Work Experience, Skills, Education, Projects)..."
                  />
                  <span className="field-hint">
                    Word count: {pastedText.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
              )}

              {/* Error Alert */}
              {errorMessage && (
                <div className="alert-error" role="alert" style={{ marginTop: 16 }}>
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Optional Target Role */}
              <div className="field-block" style={{ marginTop: 18 }}>
                <label htmlFor="target-role-input" className="field-label">
                  Target Role (Optional)
                </label>
                <input
                  id="target-role-input"
                  type="text"
                  className="plain-input"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer (or leave blank to evaluate general profile)"
                />
                <small className="field-hint">
                  Leave blank to analyze your profile generally. You can benchmark against any job description later.
                </small>
              </div>

              {/* Analyze Resume CTA Button */}
              <div className="upload-submit-row" style={{ marginTop: 20 }}>
                <button
                  type="button"
                  className="primary-btn full-width"
                  onClick={handleStartAnalysis}
                  disabled={inputMode === "file" ? !selectedFile : !pastedText.trim()}
                >
                  <Sparkles size={16} /> Analyze Resume
                </button>
              </div>
            </div>

            {/* Right sidebar info */}
            <div className="panel-card upload-info-card">
              <h3 className="card-title">What Documents Are Accepted?</h3>
              <p className="section-subtitle" style={{ marginTop: 4 }}>
                Our verification engine validates genuine resume structure before scoring:
              </p>

              <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
                <div style={{ padding: "10px 12px", background: "rgba(16, 185, 129, 0.06)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: 8 }}>
                  <strong style={{ color: "#10b981", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6 }}>
                    <Check size={14} /> Accepted:
                  </strong>
                  <p style={{ fontSize: "0.825rem", color: "var(--text)", marginTop: 4 }}>
                    Standard PDF or DOCX resumes containing work experience, skills, education, and contact information.
                  </p>
                </div>

                <div style={{ padding: "10px 12px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: 8 }}>
                  <strong style={{ color: "#ef4444", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6 }}>
                    <X size={14} /> Not Accepted:
                  </strong>
                  <p style={{ fontSize: "0.825rem", color: "var(--muted)", marginTop: 4 }}>
                    Screenshots, event flyers, homework assignments, code dumps, or unrelated PDFs.
                  </p>
                </div>
              </div>

              <div className="security-notice" style={{ marginTop: 20 }}>
                <FileCheck2 size={15} color="var(--success)" className="shrink-0" />
                <span>Zero fake data generated — derived strictly from your upload.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
