import { LandingButton } from "@/components/shared/landing-button";
import { Bot, GraduationCap, Zap, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const imgApp1 = "/figma-assets/adb4a2b2-74cd-4eb5-833d-7f555ec854d5.png";

type StatItem = { value: string; label: string; Icon: LucideIcon };

const stats: StatItem[] = [
  { value: "25+",  label: "Schools Covered",    Icon: GraduationCap },
  { value: "3x",   label: "Faster Preparation", Icon: Zap },
  { value: "100%", label: "Interview Ready",    Icon: TrendingUp },
];

const sora  = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

export function HeroSection() {
  return (
    <section className="bg-white pt-16 pb-24 relative overflow-hidden">
      {/* Decorative vertical purple line — runs from the top of the hero down to the
          bottom edge of the browser mockup (not into the section below). Figma node
          667:1706 "Vector 43"; sits just left of the stat-cards column so the dashed
          connectors on each card's left edge meet it cleanly. */}
      <div
        aria-hidden="true"
        className="hidden xl:block absolute pointer-events-none"
        style={{
          top: 0,
          bottom: "96px",
          left: "calc(50% + 287px)",
          width: "3px",
          background: "#5450d8",
          boxShadow: "0 0 12px 0 rgba(84,80,216,0.45), 0 0 24px 0 rgba(84,80,216,0.25)",
          zIndex: 0,
        }}
      />

      <div className="max-w-360 mx-auto px-15 relative">
        {/* Top row: copy left, vertical stat stack right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-start">
          {/* Copy column */}
          <div className="flex flex-col gap-6 pt-10">
            <div className="inline-flex items-center gap-2.5 rounded-full px-4 py-2 w-fit" style={{ background: "rgba(84,80,216,0.1)" }}>
              <Bot className="w-5 h-5" style={{ color: "#5450d8" }} strokeWidth={2.2} />
              <span style={{ fontFamily: inter, fontSize: "16px", color: "#5450d8" }}>AI-Powered Interview Practice</span>
            </div>
            <div className="pb-2.5">
              <h1 className="font-normal leading-[1.3]" style={{ fontFamily: sora, fontSize: "67.621px", color: "#272727" }}>AI-Powered MBA</h1>
              <h1 className="font-normal leading-[1.3]" style={{ fontFamily: sora, fontSize: "65.218px", color: "#5450d8" }}>Interview Practice</h1>
            </div>
            <p className="max-w-132.75 capitalize" style={{ fontFamily: inter, fontSize: "22px", color: "#868686", lineHeight: "1.2" }}>
              Practice real MBA interview &amp; Kira video questions with instant AI feedback. Get admitted to your dream business school.
            </p>
            <div className="flex flex-row gap-2">
              <LandingButton href="/sign-in" variant="primary" className="rounded-[16px] px-8 py-4.5 text-xl w-55">
                Start Practice
              </LandingButton>
              <LandingButton href="/pricing" variant="ghost" className="rounded-[16px] px-8 py-4.5 text-xl w-55">
                View Pricing
              </LandingButton>
            </div>
          </div>

          {/* Vertical stat stack */}
          <div className="relative flex flex-col gap-4 pt-10 w-full lg:w-63.25">
            {/* Tree-structure connector (xl+ only), drawn as one SVG so the
                L-junctions (trunk → Card 1 tap at the top, trunk → Card 3 tap
                at the bottom) can be rounded instead of sharp 90° corners, and
                so the dash pattern flows continuously through each leg.

                Coordinate system — viewBox 120×342, origin at top-left:
                  • x=0   : solid line (SVG's left edge; SVG positioned at left=-120px)
                  • x=100 : vertical trunk (20px left of card)
                  • x=120 : card left edge
                  • y=85  : Card 1 center
                  • y=191 : Card 2 center (T-junction with the main segment)
                  • y=297 : Card 3 center
                  • r=8   : corner radius on the top/bottom L-junctions

                Positions assume card height = 90px (56px icon + py-4 + 1px
                border each side) with gap-4 between cards and pt-10 on container. */}
            <svg
              aria-hidden="true"
              className="hidden xl:block absolute pointer-events-none"
              style={{ left: "-120px", top: 0, width: "120px", height: "342px" }}
              viewBox="0 0 120 342"
              fill="none"
            >
              {/* Main leg: horizontal from the solid line through the trunk to Card 2. */}
              <path d="M 0 191 H 120" stroke="#5450d8" strokeWidth="1.5" strokeDasharray="4 4" />
              {/* Trunk going up + rounded curve into Card 1's tap. */}
              <path d="M 100 191 V 93 A 8 8 0 0 1 108 85 H 120" stroke="#5450d8" strokeWidth="1.5" strokeDasharray="4 4" />
              {/* Trunk going down + rounded curve into Card 3's tap. */}
              <path d="M 100 191 V 289 A 8 8 0 0 0 108 297 H 120" stroke="#5450d8" strokeWidth="1.5" strokeDasharray="4 4" />
            </svg>

            {stats.map(({ value, label, Icon }) => (
              <div
                key={label}
                className="relative flex items-center gap-4 rounded-[16px] border border-white px-5 py-4"
                style={{
                  background: "linear-gradient(135deg, rgba(237,236,253,0.4), rgba(255,255,255,0.6))",
                  boxShadow: "0px 8px 24px -8px rgba(84,80,216,0.12)",
                }}
              >
                <div
                  className="flex items-center justify-center shrink-0 rounded-[12px] bg-white"
                  style={{ width: "56px", height: "56px", boxShadow: "0px 4px 12px 0px rgba(0,0,0,0.06)" }}
                >
                  <Icon className="w-6 h-6" style={{ color: "#5450d8" }} strokeWidth={2.2} />
                </div>
                <div className="flex flex-col">
                  <div className="font-bold leading-none" style={{ fontSize: "28px", color: "#272727", fontFamily: sora }}>{value}</div>
                  <div className="mt-1" style={{ fontSize: "14px", color: "#868686", fontFamily: inter }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Full-width browser mockup with lavender band behind its lower portion */}
      <div className="relative mt-12">
        {/* Lavender band — full-viewport-width, sits behind lower ~2/3 of mockup */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 pointer-events-none"
          style={{ top: "37%", bottom: "-180px" }}
        />

        <div className="relative max-w-360 mx-auto px-15">
          <div
            className="relative rounded-tl-[28px] rounded-tr-[28px] bg-[#ededee] overflow-hidden"
            style={{
              boxShadow:
                "0 -14px 26px -20px rgba(84,80,216,0.22), -12px 0 24px -20px rgba(84,80,216,0.18), 12px 0 24px -20px rgba(84,80,216,0.18)",
            }}
          >
            <div className="flex items-center justify-between px-4" style={{ background: "#fbfbfb", height: "30px", borderBottom: "0.5px solid #d3d3d3" }}>
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <span style={{ fontSize: "12.7px", color: "rgba(34,44,68,0.4)", fontFamily: inter }}>Finder&nbsp;&nbsp;&nbsp;Edit&nbsp;&nbsp;&nbsp;View&nbsp;&nbsp;&nbsp;Go&nbsp;&nbsp;&nbsp;Window&nbsp;&nbsp;&nbsp;Help</span>
              </div>
              <span style={{ fontSize: "12.7px", color: "rgba(34,44,68,0.4)", fontFamily: inter }}>Fri 2:55 PM</span>
            </div>
            <div
              className="relative bg-white overflow-hidden rounded-tl-[14px] rounded-tr-[14px]"
              style={{ height: "560px" }}
            >
              <img
                src={imgApp1}
                alt="MBA Interview Practice App"
                className="w-full block"
                style={{ objectFit: "cover", objectPosition: "top center" }}
              />

              {/* ::after overlay — matches Figma node 667:1616.
                  Thin white hairlines on the sides, subtle inset edge
                  highlights, and a soft fade at the bottom that blends the
                  screenshot into the lavender band below (the Figma source
                  image is 792 px tall but the visible window is 484 px — the
                  bottom third is faded out with a white-to-transparent gradient). */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none rounded-tl-[14px] rounded-tr-[14px]"
                style={{
                  borderLeft: "1px solid rgba(255,255,255,0.06)",
                  borderRight: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: [
                    "inset 0px 0px 0px 0.5px rgba(255,255,255,0.03)",
                    "inset 0px 2px 3px 0px rgba(255,255,255,0.03)",
                    "inset 0px 0.5px 0px 0px rgba(255,255,255,0.1)",
                  ].join(", "),
                }}
              />
              {/* Bottom fade — dissolves the mockup's flat bottom edge into the
                  white section background. Keeps a soft lavender tint in the middle
                  of the gradient so the transition still reads as designed. */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 pointer-events-none"
                style={{
                  height: "260px",
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(237,236,253,0.55) 45%, rgba(255,255,255,0.95) 85%, #ffffff 100%)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
