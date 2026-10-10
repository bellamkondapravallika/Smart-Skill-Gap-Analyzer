import { useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  LogOut,
  Mail,
  Save,
  Target,
  User,
} from "lucide-react";
import { DashboardShell } from "../components/DashboardShell";
import { useApp } from "../context/useApp";

export function ProfilePage() {
  const { user, updateUser, logout, showToast } = useApp();

  const [name, setName] = useState(user?.full_name || user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [targetRole, setTargetRole] = useState(user?.target_role || user?.targetRole || "Frontend Developer");
  const [experience, setExperience] = useState(user?.experience_level || user?.experience || "1–2 years");
  const [goals, setGoals] = useState(user?.goals || ["Career growth", "Skill mastery"]);

  const allGoalOptions = [
    "Career growth",
    "Skill mastery",
    "Higher salary",
    "Pass ATS filters",
    "Tech interview readiness",
    "Transition to senior role",
  ];

  const toggleGoal = (g) => {
    setGoals((prev) =>
      prev.includes(g) ? prev.filter((item) => item !== g) : [...prev, g]
    );
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateUser({
      full_name: name,
      name,
      target_role: targetRole,
      targetRole,
      experience_level: experience,
      experience,
      goals,
    });
    showToast("Profile settings saved successfully!");
  };

  return (
    <DashboardShell
      title="Profile &amp; Career Settings"
      subtitle="Manage your identity, target career benchmarks, and roadmap preferences."
      action={
        <button type="button" className="primary-btn compact" onClick={handleSave}>
          <Save size={15} /> Save Changes
        </button>
      }
    >
      <div className="profile-page-container">
        <div className="profile-grid">
          {/* Personal Information */}
          <div className="panel-card">
            <div className="panel-header">
              <div className="section-eyebrow primary-eyebrow">
                <User size={15} /> Personal Details
              </div>
              <h3 style={{ fontSize: "1.15rem", marginTop: 4 }}>Account Information</h3>
            </div>

            <form onSubmit={handleSave} style={{ marginTop: 14 }}>
              <div className="field-block">
                <label htmlFor="user-fullname">Full Name</label>
                <div className="input-wrap">
                  <User size={16} />
                  <input
                    id="user-fullname"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field-block">
                <label htmlFor="user-email">Email Address</label>
                <div className="input-wrap">
                  <Mail size={16} />
                  <input
                    id="user-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field-block">
                <label htmlFor="user-exp">Experience Level</label>
                <div className="select-wrap">
                  <select
                    id="user-exp"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="plain-input"
                  >
                    <option value="Student / Recent Grad">Student / Recent Grad</option>
                    <option value="Fresher / Entry-Level">Fresher / Entry-Level</option>
                    <option value="1–2 years">1–2 years</option>
                    <option value="3–5 years">3–5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 22, display: "flex", gap: 12 }}>
                <button type="submit" className="primary-btn">
                  <Save size={15} /> Save Details
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={logout}
                  style={{ color: "#f87171" }}
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </form>
          </div>

          {/* Career Benchmark Settings */}
          <div className="panel-card">
            <div className="panel-header">
              <div className="section-eyebrow success-eyebrow">
                <Target size={15} /> Target Role Calibration
              </div>
              <h3 style={{ fontSize: "1.15rem", marginTop: 4 }}>Career Goals</h3>
            </div>

            <div style={{ marginTop: 14 }}>
              <div className="field-block">
                <label htmlFor="target-role-input">Primary Target Role</label>
                <div className="input-wrap">
                  <BriefcaseBusiness size={16} />
                  <input
                    id="target-role-input"
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Frontend Developer"
                  />
                </div>
                <small className="muted-text">
                  Used as the baseline for ATS keyword evaluations and missing skill detection.
                </small>
              </div>

              <div className="field-block" style={{ marginTop: 18 }}>
                <label>Focus Goals</label>
                <div className="option-grid" style={{ gridTemplateColumns: "1fr", gap: 8, marginTop: 6 }}>
                  {allGoalOptions.map((opt) => {
                    const isSelected = goals.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        className={`option-pill ${isSelected ? "active" : ""}`}
                        style={{ minHeight: 46, padding: "10px 14px", justifyContent: "space-between" }}
                        onClick={() => toggleGoal(opt)}
                      >
                        <span style={{ fontSize: "0.88rem" }}>{opt}</span>
                        {isSelected && <CheckCircle2 size={16} className="text-success" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
