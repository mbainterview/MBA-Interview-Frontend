import { SectionBadge } from "@/components/shared/section-badge";
import { FeatureRow } from "@/components/shared/feature-row";
import { LandingButton } from "@/components/shared/landing-button";
import { Clock, Video, ArrowUpRight, FileText } from "lucide-react";

const imgKiraBadge = "/figma-assets/bd3e4c9c-8996-45a4-85c6-63ac3346c2d9.png";
const imgVideoThumb = "/figma-assets/499662cb-30e5-4118-ac48-7cb25feb9bab.jpg";

const features = [
  {
    icon: <Clock className="w-6 h-6" style={{ color: "#5450d8" }} strokeWidth={2.2} />,
    title: "Timed Practice",
    desc: "Experience real time pressure with our accurate countdown timer",
  },
  {
    icon: <Video className="w-6 h-6" style={{ color: "#5450d8" }} strokeWidth={2.2} />,
    title: "Video Recording",
    desc: "Record and review your responses to improve your delivery",
  },
];

export function KiraSection() {
  return (
    <section id="kira-prep" className="py-20 bg-white">
      <div className="max-w-360 mx-auto px-4 md:px-8 xl:px-15">
        <div className="flex flex-col xl:flex-row items-start justify-between gap-12">
          {/* Left column */}
          <div className="flex flex-col gap-12.5 w-full xl:w-134.25">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-6">
                <SectionBadge icon={<img src={imgKiraBadge} alt="" className="w-7.25 h-6.5 object-contain" />}>
                  Kira Video Essay
                </SectionBadge>

                <div className="flex flex-col gap-4">
                  <h2
                    className="font-bold leading-[1.3] max-w-91.75"
                    style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "40px", color: "#070707" }}
                  >
                    Master the Kira Video Interview
                  </h2>
                  <p
                    className="leading-[1.2]"
                    style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "18px", color: "#808080" }}
                  >
                    Many top MBA programs use Kira Talent for video essay assessments. Practice with our realistic simulator that mimics the exact experience&mdash;60-second preparation, timed responses, and real questions.
                  </p>
                </div>
              </div>

              {/* Feature rows */}
              <div className="flex flex-col gap-2">
                {features.map((f) => (
                  <FeatureRow key={f.title} icon={f.icon} title={f.title} desc={f.desc} variant="card" />
                ))}
              </div>
            </div>

            {/* CTA button */}
            <LandingButton
              href="/sign-in"
              variant="primary"
              className="gap-4 rounded-[16px] px-8 py-4.5 text-xl w-full sm:w-fit whitespace-nowrap"
            >
              Start Practice
              <ArrowUpRight className="w-4 h-4" strokeWidth={2.4} />
            </LandingButton>
          </div>

          {/* Right column — Kira video card */}
          <div
            className="rounded-[20px] overflow-hidden shadow-md relative shrink-0 w-full xl:w-162.5 xl:h-157.5"
            style={{ border: "1px solid #eee", background: "white" }}
          >
            {/* Header */}
            <div className="absolute flex items-center justify-between" style={{ left: "23px", right: "23px", top: "23px" }}>
              <span
                className="font-semibold text-xl"
                style={{ fontFamily: "var(--font-sora), sans-serif", color: "#222c44" }}
              >
                Kira Video Essay
              </span>
              <span
                className="text-xl"
                style={{ fontFamily: "var(--font-inter), sans-serif", color: "#808080" }}
              >
                Question 2 of 5
              </span>
            </div>

            {/* Divider */}
            <div className="absolute w-full" style={{ top: "73px", borderBottom: "1px solid #eee" }} />

            {/* Question card */}
            <div
              className="absolute rounded-[12px] flex items-center px-4 py-6"
              style={{ left: "23px", right: "23px", top: "88px", background: "#f9f9f9" }}
            >
              <p
                className="text-base leading-[1.3]"
                style={{ fontFamily: "var(--font-inter), sans-serif", color: "#808080" }}
              >
                &ldquo;Describe a situation where you had to adapt quickly to change. What was the outcome?&rdquo;
              </p>
            </div>

            {/* Video area */}
            <div
              className="absolute rounded-[12px] overflow-hidden"
              style={{ left: "23px", right: "23px", top: "194px", height: "355px", background: "#f9f9f9" }}
            >
              <img src={imgVideoThumb} alt="Kira Video practice" className="w-full h-full object-cover" />

              {/* Floating AI feedback chip */}
              <div
                className="absolute flex items-center gap-2 rounded-[10px] px-3 py-2 backdrop-blur-md"
                style={{
                  left: "24px",
                  top: "170px",
                  background: "rgba(255,255,255,0.55)",
                  border: "1px solid rgba(255,255,255,0.6)",
                  boxShadow: "0px 4px 12px 0px rgba(0,0,0,0.12)",
                }}
              >
                <div
                  className="flex items-center justify-center shrink-0 rounded-[8px]"
                  style={{ width: "28px", height: "28px", background: "rgba(84,80,216,0.15)" }}
                >
                  <FileText className="w-3.5 h-3.5" style={{ color: "#5450d8" }} strokeWidth={2.4} />
                </div>
                <div className="flex flex-col">
                  <span
                    className="font-semibold"
                    style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "13px", color: "#272727", lineHeight: "1.2" }}
                  >
                    Great eye contact!
                  </span>
                  <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "10px", color: "#868686", lineHeight: "1.2" }}>
                    AI feedback
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="absolute flex items-center justify-between" style={{ left: "23px", right: "23px", top: "561px" }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center rounded-[20px] border border-[#ff1e22] bg-[rgba(255,30,34,0.1)] w-10 h-10 text-base text-[#ff1e22]"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  60
                </div>
                <span
                  className="text-base"
                  style={{ fontFamily: "var(--font-inter), sans-serif", color: "#808080" }}
                >
                  seconds remaining
                </span>
              </div>
              <LandingButton variant="primary" className="rounded-[10px] px-5 py-2.5 text-sm max-w-fit">
                Start Recording
              </LandingButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
