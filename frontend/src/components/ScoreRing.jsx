export function ScoreRing({ score, max = 100, size = 120, strokeWidth = 10, label = "Score", subtitle = "", tone = "primary" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeScore = Math.min(Math.max(score, 0), max);
  const strokeDashoffset = circumference - (safeScore / max) * circumference;

  const toneColors = {
    primary: { stroke: "#4f46e5", bg: "#e0e7ff" },
    success: { stroke: "#16a34a", bg: "#dcfce7" },
    warning: { stroke: "#f59e0b", bg: "#fef3c7" },
    danger: { stroke: "#ef4444", bg: "#fee2e2" },
  };

  const selectedTone = toneColors[tone] || toneColors.primary;

  return (
    <div className="score-ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="score-ring-svg">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={selectedTone.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="score-ring-center">
        <strong className="score-value">{score}</strong>
        {subtitle ? <span className="score-sub">{subtitle}</span> : <span className="score-label">{label}</span>}
      </div>
    </div>
  );
}
