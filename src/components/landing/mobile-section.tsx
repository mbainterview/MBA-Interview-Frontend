import { LandingButton } from "@/components/shared/landing-button";
import { Clock, Video, MessageSquareText, LineChart } from "lucide-react";
import type { ComponentType, CSSProperties } from "react";

const imgBadge = "/figma-assets/ba14d54e-6e44-476e-b2ba-87336a69fcd3.png";
const imgIPhone = "/figma-assets/f6ccaa6e-db57-42b6-9f19-5a2f74938cc6.png";
const imgAppleLogo = "/figma-assets/f45d7334-2a3b-4cd0-93d3-ef42af288ef8.svg";
const imgGooglePlay = "/figma-assets/a33e8f4c-c1bd-4e2e-8121-e2ba440dc40a.svg";

type FeatureItem = {
  Icon: ComponentType<{ className?: string; strokeWidth?: number; style?: CSSProperties }>;
  title: string;
  desc: string;
};

const features: FeatureItem[] = [
  {
    Icon: Clock,
    title: "Practice Interviews On the Go",
    desc: "Answer questions anytime, anywhere with mobile-optimized mock interviews",
  },
  {
    Icon: Video,
    title: "Record Kira-Style Video Responses",
    desc: "Practice timed video interviews with your phone's camera in real conditions",
  },
  {
    Icon: MessageSquareText,
    title: "Receive Instant AI Feedback",
    desc: "Get immediate performance scores and improvement suggestions on your device",
  },
  {
    Icon: LineChart,
    title: "Track Interview Progress Anytime",
    desc: "Monitor your readiness score and review past interviews from anywhere",
  },
];

export function MobileSection() {
  return (
    <section id="resources" className="py-20 bg-white">
      <div className="max-w-360 mx-auto px-4 md:px-8 xl:px-15">
        <div className="flex flex-col xl:flex-row items-end justify-between gap-16">
          {/* Left column */}
          <div className="flex flex-col gap-8 w-full xl:w-134.25 shrink-0">
            {/* Badge */}
            <div className="flex flex-col gap-6">
              <div
                className="inline-flex items-center gap-2.5 rounded-full px-4 w-fit"
                style={{ background: "rgba(84,80,216,0.1)", paddingTop: "8px", paddingBottom: "10px" }}
              >
                <img src={imgBadge} alt="" className="w-4.5 h-7.25 object-contain" />
                <span style={{ color: "#5450d8", fontFamily: "var(--font-inter), sans-serif", fontSize: "16px" }}>
                  Mobile App Available
                </span>
              </div>

              {/* Title + description */}
              <div className="flex flex-col gap-4">
                <h2
                  className="font-semibold"
                  style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "32px", color: "#272727", lineHeight: "1.3", maxWidth: "367px" }}
                >
                  Practice Anytime, Anywhere
                </h2>
                <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "20px", color: "#868686", lineHeight: "1.3" }}>
                  Take your MBA interview preparation with you. Practice mock interviews, record Kira-style video responses, and receive AI feedback—all from your mobile device.
                </p>
              </div>
            </div>

            {/* Feature rows */}
            <div className="flex flex-col gap-3">
              {features.map(({ Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex items-center rounded-[12px] border border-white pl-3 pr-4 py-3"
                  style={{ background: "#eeeefc", minHeight: "80px" }}
                >
                  <div className="relative shrink-0 mr-3 flex items-center justify-center" style={{ width: "58px", height: "58px", marginTop: "6.5px" }}>
                    <div
                      className="absolute inset-0 rounded-[12px] bg-white"
                      style={{ boxShadow: "0px 30px 60px -10px rgba(0,0,0,0.14)" }}
                    />
                    <Icon className="relative w-6 h-6" style={{ color: "#5450d8" }} strokeWidth={2.2} />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <span
                      className="font-semibold"
                      style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "18px", color: "#272727", lineHeight: "1.3" }}
                    >
                      {title}
                    </span>
                    <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "14px", color: "#868686", lineHeight: "20px" }}>
                      {desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5 shrink-0 w-full xl:w-167.5">
            {/* iPhone mockup */}
            <div className="relative" style={{ height: "516px" }}>
              {/* Background card anchored to bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 rounded-[21px]"
                style={{ background: "#edecfd", height: "378px" }}
              />
              {/* Phone: centred, same clip+transform pattern as pricing-mobile-section */}
              <div
                className="absolute flex items-center justify-center"
                style={{ width: "582.713px", height: "516.328px", left: "50%", transform: "translateX(-50%)", top: 0 }}
              >
                <div className="flex-none" style={{ transform: "rotate(180deg) scaleY(-1)" }}>
                  <div className="relative" style={{ width: "582.713px", height: "516.328px" }}>
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <img
                        src={imgIPhone}
                        alt="MBA Interview App"
                        className="absolute max-w-none"
                        style={{ height: "188%", width: "222.02%", top: "-19.55%", left: "-54.39%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* App store buttons */}
            <div className="flex gap-5">
              {/* App Store */}
              <LandingButton
                variant="primary"
                className="flex-1 justify-between rounded-[16px] px-8 py-4.5"
              >
                <div className="flex flex-col gap-1 items-start">
                  <span style={{ fontSize: "16px" }}>Download on the</span>
                  <span className="font-semibold" style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "20px" }}>
                    App Store
                  </span>
                </div>
                <img src={imgAppleLogo} alt="Apple" style={{ height: "49px", width: "40px", objectFit: "contain" }} />
              </LandingButton>

              {/* Google Play */}
              <LandingButton
                variant="secondary"
                className="flex-1 justify-between rounded-[16px] px-8 py-4.5"
              >
                <div className="flex flex-col gap-1 items-start">
                  <span style={{ fontSize: "16px" }}>GET IT ON</span>
                  <span className="font-semibold" style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "20px" }}>
                    Google Play
                  </span>
                </div>
                <img src={imgGooglePlay} alt="Google Play" style={{ height: "49px", width: "49px", objectFit: "contain" }} />
              </LandingButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
