import { LandingButton } from "@/components/shared/landing-button";
import { Check } from "lucide-react";

const imgBadge = "/figma-assets/2ace92d2-2760-4ff5-bd31-0d9a1acd9044.png";

const sora  = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

/**
 * Hardcoded marketing copy, per the Figma landing pricing section (node 667:1561).
 * The public landing page is intentionally decoupled from the backend `/plans`
 * catalog so marketing can iterate freely without surfacing every admin-created
 * plan. Inside the authenticated app the billing page is dynamic and shows
 * whatever plans the admin has published.
 *
 * The CTAs route to /sign-in (public self-registration was removed — accounts
 * are provisioned by an admin). Plan selection happens on the authenticated
 * billing page.
 */

function CheckItem({ label, featured = false }: { label: string; featured?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <div
        className="shrink-0 flex items-center justify-center rounded-[17px] size-8.5"
        style={{ background: "rgba(84,80,216,0.1)" }}
      >
        <Check
          className="size-5"
          style={{ color: featured ? "#5450d8" : "#a7a5df" }}
          strokeWidth={3}
        />
      </div>
      <p style={{ fontFamily: inter, fontSize: "18px", color: "#868686", lineHeight: "1.3" }}>
        {label}
      </p>
    </div>
  );
}

const explorerFeatures = [
  "3 practice interviews per month",
  "Basic AI feedback",
  "Text-based responses only",
  "Access to 3 schools",
];

const featuredFeatures = [
  "Unlimited interviews of practice interviews",
  "Advanced AI analytics and feedback",
  "Video, audio and text responses",
  "All 25+ schools",
  "Kira video essay simulator",
  "Progress tracking dashboard",
];

const readyFeatures = [
  "Up to 50 practice interviews",
  "Advanced AI feedback & analytics",
  "Video, audio & text responses",
  "All 25+ schools",
  "Kira video essay simulator",
  "Progress tracking dashboard",
];

export function PricingSection({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-360 mx-auto px-4 md:px-8 xl:px-15">

        {/* ── Optional heading (hidden on /pricing page where hero serves this role) ── */}
        {showHeading && (
          <div className="flex flex-col items-center gap-6 mb-15 text-center">
            <div
              className="inline-flex items-center gap-2.5 rounded-full px-4"
              style={{ background: "rgba(84,80,216,0.1)", paddingTop: "8px", paddingBottom: "8px" }}
            >
              <img src={imgBadge} alt="" className="w-7.25 h-6.5 object-contain" />
              <span style={{ color: "#5450d8", fontFamily: inter, fontSize: "20px" }}>
                Pricing Detail
              </span>
            </div>
            <h2
              className="font-bold"
              style={{ fontFamily: sora, fontSize: "40px", color: "#070707", lineHeight: "1.3" }}
            >
              Simple, Transparent Pricing
            </h2>
            <p style={{ fontFamily: inter, fontSize: "18px", color: "#808080", lineHeight: "1.2" }}>
              Choose the plan that fits your interview preparation needs
            </p>
          </div>
        )}

        {/* ── Cards: mobile stacked → desktop 3-col with elevated center ── */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-start justify-center gap-6 xl:gap-0">

          {/* ── Explorer (left) ── */}
          <div
            className="xl:mt-13.75 xl:h-163.75 rounded-[20px] bg-white flex flex-col w-full xl:w-98.75 shrink-0"
            style={{ boxShadow: "0px 2px 12px 0px rgba(0,0,0,0.1)" }}
          >
            {/* Title area floats at top */}
            <div className="flex flex-col items-center gap-2 pt-15.5 pb-6 px-8 text-center">
              <p className="font-semibold" style={{ fontFamily: sora, fontSize: "32px", color: "#272727", lineHeight: "1.3" }}>
                Explorer
              </p>
              <div className="flex items-center gap-3">
                <span className="font-bold" style={{ fontFamily: sora, fontSize: "48px", color: "#272727" }}>$0</span>
                <span style={{ fontFamily: inter, fontSize: "20px", color: "#868686" }}>/forever</span>
              </div>
              <p style={{ fontFamily: inter, fontSize: "16px", color: "#868686" }}>
                Get started with basic practice to build interview skills.
              </p>
            </div>

            {/* Feature panel anchored to bottom with mt-auto */}
            <div
              className="mt-auto flex flex-col justify-between p-8 rounded-[20px]"
              style={{ background: "rgba(223,223,249,0.2)", minHeight: "393px" }}
            >
              <div className="flex flex-col gap-4">
                {explorerFeatures.map((f) => <CheckItem key={f} label={f} />)}
              </div>
              <LandingButton
                href="/sign-in"
                variant="secondary"
                className="w-full rounded-[16px] py-4 font-bold text-[14px] mt-10"
              >
                Start Free
              </LandingButton>
            </div>
          </div>

          {/* ── Full Season Pass (center, featured) ── */}
          <div
            className="rounded-[20px] bg-white flex flex-col w-full xl:w-132.5 xl:h-191 shrink-0 xl:-mx-0.75 z-10"
            style={{ border: "6px solid #5450d8" }}
          >
            {/* "Most Popular" banner */}
            <div
              className="flex items-center justify-center h-26.25 shrink-0 rounded-t-[14px]"
              style={{ background: "#5450d8" }}
            >
              <p style={{ fontFamily: inter, fontSize: "24px", color: "white", lineHeight: "1.5" }}>
                Most Popular
              </p>
            </div>

            {/*
              Content area — Figma pushes both blocks toward the bottom with a
              32px gap. The title block "floats" 16px below the banner; the
              feature panel is anchored to the bottom at exactly 438px tall.
            */}
            <div className="flex flex-col flex-1 items-center justify-end gap-8 xl:pt-4 py-6 xl:py-0">
              {/* Title block */}
              <div className="flex flex-col items-center gap-2 px-8 text-center">
                <p className="font-semibold" style={{ fontFamily: sora, fontSize: "32px", color: "#272727", lineHeight: "1.3" }}>
                  Full Season Pass
                </p>
                <div className="flex items-center gap-3">
                  <span className="font-bold" style={{ fontFamily: sora, fontSize: "60px", color: "#272727", lineHeight: "1.3" }}>$197</span>
                  <span style={{ fontFamily: inter, fontSize: "20px", color: "#868686" }}>/six-month pass</span>
                </div>
                <p className="max-w-82" style={{ fontFamily: inter, fontSize: "16px", color: "#868686", lineHeight: "1.3" }}>
                  Season Pass. Start preparing early for true MBA interview mastery.
                </p>
              </div>

              {/* Feature panel — fixed 438px in Figma, flush to card bottom */}
              <div
                className="flex flex-col gap-10 items-center p-8 rounded-[20px] w-full xl:h-109.5 shrink-0"
                style={{ background: "rgba(223,223,249,0.2)" }}
              >
                <div className="flex flex-col gap-4 w-full">
                  {featuredFeatures.map((f) => <CheckItem key={f} label={f} featured />)}
                </div>
                <LandingButton
                  href="/sign-in"
                  variant="primary"
                  className="w-full rounded-[16px] py-4 font-bold text-[14px] mt-auto"
                >
                  Get Season Pass
                </LandingButton>
              </div>
            </div>
          </div>

          {/* ── Interview Ready (right) ── */}
          <div
            className="xl:mt-13.75 xl:h-163.75 rounded-[20px] bg-white flex flex-col w-full xl:w-98.75 shrink-0"
            style={{ boxShadow: "0px 2px 12px 0px rgba(0,0,0,0.1)" }}
          >
            {/* Title area floats at top */}
            <div className="flex flex-col items-center gap-2 pt-8 pb-6 px-8 text-center">
              <p className="font-semibold" style={{ fontFamily: sora, fontSize: "32px", color: "#272727", lineHeight: "1.3" }}>
                Interview Ready
              </p>
              <div className="flex items-center gap-3">
                <span className="font-bold" style={{ fontFamily: sora, fontSize: "48px", color: "#272727" }}>$67</span>
                <span style={{ fontFamily: inter, fontSize: "20px", color: "#868686" }}>/per month</span>
              </div>
              <p style={{ fontFamily: inter, fontSize: "16px", color: "#868686" }}>
                Have an interview invite? Let&apos;s get you ready fast!
              </p>
            </div>

            {/* Feature panel anchored to bottom with mt-auto */}
            <div
              className="mt-auto flex flex-col justify-between p-8 rounded-[20px]"
              style={{ background: "rgba(223,223,249,0.2)", minHeight: "450px" }}
            >
              <div className="flex flex-col gap-4">
                {readyFeatures.map((f) => <CheckItem key={f} label={f} featured />)}
              </div>
              <LandingButton
                href="/sign-in"
                variant="secondary"
                className="w-full rounded-[16px] py-4 font-bold text-[14px] mt-10"
              >
                Start 7-Day Trial
              </LandingButton>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
