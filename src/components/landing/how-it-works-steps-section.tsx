import type { ReactNode } from "react";
import { SectionBadge } from "@/components/shared/section-badge";

const imgBadge     = "/figma-assets/6a8da5ca-93fc-4eda-b066-e07b0b43586b.png";
const imgConnector = "/figma-assets/ce75f5ec-65a6-4191-b98e-d751b0d53c84.svg";

const imgStep1       = "/figma-assets/8df1de34-fc12-4ff8-9ab3-73ccbc115a5d.svg";
const imgStep2       = "/figma-assets/eca49759-9452-4182-8977-fffc00f1d0b1.svg";
const imgStep3Circle = "/figma-assets/90ad298f-645e-4b3b-80c0-1e6099c5de81.svg";
const imgStep3Icon   = "/figma-assets/50e6ff78-27e1-42bd-b4f7-1579873935a9.svg";
const imgStep4       = "/figma-assets/dfc1db6a-cc2a-4570-99f0-42d4c13c1557.svg";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

/**
 * Renders a step icon matching the Figma structure:
 * outer div holds the fixed bounding box, inner div is absolutely inset with
 * a slight bleed so the shadow/glow extends outside, img fills that div.
 */
function StepIcon({ src }: { src: string }) {
  return (
    <div className="relative shrink-0 overflow-visible" style={{ width: "85px", height: "85px" }}>
      <div className="absolute" style={{ inset: "-9.41% -9.45%" }}>
        <img src={src} alt="" className="block w-full h-full" style={{ maxWidth: "none" }} />
      </div>
    </div>
  );
}

interface Step {
  num: string;
  title: string;
  body: string;
  icon: ReactNode;
  /** Desktop-only left offset for the diagonal cascade */
  xlOffset: string;
}

const STEPS: Step[] = [
  {
    num: "Step 1",
    title: "Create Your Account",
    body: "Sign up in seconds with your email. No credit card required to start your free practice sessions.",
    icon: <StepIcon src={imgStep1} />,
    xlOffset: "0px",
  },
  {
    num: "Step 2",
    title: "Select Your Target Schools",
    body: "Choose from 25+ top MBA programs. We'll customize your practice based on each school's unique interview style.",
    icon: <StepIcon src={imgStep2} />,
    xlOffset: "149px",
  },
  {
    num: "Step 3",
    title: "Start Mock Interviews",
    body: "Practice with realistic interview simulations. Answer questions just like you would in a real interview setting.",
    icon: (
      /* Circle background + video icon overlaid — matches Figma grid-overlay pattern */
      <div className="relative shrink-0 overflow-visible" style={{ width: "85px", height: "85px" }}>
        {/* Circle bg — uses same inset-bleed wrapper as StepIcon */}
        <div className="absolute" style={{ inset: "-9.41% -9.45%" }}>
          <img src={imgStep3Circle} alt="" className="block w-full h-full" style={{ maxWidth: "none" }} />
        </div>
        {/* Video icon — centred at 26px from top-left, matching Figma ml-6.5 mt-6.5 */}
        <img
          src={imgStep3Icon}
          alt=""
          className="absolute"
          style={{ width: "32px", height: "32px", top: "26px", left: "26px" }}
        />
      </div>
    ),
    xlOffset: "367px",
  },
  {
    num: "Step 4",
    title: "Receive AI Feedback",
    body: "Get instant, detailed feedback on your responses. Understand your strengths and areas for improvement.",
    icon: <StepIcon src={imgStep4} />,
    xlOffset: "606px",
  },
];

export function HowItWorksStepsSection() {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-360 mx-auto px-4 md:px-8 xl:px-15">

        {/* Section heading */}
        <div className="flex flex-col items-center gap-6 mb-16 text-center">
          <SectionBadge
            icon={
              <img src={imgBadge} alt="" className="object-contain" style={{ width: "27px", height: "26px" }} />
            }
          >
            Your Journey
          </SectionBadge>

          <div className="flex flex-col gap-3">
            <h2
              className="font-semibold"
              style={{ fontFamily: sora, fontSize: "32px", color: "#222c44", lineHeight: "1.3" }}
            >
              Step-by-Step Flow
            </h2>
            <p style={{ fontFamily: inter, fontSize: "20px", color: "#808080", lineHeight: "1.3" }}>
              From sign-up to interview mastery in just four steps
            </p>
          </div>
        </div>

        {/* Diagonal cascade container */}
        <div className="relative">

          {/* Connector line — z-0 so cards sit above it */}
          <img
            src={imgConnector}
            alt=""
            aria-hidden="true"
            className="hidden xl:block absolute z-0 pointer-events-none select-none"
            style={{
              left: "calc(53.1%)",
              top: "74px",
              width: "499px",
              height: "546.5px",
            }}
          />

          <div className="flex flex-col gap-12.5">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="relative z-10 flex gap-7 items-center"
                style={{ marginLeft: `clamp(0px, ${step.xlOffset}, 38%)` }}
              >
                {/* Icon column: icon centred above "Step N" label */}
                <div className="flex flex-col items-center gap-3 shrink-0" style={{ width: "85px" }}>
                  {step.icon}
                  <span
                    className="font-semibold text-center whitespace-nowrap"
                    style={{ fontFamily: sora, fontSize: "16px", color: "#5f5f5f" }}
                  >
                    {step.num}
                  </span>
                </div>

                {/* Step card */}
                <div
                  className="flex flex-col gap-4 rounded-[20px] flex-1 xl:flex-none"
                  style={{
                    background: "#eeeefc",
                    padding: "20px 40px",
                    maxWidth: "593px",
                  }}
                >
                  <p
                    className="font-semibold"
                    style={{ fontFamily: sora, fontSize: "20px", color: "#5450d8", lineHeight: "1.3" }}
                  >
                    {step.title}
                  </p>
                  <p
                    style={{ fontFamily: inter, fontSize: "16px", color: "#5f5f5f", lineHeight: "1.875" }}
                  >
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
