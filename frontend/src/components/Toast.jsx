import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { useApp } from "../context/useApp";

export function Toast() {
  const { toast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={18} className="toast-icon-success" />,
    warning: <AlertTriangle size={18} className="toast-icon-warning" />,
    info: <Info size={18} className="toast-icon-info" />,
  };

  return (
    <div className={`toast-container toast-${toast.type || "success"}`} role="alert">
      <div className="toast-content">
        {icons[toast.type] || icons.success}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
