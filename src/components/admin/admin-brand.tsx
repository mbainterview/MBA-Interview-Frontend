/**
 * MBA Interview AI brand mark — used in the admin sidebar.
 * Inline SVG so it ships without any image asset and inherits font.
 */
export function AdminBrand() {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M5 30 L15 10 L20 20 L25 10 L35 30 Z"
          fill="var(--primary)"
          opacity="0.85"
        />
        <path
          d="M5 30 L15 10 L20 20 L25 10 L35 30"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <div className="font-heading flex flex-col leading-none">
        <span className="text-[14px] font-bold tracking-[0.02em] text-[#222c44]">
          MBA INTERVIEW AI
        </span>
        <span className="mt-0.5 text-[8px] tracking-[0.18em] text-[#868686]">
          POWERED BY MMG
        </span>
      </div>
    </div>
  );
}
