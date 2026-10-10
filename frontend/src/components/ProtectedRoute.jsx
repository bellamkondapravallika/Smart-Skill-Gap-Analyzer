import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "../context/useApp";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, authLoading } = useApp();
  const location = useLocation();

  if (authLoading) {
    return (
      <div style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-base, #0b0f19)",
        color: "var(--text-muted, #94a3b8)",
        fontSize: "0.95rem"
      }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto 12px" }}></div>
          Authenticating session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
