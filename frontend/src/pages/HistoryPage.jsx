import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  History,
  Search,
  Trash2,
  Upload,
  Sparkles,
} from "lucide-react";
import { DashboardShell } from "../components/DashboardShell";
import { useApp } from "../context/useApp";

export function HistoryPage() {
  const navigate = useNavigate();
  const { history, loadPastAnalysis, deleteHistoryItem, clearHistory } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date"); // "date", "score", "match"

  const filteredHistory = history
    .filter((item) => {
      const matchSearch =
        item.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fileName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole =
        roleFilter === "all" || item.role?.toLowerCase().includes(roleFilter.toLowerCase());
      return matchSearch && matchRole;
    })
    .sort((a, b) => {
      if (sortBy === "score") return b.resumeScore - a.resumeScore;
      if (sortBy === "match") return (b.matchScore || 0) - (a.matchScore || 0);
      return new Date(b.date) - new Date(a.date);
    });

  const handleViewReport = (id) => {
    loadPastAnalysis(id);
    navigate("/analysis-results");
  };

  return (
    <DashboardShell
      title="Analysis History"
      subtitle="Review past resume evaluations, track score growth, and inspect detailed reports."
      action={
        <Link to="/resume-analyzer" className="primary-btn">
          <Upload size={14} /> Analyze New Resume
        </Link>
      }
    >
      <div className="history-page-container">
        {/* Controls: Search, Filter, Sort */}
        <div className="panel-card history-controls-card">
          <div className="controls-grid">
            <div className="search-field">
              <div className="input-wrap">
                <Search size={15} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by file name, role, or company..."
                />
              </div>
            </div>

            <div className="filter-field">
              <div className="select-wrap">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="plain-input"
                >
                  <option value="all">All Target Roles</option>
                  <option value="Frontend">Frontend Developer</option>
                  <option value="Backend">Backend Developer</option>
                  <option value="Full Stack">Full Stack Engineer</option>
                  <option value="Software Engineer">Software Engineer</option>
                </select>
              </div>
            </div>

            <div className="sort-field">
              <div className="select-wrap">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="plain-input"
                >
                  <option value="date">Sort by: Latest First</option>
                  <option value="score">Sort by: Resume Score (High &rarr; Low)</option>
                  <option value="match">Sort by: Job Match (High &rarr; Low)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* History Table / Empty State (Requirement 15) */}
        {filteredHistory.length > 0 ? (
          <div className="panel-card table-card" style={{ marginTop: 20 }}>
            <div className="table-header-row">
              <span className="section-subtitle">
                Showing {filteredHistory.length} recorded analyses
              </span>
              {history.length > 1 && (
                <button
                  type="button"
                  className="ghost-btn small-btn text-danger"
                  onClick={clearHistory}
                >
                  Clear All History
                </button>
              )}
            </div>

            <div className="table-responsive-desktop">
              <table>
                <thead>
                  <tr>
                    <th>Resume File</th>
                    <th>Target Role &amp; Company</th>
                    <th>Date</th>
                    <th>Resume Score</th>
                    <th>ATS Score</th>
                    <th>Job Match</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="file-pill-small">
                          <FileText size={13} /> {item.fileName}
                        </span>
                      </td>
                      <td>
                        <div className="table-role-cell">
                          <strong>{item.role}</strong>
                          <small className="muted-text">{item.company || "General Benchmark"}</small>
                        </div>
                      </td>
                      <td style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        {item.date}
                      </td>
                      <td>
                        <span className="badge-pill good">{item.resumeScore}/100</span>
                      </td>
                      <td>
                        <span className="badge-pill primary-soft-badge">{item.atsScore}/100</span>
                      </td>
                      <td>
                        {item.matchScore != null ? (
                          <span className="badge-pill good">{item.matchScore}%</span>
                        ) : (
                          <span className="muted-text" style={{ fontSize: "0.8rem" }}>Not set</span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="table-actions-inline">
                          <button
                            type="button"
                            className="secondary-btn small-btn"
                            onClick={() => handleViewReport(item.id)}
                          >
                            View Report
                          </button>
                          <button
                            type="button"
                            className="icon-trash-btn"
                            onClick={() => deleteHistoryItem(item.id)}
                            title="Delete this analysis"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="panel-card empty-state-card" style={{ marginTop: 20 }}>
            <div className="empty-state-icon">
              <History size={32} />
            </div>
            <h2>No analysis history yet</h2>
            <p className="empty-state-text">
              When you upload and analyze resumes, each evaluation report is saved here so you can track score progression over time.
            </p>
            <div className="empty-state-actions">
              <Link to="/resume-analyzer" className="primary-btn">
                <Sparkles size={16} /> Analyze a Resume
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
