import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, LockKeyhole, Mail, User, AlertCircle, Loader2 } from "lucide-react";
import { useApp } from "../context/useApp";

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useApp();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const getPasswordStrength = () => {
    if (!password) return { label: "None", color: "transparent" };
    if (password.length < 6) return { label: "Weak (min 6 chars)", color: "#ef4444" };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { label: "Strong", color: "#10b981" };
    }
    return { label: "Moderate", color: "#f59e0b" };
  };

  const strength = getPasswordStrength();

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim() || !email.trim()) {
      setErrorMessage("Please enter both your full name and email address.");
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("Please accept the terms and conditions to create an account.");
      return;
    }

    setSubmitting(true);
    const result = await signup(fullName.trim(), email.trim(), password, confirmPassword);
    setSubmitting(false);

    if (result.success) {
      navigate("/onboarding");
    } else {
      setErrorMessage(result.error || "Failed to create account. Please try again.");
    }
  };

  return (
    <div className="auth-page sign-up-page">
      <div className="auth-form-panel wide-panel">
        <div className="form-shell">
          <Link to="/" className="auth-logo" style={{ marginBottom: 16 }}>
            <div className="brand-icon">
              <Brain size={20} />
            </div>
            <span>
              Skill<span>Gap</span>
            </span>
          </Link>

          <h1>Create your account</h1>
          <p className="muted-text" style={{ marginBottom: 20 }}>
            Start uncovering skill gaps and building an ATS-optimized career roadmap
          </p>

          {errorMessage && (
            <div className="auth-error-banner" style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: 8,
              color: "#f87171",
              fontSize: "0.875rem",
              marginBottom: 16
            }}>
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSignup}>
            <div className="field-block">
              <label htmlFor="full-name">Full Name</label>
              <div className="input-wrap">
                <User size={16} />
                <input
                  id="full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="field-block">
              <label htmlFor="signup-email">Email Address</label>
              <div className="input-wrap">
                <Mail size={16} />
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="split-fields">
              <div className="field-block">
                <label htmlFor="signup-password">Password</label>
                <div className="input-wrap">
                  <LockKeyhole size={16} />
                  <input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 chars"
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="field-block">
                <label htmlFor="confirm-password">Confirm Password</label>
                <div className="input-wrap">
                  <LockKeyhole size={16} />
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            {password && (
              <div className="password-strength-row" style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem" }}>
                <span style={{ color: "var(--muted)" }}>Strength:</span>
                <strong style={{ color: strength.color }}>{strength.label}</strong>
              </div>
            )}

            <div className="terms-row" style={{ marginTop: 14 }}>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>

            <button
              type="submit"
              className="primary-btn full-width"
              style={{ marginTop: 22 }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Creating Account...
                </>
              ) : (
                "Create Account & Get Started"
              )}
            </button>
          </form>

          <p className="form-footer">
            Already have an account?{" "}
            <Link to="/login" className="text-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
