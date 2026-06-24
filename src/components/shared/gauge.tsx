const sora = "var(--font-sora), sans-serif";

interface GaugeProps {
  value: number;
  /** Hex stroke color for the progress arc */
  color?: string;
  /** Hex stroke color for the background arc */
  trackColor?: string;
  size?: number;
  stroke?: number;
  /** Display format for the centered label */
  format?: "percent" | "score";
  /** Position of the label text — inside the arc or below it */
  labelPosition?: "inside" | "below";
}

/**
 * Semicircular SVG gauge. Used by Kira / Mock Interview results pages and
 * the Performance Analytics dashboard. Stroke color, size, and label format
 * are all configurable so the same primitive renders both the large
 * "78/100" gauge and the small skill-improvement gauges.
 */
export function Gauge({
  value,
  color = "#22c55e",
  trackColor = "#e6f4ea",
  size = 200,
  stroke = 14,
  format = "score",
  labelPosition = "inside",
}: GaugeProps) {
  const radius = (size - stroke * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const arcLength = Math.PI * radius;
  const progress = (Math.max(0, Math.min(100, value)) / 100) * arcLength;
  const height = size * 0.6;

  const label = format === "percent" ? `${value}%` : `${value}/100`;
  const fontSize = size <= 140 ? 18 : 26;

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg
        width={size}
        height={height}
        viewBox={`0 0 ${size} ${height}`}
      >
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${arcLength}`}
        />
      </svg>
      {labelPosition === "inside" && (
        <div
          className="absolute"
          style={{
            top: `${cy - fontSize * 0.55}px`,
            fontFamily: sora,
            fontSize: `${fontSize}px`,
            fontWeight: 700,
            color: "#222c44",
          }}
        >
          {label}
        </div>
      )}
      {labelPosition === "below" && (
        <div
          className="mt-1"
          style={{
            fontFamily: sora,
            fontSize: `${fontSize}px`,
            fontWeight: 700,
            color: "#222c44",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
