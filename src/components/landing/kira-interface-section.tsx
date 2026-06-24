import { SectionBadge } from "@/components/shared/section-badge";
import { LandingButton } from "@/components/shared/landing-button";

const imgBadge     = "/figma-assets/f8db4e0a-8855-451b-9d21-3ff45bdaca66.png";
const imgVideoBg   = "/figma-assets/e6abbdb5-750e-478d-90c6-7a3d929cab71.jpg";
const imgVideoFg   = "/figma-assets/13e7ab7b-e734-4bfd-9303-0c7a7c705cb4.jpg";
const imgTimerMask = "https://www.figma.com/api/mcp/asset/57bc8dcf-7100-421a-9694-32254704b1a8";

const sora  = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

export function KiraInterfaceSection() {
  return (
    <section className="py-20">
      <div className="max-w-360 mx-auto px-4 md:px-8 xl:px-15">

        {/* Section header */}
        <div className="flex flex-col items-center gap-6 mb-15 text-center">
          <SectionBadge icon={<img src={imgBadge} alt="" className="w-6.5 h-6.25 object-contain" />}>
            Live Preview
          </SectionBadge>
          <div className="flex flex-col gap-4">
            <h2
              className="font-semibold leading-[1.3]"
              style={{ fontFamily: sora, fontSize: "32px", color: "#222c44" }}
            >
              Practice Interface
            </h2>
            <p style={{ fontFamily: inter, fontSize: "20px", color: "#808080", lineHeight: "1.3" }}>
              Our interface mirrors the real Kira platform for authentic practice
            </p>
          </div>
        </div>

        {/* Interface card */}
        <div
          className="rounded-[20px] overflow-hidden bg-white"
          style={{ border: "1px solid #eee", boxShadow: "0px 10px 16px 0px rgba(0,0,0,0.08)" }}
        >
          {/* Card header bar */}
          <div className="flex items-center justify-between px-6 h-18.25">
            <span className="font-semibold" style={{ fontFamily: sora, fontSize: "20px", color: "#222c44" }}>
              Kira Video Essay
            </span>
            <span style={{ fontFamily: inter, fontSize: "20px", color: "#808080" }}>
              Question 2 of 5
            </span>
          </div>

          {/* Divider — full width at 1px */}
          <div style={{ height: "1px", background: "#eee" }} />

          {/* Two-column body */}
          <div className="flex flex-col lg:flex-row gap-0 p-5.75">

            {/* Left — video panel */}
            <div
              className="relative rounded-[12px] overflow-hidden shrink-0 w-full lg:w-150.5"
              style={{ height: "355px" }}
            >
              {/* Layered video images (matched exactly from Figma composite) */}
              <img
                src={imgVideoBg}
                alt="Practice video"
                className="absolute left-0 w-full max-w-none"
                style={{ top: "-14.07%", height: "115.48%" }}
              />
              <img
                src={imgVideoFg}
                alt=""
                className="absolute left-0 w-full max-w-none pointer-events-none"
                style={{ top: "-9.8%", height: "113.02%" }}
              />

              {/* Timer badge — top-right corner of video */}
              <div
                className="absolute top-4 right-4 flex items-center gap-3.125 bg-white rounded-[25px] px-3.75 py-2.5"
              >
                {/* Timer icon */}
                <div className="relative shrink-0 overflow-hidden" style={{ width: "20px", height: "20px" }}>
                  <div
                    className="absolute"
                    style={{
                      top: "calc(50% - 0.17px)",
                      left: "17.5%",
                      right: "15.83%",
                      height: "16.667px",
                      transform: "translateY(-50%)",
                    }}
                  >
                    <div className="absolute" style={{ inset: "-6% -7.5%" }}>
                      <img src={imgTimerMask} alt="" className="block w-full h-full" />
                    </div>
                  </div>
                </div>
                <span className="font-medium" style={{ fontFamily: inter, fontSize: "16px", color: "#423dea" }}>
                  0:50
                </span>
              </div>
            </div>

            {/* Right — question + controls */}
            <div
              className="flex flex-col flex-1 pt-6 lg:pt-0 lg:pl-6 justify-between"
              style={{ minHeight: "355px" }}
            >
              {/* Top: question block */}
              <div className="flex flex-col gap-2.75">
                <p style={{ fontFamily: inter, fontSize: "16px", color: "#000000", lineHeight: "1.3" }}>
                  Your Question
                </p>
                <div
                  className="rounded-[12px] px-4 py-6"
                  style={{ background: "#f9f9f9" }}
                >
                  <p style={{ fontFamily: inter, fontSize: "20px", color: "#808080", lineHeight: "1.5" }}>
                    &ldquo;Tell us about a time you demonstrated leadership in a challenging situation.&rdquo;
                  </p>
                </div>
              </div>

              {/* Bottom: timer + CTA */}
              <div className="flex items-center justify-between gap-4 mt-6 lg:mt-0 flex-wrap">
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center shrink-0 rounded-[20px]"
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "rgba(255,30,34,0.1)",
                      border: "1px solid #ff1e22",
                    }}
                  >
                    <span style={{ fontFamily: inter, fontSize: "16px", color: "#ff1e22" }}>60</span>
                  </div>
                  <span style={{ fontFamily: inter, fontSize: "16px", color: "#808080" }}>
                    seconds remaining
                  </span>
                </div>

                <LandingButton
                  variant="primary"
                  className="rounded-[10px] px-5 py-2.5 text-sm shrink-0 w-full sm:w-81"
                >
                  Start Recording
                </LandingButton>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
