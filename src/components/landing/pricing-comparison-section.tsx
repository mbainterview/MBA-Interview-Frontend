import { Check, X } from "lucide-react";

const sora  = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

type Cell = string | "yes" | "no";

type Row = {
  feature: string;
  explorer: Cell;
  seasonPass: Cell;
  interviewReady: Cell;
};

const rows: Row[] = [
  { feature: "Practice Sessions",   explorer: "3/month",           seasonPass: "Unlimited",     interviewReady: "50/month" },
  { feature: "School Profiles",     explorer: "3 school profiles", seasonPass: "25+",           interviewReady: "25+" },
  { feature: "AI Feedback Level",   explorer: "Basic",             seasonPass: "Premium",       interviewReady: "Premium" },
  { feature: "Kira Video Practice", explorer: "no",                seasonPass: "yes",           interviewReady: "yes" },
  { feature: "Detailed Analytics",  explorer: "no",                seasonPass: "yes",           interviewReady: "yes" },
  { feature: "Progress Tracking",   explorer: "Basic",             seasonPass: "Full + Export", interviewReady: "Full" },
];

function CellContent({ value, light = false }: { value: Cell; light?: boolean }) {
  if (value === "yes") {
    return <Check className="size-5 inline" style={{ color: light ? "#ffffff" : "#5450d8" }} strokeWidth={3} />;
  }
  if (value === "no") {
    return <X className="size-5 inline" style={{ color: light ? "rgba(255,255,255,0.7)" : "#c4c4c4" }} strokeWidth={3} />;
  }
  return (
    <span style={{ fontFamily: inter, fontSize: "16px", color: light ? "#ffffff" : "#272727" }}>
      {value}
    </span>
  );
}

export function PricingComparisonSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-360 mx-auto px-4 md:px-8 xl:px-15">

        {/* Mobile / tablet: stacked cards (a comparison table doesn't read well on
            narrow screens, so each plan becomes its own labelled list). */}
        <div className="lg:hidden flex flex-col gap-8">
          {[
            { name: "Explorer", key: "explorer" as const, featured: false },
            { name: "Season Pass", key: "seasonPass" as const, featured: true },
            { name: "Interview Ready", key: "interviewReady" as const, featured: false },
          ].map((col) => (
            <div
              key={col.key}
              className="rounded-[20px] p-6"
              style={{
                background: col.featured ? "#5450d8" : "white",
                border: col.featured ? "none" : "1px solid #e6e6e6",
                boxShadow: col.featured ? "0px 10px 12px 0px rgba(0,0,0,0.16)" : "0px 2px 12px 0px rgba(0,0,0,0.06)",
              }}
            >
              <p
                className="font-semibold mb-4"
                style={{
                  fontFamily: sora,
                  fontSize: "22px",
                  color: col.featured ? "white" : "#272727",
                  lineHeight: "1.3",
                }}
              >
                {col.name}
              </p>
              <div className="flex flex-col gap-3">
                {rows.map((r) => (
                  <div key={r.feature} className="flex items-center justify-between gap-4">
                    <span
                      style={{
                        fontFamily: inter,
                        fontSize: "15px",
                        color: col.featured ? "rgba(255,255,255,0.85)" : "#868686",
                      }}
                    >
                      {r.feature}
                    </span>
                    <CellContent value={r[col.key]} light={col.featured} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: 4-column comparison table — center "Season Pass" column rendered
            as a raised purple card overlay. The grid uses fixed-width columns so the
            elevated card aligns precisely with its header. */}
        <div className="hidden lg:block relative">
          <div className="grid grid-cols-[1.4fr_1fr_1.2fr_1fr]">

            {/* Header row */}
            <div />
            <div className="text-center pb-6">
              <p style={{ fontFamily: sora, fontSize: "20px", fontWeight: 600, color: "#5450d8" }}>
                Explorer
              </p>
            </div>
            {/* Season Pass header sits ON the elevated card; just spacer here */}
            <div className="text-center pb-6" />
            <div className="text-center pb-6">
              <p style={{ fontFamily: sora, fontSize: "20px", fontWeight: 600, color: "#5450d8" }}>
                Interview Ready
              </p>
            </div>

            {/* Body rows (Explorer + Interview Ready columns; Season Pass overlaid below) */}
            {rows.map((r, idx) => (
              <FragmentRow
                key={r.feature}
                row={r}
                isLast={idx === rows.length - 1}
              />
            ))}
          </div>

          {/* Elevated Season Pass column overlay — positioned over the 3rd column */}
          <div
            className="absolute top-0 rounded-[20px] flex flex-col"
            style={{
              left: "calc((100% / 4.6) * 2.4)",
              width: "calc((100% / 4.6) * 1.2)",
              background: "#5450d8",
              boxShadow: "0px 10px 24px -8px rgba(84,80,216,0.45)",
            }}
          >
            <p
              className="text-center pt-6 pb-6"
              style={{ fontFamily: sora, fontSize: "20px", fontWeight: 600, color: "white" }}
            >
              Season Pass
            </p>
            {rows.map((r, idx) => (
              <div
                key={r.feature}
                className="text-center py-4"
                style={{
                  borderTop: idx === 0 ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <CellContent value={r.seasonPass} light />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

function FragmentRow({ row, isLast }: { row: Row; isLast: boolean }) {
  const cellStyle = {
    borderTop: "1px solid #ececec",
    borderBottom: isLast ? "1px solid #ececec" : undefined,
  };
  return (
    <>
      <div className="py-4 pl-2" style={cellStyle}>
        <span style={{ fontFamily: inter, fontSize: "16px", color: "#868686" }}>
          {row.feature}
        </span>
      </div>
      <div className="py-4 text-center" style={cellStyle}>
        <CellContent value={row.explorer} />
      </div>
      {/* Spacer cell where the elevated Season Pass column overlays */}
      <div className="py-4 text-center" />
      <div className="py-4 text-center" style={cellStyle}>
        <CellContent value={row.interviewReady} />
      </div>
    </>
  );
}
