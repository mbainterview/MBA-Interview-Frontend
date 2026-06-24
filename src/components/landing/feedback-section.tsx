import { SectionBadge } from "@/components/shared/section-badge";
import { Shield, Layers, FileText, ThumbsUp, Check, AlertTriangle, TrendingUp } from "lucide-react";
import type { ComponentType, CSSProperties } from "react";

const imgBadge = "/figma-assets/acbb4f6e-c569-4814-9020-7d26b765fa6a.png";

type ScoreItem = {
  score: string;
  label: string;
  Icon: ComponentType<{ className?: string; strokeWidth?: number; style?: CSSProperties }>;
};

const subScores: ScoreItem[] = [
  { score: "9.0", label: "Content Quality",      Icon: Shield },
  { score: "8.5", label: "Structure & Clarity",  Icon: Layers },
  { score: "8.0", label: "Delivery & Confidence", Icon: FileText },
];

const strengths = [
  "Clear articulation of career goals and how MBA fits into your journey",
  "Specific examples demonstrating leadership experience",
  "Confident delivery with good eye contact and pacing",
];

const improvements = [
  "Could elaborate more on why this specific school aligns with your goals",
  `Consider reducing filler words ("um", "like") for more polished delivery`,
  "Response could be more concise - aim for 90-120 seconds",
];

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

export function FeedbackSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-360 mx-auto px-4 md:px-8 xl:px-15">
        {/* Heading */}
        <div className="flex flex-col items-center gap-6 mb-15 text-center">
          <SectionBadge icon={<img src={imgBadge} alt="" className="w-7.25 h-6.75 object-contain" />}>
            Feedback Report
          </SectionBadge>
          <h2
            className="font-semibold leading-[1.3]"
            style={{ fontFamily: sora, fontSize: "32px", color: "#272727" }}
          >
            Detailed feedback on your interview response
          </h2>
        </div>

        {/* Main card */}
        <div
          className="rounded-[20px] bg-white overflow-hidden"
          style={{ border: "1px solid #eee", boxShadow: "0px 10px 16px 0px rgba(0,0,0,0.08)" }}
        >
          <div className="p-6 md:p-[39px_31px] flex flex-col gap-10">

            {/* Top row */}
            <div className="flex flex-col gap-6">
              <SectionBadge>Sample Feedback Report</SectionBadge>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <h3
                  className="font-semibold leading-[1.3]"
                  style={{ fontFamily: sora, fontSize: "20px", color: "#272727" }}
                >
                  Question: &ldquo;Why do you want to pursue an MBA at this time?&rdquo;
                </h3>
                <span
                  className="whitespace-nowrap"
                  style={{ fontFamily: inter, fontSize: "16px", color: "#868686" }}
                >
                  Response duration: 2m 15s
                </span>
              </div>
            </div>

            <hr style={{ borderColor: "#eee" }} />

            {/* Overall Score */}
            <div className="rounded-[12px] p-6" style={{ background: "#eeeefc" }}>
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold" style={{ fontFamily: sora, fontSize: "18px", color: "#272727" }}>
                  Overall Score
                </span>
                <span className="font-semibold" style={{ fontFamily: sora, fontSize: "32px", color: "#272727" }}>
                  8.5/10
                </span>
              </div>
              <div className="relative rounded-[7px] overflow-hidden bg-white h-13" style={{ boxShadow: "0px 14px 17.6px 0px rgba(0,0,0,0.04)" }}>
                <div
                  className="absolute left-0 top-0 h-full rounded-l-[7px] flex items-center justify-center"
                  style={{ width: "84.3%", background: "#5450d8" }}
                >
                  <span className="font-semibold" style={{ fontFamily: sora, fontSize: "24px", color: "white" }}>
                    85%
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-score cards */}
            <div className="flex flex-col sm:flex-row gap-5">
              {subScores.map(({ score, label, Icon }) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-[20px] px-6 h-28.75 flex-1"
                  style={{ border: "1px solid #e6e6e6", boxShadow: "0px 5px 5px 0px rgba(0,0,0,0.08)", background: "white" }}
                >
                  <div className="flex flex-col gap-2" style={{ opacity: 0.8 }}>
                    <span className="font-semibold" style={{ fontFamily: sora, fontSize: "24px", color: "#272727" }}>
                      {score}
                    </span>
                    <span style={{ fontFamily: inter, fontSize: "16px", color: "#272727" }}>
                      {label}
                    </span>
                  </div>
                  <div
                    className="flex items-center justify-center rounded-[25px] shrink-0 w-12.5 h-12.5"
                    style={{ background: "#e2e0ff" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: "#5450d8" }} strokeWidth={2.2} />
                  </div>
                </div>
              ))}
            </div>

            {/* Strengths & Improvements */}
            <div className="flex flex-col gap-8 w-full lg:w-141.25">
              {/* Strengths */}
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <div
                    className="flex items-center justify-center rounded-[25px] shrink-0 w-12.5 h-12.5"
                    style={{ background: "rgba(7,187,145,0.1)" }}
                  >
                    <ThumbsUp className="w-5 h-5" style={{ color: "#07bb91" }} strokeWidth={2.2} />
                  </div>
                  <span className="font-semibold" style={{ fontFamily: sora, fontSize: "18px", color: "#272727" }}>
                    Strengths
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 pl-15.25">
                  {strengths.map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center justify-center rounded-full shrink-0"
                        style={{ width: "20px", height: "20px", background: "rgba(7,187,145,0.15)" }}
                      >
                        <Check className="w-3.5 h-3.5" style={{ color: "#07bb91" }} strokeWidth={3} />
                      </span>
                      <span style={{ fontFamily: inter, fontSize: "14px", color: "#272727", lineHeight: "20px" }}>
                        {s}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Areas for Improvement */}
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <div
                    className="flex items-center justify-center rounded-[25px] shrink-0 w-12.5 h-12.5"
                    style={{ background: "rgba(248,204,22,0.1)" }}
                  >
                    <AlertTriangle className="w-5 h-5" style={{ color: "#f8cc16" }} strokeWidth={2.2} />
                  </div>
                  <span className="font-semibold" style={{ fontFamily: sora, fontSize: "18px", color: "#272727" }}>
                    Areas for Improvement
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 pl-15.25">
                  {improvements.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center justify-center shrink-0"
                        style={{ width: "20px", height: "20px" }}
                      >
                        <span
                          className="rounded-full"
                          style={{ width: "7px", height: "7px", background: "#868686" }}
                        />
                      </span>
                      <span style={{ fontFamily: inter, fontSize: "14px", color: "#272727", lineHeight: "20px" }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div
              className="flex flex-col gap-2.5 rounded-[12px] px-6 py-4"
              style={{ background: "#eeeefc", border: "1px solid white" }}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-5 h-5 shrink-0" style={{ color: "#5450d8" }} strokeWidth={2.2} />
                <span className="font-semibold" style={{ fontFamily: sora, fontSize: "16px", color: "#272727" }}>
                  Recommendation
                </span>
              </div>
              <p style={{ fontFamily: inter, fontSize: "14px", color: "#5450d8", lineHeight: "20px" }}>
                Strong response overall! Practice tightening your answer and research 2-3 specific programs or initiatives at the school to demonstrate deeper fit.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
