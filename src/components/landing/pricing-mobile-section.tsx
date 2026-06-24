import { SectionBadge } from "@/components/shared/section-badge";
import { AppStoreButtons } from "@/components/shared/app-store-buttons";

const imgBadgePhone = "/figma-assets/924d1bfe-2514-43e8-ad04-bff277804e71.png";
const imgIPhone = "/figma-assets/dd149726-30f4-45c5-95bd-c28df27a49fe.png";

const sora = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

export function PricingMobileSection() {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-360 mx-auto px-4 md:px-8 xl:px-15">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-12">

          {/* ── Left: badge + text + store buttons ── */}
          <div className="flex flex-col gap-15 xl:w-116 shrink-0">
            <div className="flex flex-col gap-6">
              <SectionBadge
                icon={
                  <img
                    src={imgBadgePhone}
                    alt=""
                    className="object-contain"
                    style={{ width: "18px", height: "29px" }}
                  />
                }
              >
                Mobile App Available
              </SectionBadge>

              <div className="flex flex-col gap-4">
                <h2
                  className="font-semibold leading-[1.3]"
                  style={{ fontFamily: sora, fontSize: "32px", color: "#272727", maxWidth: "367px" }}
                >
                  Practice Anytime, Anywhere
                </h2>
                <p
                  style={{
                    fontFamily: inter,
                    fontSize: "20px",
                    color: "#868686",
                    lineHeight: "1.3",
                    maxWidth: "459px",
                  }}
                >
                  Take your MBA interview preparation with you. Practice mock
                  interviews, record Kira-style video responses, and receive AI
                  feedback—all from your mobile device.
                </p>
              </div>
            </div>

            <AppStoreButtons />
          </div>

          {/* ── Right: iPhone on lavender card ── */}
          <div
            className="relative shrink-0 w-full lg:w-176.5"
            style={{ height: "516px" }}
          >
            {/* Lavender card anchored to bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 rounded-[21px]"
              style={{ background: "#edecfd", height: "378px" }}
            />

            {/* Phone: centred over the card, extends above it */}
            <div
              className="absolute flex items-center justify-center"
              style={{ width: "582.713px", height: "516.328px", left: "50%", transform: "translateX(-50%)", top: 0 }}
            >
              {/* rotate-180 + scaleY(-1) = tilted perspective effect matching Figma */}
              <div className="flex-none" style={{ transform: "rotate(180deg) scaleY(-1)" }}>
                <div className="relative" style={{ width: "582.713px", height: "516.328px" }}>
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img
                      src={imgIPhone}
                      alt="MBA Prep Mobile App"
                      className="absolute max-w-none"
                      style={{
                        height: "188%",
                        width: "222.02%",
                        top: "-19.55%",
                        left: "-54.39%",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
