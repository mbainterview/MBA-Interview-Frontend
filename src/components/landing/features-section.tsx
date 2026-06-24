import { SectionBadge } from "@/components/shared/section-badge";
import { Bot, GraduationCap, TrendingUp } from "lucide-react";
import type { ComponentType } from "react";

const imgBadge = "/figma-assets/9eafc8dd-583e-4c2a-b2c3-eaa6e24a6cfd.png";

const sora  = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

type CardItem = {
  Icon: ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  title: string;
  desc: string;
  featured: boolean;
};

const cards: CardItem[] = [
  {
    Icon: Bot,
    title: "AI Interview Simulation",
    desc: "Practice with our advanced AI that asks realistic interview questions and evaluates your responses in real-time.",
    featured: false,
  },
  {
    Icon: GraduationCap,
    title: "School-Specific Preparation",
    desc: "Build confidence with the types of questions you will get in the actual interview.",
    featured: true,
  },
  {
    Icon: TrendingUp,
    title: "Instant Scoring & Feedback",
    desc: "Get detailed AI-powered feedback on content, delivery, and structure. Track your progress over time.",
    featured: false,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-360 mx-auto px-4 md:px-8 xl:px-15">

        {/* Heading */}
        <div className="flex flex-col items-center gap-6 mb-15 text-center">
          <SectionBadge icon={<img src={imgBadge} alt="" className="w-7.25 h-6.75 object-contain" />}>
            Ace Your Interview
          </SectionBadge>
          <div className="flex flex-col gap-3 items-center">
            <h2 className="font-semibold leading-[1.3]" style={{ fontFamily: sora, fontSize: "32px", color: "#272727" }}>
              Your AI-Powered Interview Coach
            </h2>
            <p className="leading-[1.3]" style={{ fontFamily: inter, fontSize: "20px", color: "#808080" }}>
              Practice anywhere, anytime with intelligent feedback that helps you improve
            </p>
          </div>
        </div>

        {/* Mobile/tablet: stacked cards */}
        <div className="xl:hidden flex flex-col gap-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col gap-3 rounded-[24px] p-8"
              style={
                card.featured
                  ? { background: "#5450d8", boxShadow: "0px 10px 12px 0px rgba(0,0,0,0.16)" }
                  : { background: "white", border: "1px solid #eee", boxShadow: "0px 2px 12px 0px rgba(0,0,0,0.1)" }
              }
            >
              <div
                className="shrink-0 flex items-center justify-center rounded-[14px]"
                style={{
                  width: "60px",
                  height: "60px",
                  background: card.featured ? "rgba(255,255,255,0.15)" : "rgba(84,80,216,0.1)",
                }}
              >
                <card.Icon className="w-8 h-8" style={{ color: card.featured ? "white" : "#5450d8" }} strokeWidth={2} />
              </div>
              <div className="flex flex-col gap-4">
                <h3
                  className="font-semibold leading-[1.3]"
                  style={{ fontFamily: sora, fontSize: "18px", color: card.featured ? "white" : "#272727" }}
                >
                  {card.title}
                </h3>
                <p
                  className="leading-[1.3]"
                  style={{ fontFamily: inter, fontSize: "16px", color: card.featured ? "rgba(255,255,255,0.85)" : "#868686" }}
                >
                  {card.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: overlapping absolute layout */}
        <div className="hidden xl:block relative" style={{ height: "304px" }}>
          {/* White base card */}
          <div
            className="absolute rounded-[20px] bg-white"
            style={{ left: 0, right: 0, top: "30px", bottom: 0, boxShadow: "0px 2px 12px 0px rgba(0,0,0,0.1)" }}
          />

          {/* Left — AI Interview Simulation */}
          <div className="absolute flex flex-col gap-3" style={{ left: "61px", top: "80px", width: "300px" }}>
            <div
              className="shrink-0 flex items-center justify-center rounded-[14px]"
              style={{ width: "60px", height: "60px", background: "rgba(84,80,216,0.1)" }}
            >
              <Bot className="w-8 h-8" style={{ color: "#5450d8" }} strokeWidth={2} />
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold leading-[1.3]" style={{ fontFamily: sora, fontSize: "18px", color: "#272727" }}>
                AI Interview Simulation
              </h3>
              <p className="leading-[1.3]" style={{ fontFamily: inter, fontSize: "16px", color: "#868686" }}>
                Practice with our advanced AI that asks realistic interview questions and evaluates your responses in real-time.
              </p>
            </div>
          </div>

          {/* Center elevated — School-Specific Preparation */}
          <div
            className="absolute flex flex-col gap-3 rounded-[24px]"
            style={{
              left: "440px", top: 0, width: "440px", height: "274px",
              padding: "50px 46px",
              background: "#5450d8",
              borderBottom: "6px solid #5450d8",
              boxShadow: "0px 10px 12px 0px rgba(0,0,0,0.16)",
            }}
          >
            <div
              className="shrink-0 flex items-center justify-center rounded-[14px]"
              style={{ width: "60px", height: "60px", background: "rgba(255,255,255,0.18)" }}
            >
              <GraduationCap className="w-8 h-8" style={{ color: "white" }} strokeWidth={2} />
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold leading-[1.3]" style={{ fontFamily: sora, fontSize: "18px", color: "white" }}>
                School-Specific Preparation
              </h3>
              <p className="leading-[1.3]" style={{ fontFamily: inter, fontSize: "16px", color: "rgba(255,255,255,0.85)", width: "322px" }}>
                Build confidence with the types of questions you will get in the actual interview.
              </p>
            </div>
          </div>

          {/* Right — Instant Scoring & Feedback */}
          <div className="absolute flex flex-col gap-3" style={{ left: "959px", top: "80px", width: "300px" }}>
            <div
              className="shrink-0 flex items-center justify-center rounded-[14px]"
              style={{ width: "60px", height: "60px", background: "rgba(84,80,216,0.1)" }}
            >
              <TrendingUp className="w-8 h-8" style={{ color: "#5450d8" }} strokeWidth={2} />
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold leading-[1.3]" style={{ fontFamily: sora, fontSize: "18px", color: "#272727" }}>
                Instant Scoring &amp; Feedback
              </h3>
              <p className="leading-[1.3]" style={{ fontFamily: inter, fontSize: "16px", color: "#868686" }}>
                Get detailed AI-powered feedback on content, delivery, and structure. Track your progress over time.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
