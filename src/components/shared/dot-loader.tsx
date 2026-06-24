interface DotLoaderProps {
  /** Outer pixel size of the loader square */
  size?: number;
  color?: string;
}

/**
 * 8x8 grid of dots animated as a circular wave. Used by the "Preparing
 * Your Report" / "Preparing Your Invoice" / "Processing Your Payment"
 * modals across the app — sourced from Figma frames 981:5175 / 812:10663 /
 * 812:10467.
 */
export function DotLoader({ size = 56, color = "#5450d8" }: DotLoaderProps) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: "repeat(8, 1fr)",
        gap: "3px",
        width: `${size}px`,
        height: `${size}px`,
      }}
      aria-label="Loading"
    >
      {Array.from({ length: 64 }).map((_, i) => {
        const row = Math.floor(i / 8);
        const col = i % 8;
        const distance = Math.sqrt((row - 3.5) ** 2 + (col - 3.5) ** 2);
        const delay = (distance / 5) * 0.6;
        return (
          <span
            key={i}
            className="rounded-full"
            style={{
              background: color,
              animation: `dot-loader-pulse 1.4s ease-in-out ${delay}s infinite`,
            }}
          />
        );
      })}
      <style jsx>{`
        @keyframes dot-loader-pulse {
          0%,
          80%,
          100% {
            opacity: 0.2;
            transform: scale(0.7);
          }
          40% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
