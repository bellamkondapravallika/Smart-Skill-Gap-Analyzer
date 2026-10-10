import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Brain,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  GraduationCap,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
  Target,
  Upload,
  X,
} from "lucide-react";
import { useApp } from "../context/useApp";
import { Toast } from "./Toast";

const sidebarLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/resume-analyzer", icon: Upload, label: "Upload Resume" },
  { to: "/analysis-results", icon: BarChart3, label: "Resume Report" },
  { to: "/job-description", icon: BriefcaseBusiness, label: "Target Job Match" },
  { to: "/skill-gap", icon: Target, label: "Skill Gaps" },
  { to: "/learning-roadmap", icon: GraduationCap, label: "Learning Roadmap" },
  { to: "/interview-preparation", icon: MessageSquareQuote, label: "Interview Prep" },
  { to: "/resume-improvement", icon: FileCheck2, label: "Resume Improver" },
  { to: "/history", icon: History, label: "Analysis History" },
  { to: "/profile", icon: Settings, label: "Profile & Settings" },
];

const routeBreadcrumbMap = {
  "/dashboard": "Dashboard",
  "/resume-analyzer": "Resume Analyzer",
  "/analysis-results": "Analysis Report",
  "/job-description": "Target Job Match",
  "/skill-gap": "Skill Gaps",
  "/learning-roadmap": "Learning Roadmap",
  "/interview-preparation": "Interview Preparation",
  "/resume-improvement": "Resume Bullet Improver",
  "/history": "Analysis History",
  "/profile": "Profile & Settings",
};

export function DashboardShell({ title, subtitle, action, children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem("skillgap_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const location = useLocation();
  const { user, analysis, logout } = useApp();

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("skillgap_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  const currentBreadcrumb = routeBreadcrumbMap[location.pathname] || title;
  const userName = user?.full_name || user?.name || "Professional";
  const userRole = user?.target_role || user?.targetRole || "Software Engineer";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const overallScore = analysis?.scores?.overall ?? null;

  return (
    <div className={`dashboard-shell ${isCollapsed ? "collapsed" : ""}`}>
      <Toast />

      {/* Mobile overlay backdrop */}
      {mobileNavOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`sidebar ${isCollapsed ? "collapsed" : ""} ${
          mobileNavOpen ? "sidebar-mobile-open" : ""
        }`}
      >
        <div
          className="sidebar-brand-row"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "space-between",
            width: "100%",
          }}
        >
          <Link
            to="/"
            className="brand sidebar-brand"
            onClick={() => setMobileNavOpen(false)}
            title="SkillGap Home"
          >
            <div className="brand-icon">
              <Brain size={20} />
            </div>
            {!isCollapsed && (
              <span>
                Skill<span>Gap</span>
              </span>
            )}
          </Link>

          {!isCollapsed && (
            <button
              type="button"
              className="sidebar-collapse-toggle"
              onClick={toggleCollapse}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          )}

          <button
            className="mobile-close-btn"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {isCollapsed && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
            <button
              type="button"
              className="sidebar-collapse-toggle"
              onClick={toggleCollapse}
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen size={16} />
            </button>
          </div>
        )}

        <nav className="sidebar-nav" aria-label="Sidebar Navigation">
          {sidebarLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => (isActive ? "side-link active" : "side-link")}
              onClick={() => setMobileNavOpen(false)}
              title={isCollapsed ? label : undefined}
            >
              <Icon size={18} />
              {!isCollapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar readiness widget (hidden when collapsed) */}
        {!isCollapsed && (
          <div className="sidebar-card">
            <div className="sidebar-card-head">
              <Sparkles size={15} />
              <span>Active Readiness</span>
            </div>
            {overallScore != null ? (
              <>
                <strong>{overallScore}/100</strong>
                <p>{analysis.target_role || analysis.targetRole || userRole} Fit</p>
                <Link
                  to="/analysis-results"
                  className="sidebar-card-link"
                  onClick={() => setMobileNavOpen(false)}
                >
                  View Report &rarr;
                </Link>
              </>
            ) : (
              <>
                <strong style={{ fontSize: "1.05rem" }}>Not Analyzed</strong>
                <p>Upload your resume</p>
                <Link
                  to="/resume-analyzer"
                  className="sidebar-card-link"
                  onClick={() => setMobileNavOpen(false)}
                >
                  Upload Now &rarr;
                </Link>
              </>
            )}
          </div>
        )}

        {/* User quick pill & Sign out */}
        <div
          className="sidebar-user-container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "space-between",
            padding: isCollapsed ? "8px 0" : "8px 12px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 10,
            border: "1px solid var(--border)",
            marginTop: "auto",
            width: "100%",
          }}
        >
          <Link
            to="/profile"
            className="sidebar-user-pill"
            onClick={() => setMobileNavOpen(false)}
            title={userName}
            style={{
              flex: isCollapsed ? "none" : 1,
              border: "none",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: isCollapsed ? "center" : "flex-start",
            }}
          >
            <div className="user-avatar-small">{initials}</div>
            {!isCollapsed && (
              <div className="user-info-text">
                <strong
                  style={{
                    maxWidth: 120,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {userName}
                </strong>
                <small
                  style={{
                    maxWidth: 120,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {userRole}
                </small>
              </div>
            )}
          </Link>
          {!isCollapsed && (
            <button
              type="button"
              className="icon-only-btn"
              onClick={logout}
              title="Sign Out"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
                padding: 6,
                display: "flex",
                alignItems: "center",
              }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Top bar with breadcrumb and mobile trigger */}
        <div className="dashboard-topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
            <nav className="breadcrumb-nav" aria-label="Breadcrumb">
              <Link to="/dashboard">Dashboard</Link>
              {location.pathname !== "/dashboard" && (
                <>
                  <ChevronRight size={14} className="breadcrumb-sep" />
                  <span className="breadcrumb-current">{currentBreadcrumb}</span>
                </>
              )}
            </nav>
          </div>

          <div
            className="topbar-right"
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <span className="role-badge">
              <Target size={14} />
              {userRole}
            </span>
          </div>
        </div>

        {/* Page Header */}
        <header className="dashboard-header">
          <div>
            <p className="eyebrow subtle">AI Career Intelligence</p>
            <h1>{title}</h1>
            {subtitle && <p className="muted-text">{subtitle}</p>}
          </div>
          {action && <div className="header-actions">{action}</div>}
        </header>

        {children}
      </main>
    </div>
  );
}
