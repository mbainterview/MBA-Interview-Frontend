const inter = "var(--font-inter), sans-serif";

export interface RadarAxis {
  label: string;
  /** Normalized value 0..1 */
  value: number;
}

interface RadarChartProps {
  axes: RadarAxis[];
  size?: number;
  fillColor?: string;
  strokeColor?: string;
  gridColor?: string;
  labelColor?: string;
}

/**
 * N-axis radar chart rendered as inline SVG. Used by the Kira results page
 * and the Performance Analytics dashboard. Pass `axes` (any length ≥ 3);
 * grid pentagons / hexagons / etc. are computed automatically.
 */
export function RadarChart({
  axes,
  size = 280,
  fillColor = "rgba(84, 80, 216, 0.18)",
  strokeColor = "#5450d8",
  gridColor = "#ececf5",
  labelColor = "#5b5b6b",
}: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.32;
  const sides = axes.length;

  const point = (i: number, factor: number) => {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * maxRadius * factor,
      y: cy + Math.sin(angle) * maxRadius * factor,
    };
  };

  const polygonAt = (factor: number) =>
    Array.from({ length: sides }, (_, i) => {
      const p = point(i, factor);
      return `${p.x},${p.y}`;
    }).join(" ");

  const dataPolygon = axes
    .map((axis, i) => {
      const p = point(i, axis.value);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={polygonAt(level)}
          fill="none"
          stroke={gridColor}
          strokeWidth="1"
        />
      ))}
      {axes.map((_, i) => {
        const end = point(i, 1);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={end.x}
            y2={end.y}
            stroke={gridColor}
            strokeWidth="1"
          />
        );
      })}
      <polygon
        points={dataPolygon}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="1.5"
      />
      {axes.map((axis, i) => {
        const labelPos = point(i, 1.18);
        return (
          <text
            key={axis.label}
            x={labelPos.x}
            y={labelPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontFamily: inter,
              fontSize: "11px",
              fill: labelColor,
            }}
          >
            {axis.label}
          </text>
        );
      })}
    </svg>
  );
}
