import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Brain,
  LockKeyhole,
  Mail,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useApp } from "../context/useApp";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, completeOAuthLogin, showToast } = useApp();
  const oauthParams = new URLSearchParams(location.search);
  const initialOAuthError = oauthParams.get("oauth_error");
  const oauthProviderName =
    oauthParams.get("provider") === "google"
      ? "Google"
      : oauthParams.get("provider") === "github"
        ? "GitHub"
        : "";
  const initialOAuthErrorMessage =
    initialOAuthError === "access_denied"
      ? "Sign-in was cancelled."
      : initialOAuthError === "not_configured" && oauthProviderName
        ? `${oauthProviderName} sign-in is not configured. Please configure ${oauthProviderName} OAuth credentials.`
        : initialOAuthError && oauthProviderName
          ? `Unable to sign in with ${oauthProviderName}. Please try again.`
          : "";
  const callbackParams = new URLSearchParams(location.hash.slice(1));
  const callbackAccessToken = callbackParams.get("access_token");
  const callbackProvider = callbackParams.get("provider");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(Boolean(callbackAccessToken));
  const [errorMessage, setErrorMessage] = useState(initialOAuthErrorMessage);
  const [forgotModal, setForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const oauthCallbackHandled = useRef(false);

  useEffect(() => {
    if (oauthCallbackHandled.current) return;

    const oauthError = new URLSearchParams(location.search).get("oauth_error");
    if (oauthError) {
      oauthCallbackHandled.current = true;
      navigate(location.pathname, { replace: true, state: location.state });
      return;
    }

    if (!callbackAccessToken) return;

    oauthCallbackHandled.current = true;
    window.history.replaceState(null, "", `${location.pathname}${location.search}`);
    completeOAuthLogin(callbackAccessToken, callbackProvider)
      .then((result) => {
        if (result.success) {
          navigate("/dashboard", { replace: true });
        } else {
          setErrorMessage(result.error || "Could not complete sign in. Please try again.");
        }
      })
      .finally(() => setSubmitting(false));
  }, [callbackAccessToken, callbackProvider, completeOAuthLogin, location.pathname, location.search, location.state, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    setSubmitting(true);
    const result = await login(email.trim(), password);
    setSubmitting(false);

    if (result.success) {
      const destination =
        location.state?.from?.pathname ||
        (typeof location.state?.from === "string" ? location.state.from : null) ||
        "/dashboard";
      navigate(destination, { replace: true });
    } else {
      setErrorMessage(result.error || "Invalid credentials. Please verify your email and password.");
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      showToast("Please enter your account email.", "warning");
      return;
    }
    showToast(`Password reset link sent to ${resetEmail}`, "success");
    setForgotModal(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <Link to="/" className="auth-logo">
          <div className="brand-icon">
            <Brain size={20} />
          </div>
          <span>
            Skill<span>Gap</span>
          </span>
        </Link>
        <h2>Career progress should feel intentional.</h2>
        <p>Log in to access your real resume ATS diagnostics, verified skill gap matrices, and personalized milestones.</p>

        <div className="mini-panel">
          <div className="mini-panel-head">
            <TrendingUp size={16} /> Real Career Intelligence
          </div>
          <div className="mini-panel-metrics">
            <div>
              <strong>Real</strong>
              <span>Resume score</span>
            </div>
            <div>
              <strong>Verified</strong>
              <span>ATS audit</span>
            </div>
            <div>
              <strong>Target</strong>
              <span>Skill match</span>
            </div>
          </div>
        </div>

        <div className="trust-pills" style={{ marginTop: 24, display: "grid", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", color: "var(--muted)" }}>
            <CheckCircle2 size={16} color="var(--success)" /> Continuous tracking of target skill competencies
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", color: "var(--muted)" }}>
            <CheckCircle2 size={16} color="var(--success)" /> Zero fabricated data — derived exclusively from your uploads
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="form-shell login-form-shell">
          <h1>Welcome back</h1>
          <p className="muted-text" style={{ marginBottom: 20 }}>
            Sign in to continue your career development
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

          <form onSubmit={handleLogin}>
            <div className="field-block">
              <label htmlFor="login-email">Email Address</label>
              <div className="input-wrap">
                <Mail size={16} />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="field-block">
              <label htmlFor="login-password">Password</label>
              <div className="input-wrap">
                <LockKeyhole size={16} />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="row-between" style={{ marginTop: 14 }}>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  setResetEmail(email);
                  setForgotModal(true);
                }}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="primary-btn full-width"
              style={{ marginTop: 22 }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="form-footer">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="modal-backdrop" onClick={() => setForgotModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Reset your password</h3>
            <p className="muted-text" style={{ margin: "10px 0 16px" }}>
              Enter your account email and we&apos;ll send you instructions to reset your password.
            </p>
            <form onSubmit={handleForgotPassword}>
              <div className="field-block">
                <label>Email Address</label>
                <div className="input-wrap">
                  <Mail size={16} />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setForgotModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn" style={{ flex: 1 }}>
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
