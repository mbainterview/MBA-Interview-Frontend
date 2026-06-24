import { Clock, CheckCircle2 } from "lucide-react";
import { SectionBadge } from "@/components/shared/section-badge";

const imgBadge = "/figma-assets/c411bb79-c1e4-4619-bd8e-536014583a05.png";

const ICON_PURPLE = "#5450D8";
const ICON_GREEN  = "#2ea44f";

// Inline mini sparkline — replaces the Figma "shadow" PNG that was a tiny
// upward score-trend graphic on the right side of each row. Same visual
// intent: a small green-ish curve indicating progress.
function ScoreSparkline() {
  return (
    <svg
      viewBox="0 0 61 24"
      width="61"
      height="23.7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M2 18 L12 14 L22 16 L32 9 L42 11 L52 5 L59 6"
        stroke={ICON_PURPLE}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

const sora  = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

const historyItems = [
  { question: "Why do you want an MBA?",           score: 78 },
  { question: "Describe a leadership challenge.",  score: 78 },
  { question: "What is your biggest weakness?",    score: 78 },
  { question: "Walk me through your resume.",       score: 78 },
];

export function KiraHistorySection() {
  return (
    <section className="py-20" style={{ background: "#fafafa" }}>
      <div className="max-w-360 mx-auto px-4 md:px-8 xl:px-15">

        {/* Header */}
        <div className="flex flex-col items-center gap-6 mb-15 text-center">
          <SectionBadge icon={<img src={imgBadge} alt="" className="w-7.25 h-5.75 object-contain" />}>
            Track Progress
          </SectionBadge>
          <div className="flex flex-col gap-4">
            <h2
              className="font-semibold leading-[1.3]"
              style={{ fontFamily: sora, fontSize: "32px", color: "#222c44" }}
            >
              Practice History
            </h2>
            <p style={{ fontFamily: inter, fontSize: "20px", color: "#808080", lineHeight: "1.3" }}>
              Review your attempts, track improvements, and identify patterns
            </p>
          </div>
        </div>

        {/* History card */}
        <div
          className="mx-auto rounded-[20px] overflow-hidden"
          style={{
            maxWidth: "801px",
            border: "1px solid #eee",
            boxShadow: "0px 10px 16px 0px rgba(0,0,0,0.08)",
            background: "white",
          }}
        >
          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-5.5">
            <span className="font-semibold" style={{ fontFamily: sora, fontSize: "20px", color: "#222c44" }}>
              Recent Practice Sessions
            </span>
            <span style={{ fontFamily: inter, fontSize: "20px", color: "#808080" }}>
              Question 2 of 5
            </span>
          </div>

          {/* Divider */}
          <div className="w-full h-px" style={{ background: "#eee" }} />

          {/* Rows */}
          {historyItems.map((item, i) => (
            <div key={i}>
              <div className="flex items-center justify-between px-6 py-6">
                {/* Left: question + meta */}
                <div className="flex flex-col gap-2.5">
                  <span
                    className="font-normal"
                    style={{ fontFamily: sora, fontSize: "18px", color: "#222c44" }}
                  >
                    {item.question}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-2" style={{ fontFamily: inter, fontSize: "16px", color: "#7f7f7f" }}>
                      <Clock className="w-5 h-5 shrink-0" stroke={ICON_PURPLE} strokeWidth={2} />
                      2 days ago
                    </span>
                    <span className="inline-flex items-center gap-2" style={{ fontFamily: inter, fontSize: "16px", color: "#7f7f7f" }}>
                      <CheckCircle2 className="w-5 h-5 shrink-0" fill={ICON_GREEN} stroke="#ffffff" strokeWidth={2} />
                      Reviewed
                    </span>
                  </div>
                </div>

                {/* Right: score + graphic */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex flex-col items-end gap-2.5">
                    <span className="font-semibold" style={{ fontFamily: sora, fontSize: "18px", color: "#222c44" }}>
                      {item.score}
                    </span>
                    <span style={{ fontFamily: inter, fontSize: "18px", color: "#7f7f7f" }}>
                      out of 100
                    </span>
                  </div>
                  <ScoreSparkline />
                </div>
              </div>

              {/* Divider between rows (skip after last) */}
              {i < historyItems.length - 1 && (
                <div className="w-full h-px" style={{ background: "#eee" }} />
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
