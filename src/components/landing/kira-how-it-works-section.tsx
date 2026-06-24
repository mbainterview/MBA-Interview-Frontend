import type { ReactNode } from "react";
import { Eye, Timer, Video } from "lucide-react";
import { SectionBadge } from "@/components/shared/section-badge";

const imgBadgeDefault = "/figma-assets/1fda6518-3013-440c-9d42-d419e2dc38d6.png";
const imgUnionDefault = "/figma-assets/how-it-works/union.png";

const sora  = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

const ICON_FILL = "#5450D8";

export interface SimCard {
  bg: string;
  /** Either an image URL (string) or a ReactNode (e.g. an inline SVG / lucide icon). */
  icon: string | ReactNode;
  title: string;
  desc: string;
  wide?: boolean;
  /** Optional decorative image for wide cards — positioned top-right */
  union?: string;
  /** Max title width (px). Defaults: 168 for narrow, 239 for wide */
  titleWidth?: number;
}

interface Props {
  badgeIcon?: string;
  badgeText?: string;
  heading?: string;
  subtitle?: string;
  cards?: SimCard[];
}

const DEFAULT_CARDS: SimCard[] = [
  {
    bg: "#edecfd",
    icon: <Eye className="w-5 h-5" fill={ICON_FILL} stroke="#ffffff" strokeWidth={1.6} />,
    title: "Watch the Prompt",
    desc: "A video or written prompt appears on screen. You have limited time to prepare your thoughts.",
  },
  {
    bg: "#edecfd",
    icon: <Timer className="w-5 h-5" fill={ICON_FILL} stroke="#ffffff" strokeWidth={1.6} />,
    title: "60-Second Timer",
    desc: "The countdown begins. Record your response within the time limit, just like the real assessment.",
  },
  {
    bg: "#F9F9F9",
    icon: <Video className="w-5 h-5" fill={ICON_FILL} stroke={ICON_FILL} strokeWidth={1.5} />,
    title: "Record Response",
    desc: "Speak clearly into your camera. Our platform captures your video just like Kira Talent does.",
    wide: true,
    union: imgUnionDefault,
  },
];

export function KiraHowItWorksSection({
  badgeIcon = imgBadgeDefault,
  badgeText = "Realistic Practice",
  heading = "How Kira Practice Works",
  subtitle = "Experience the exact flow of a real Kira assessment",
  cards = DEFAULT_CARDS,
}: Props) {
  return (
    <section className="py-20">
      <div className="max-w-360 mx-auto px-4 md:px-8 xl:px-15">

        {/* Header */}
        <div className="flex flex-col items-center gap-6 mb-15 text-center">
          <SectionBadge icon={<img src={badgeIcon} alt="" className="w-7 h-6.75 object-contain" />}>
            {badgeText}
          </SectionBadge>
          <div className="flex flex-col gap-4">
            <h2
              className="font-semibold leading-[1.3]"
              style={{ fontFamily: sora, fontSize: "32px", color: "#222c44" }}
            >
              {heading}
            </h2>
            <p style={{ fontFamily: inter, fontSize: "20px", color: "#808080", lineHeight: "1.3" }}>
              {subtitle}
            </p>
          </div>
        </div>

        {/* Cards row */}
        <div className="flex flex-col lg:flex-row gap-5 items-stretch">
          {cards.map((card) => {
            const titleWidth = card.titleWidth ?? (card.wide ? 239 : 168);
            return (
              <div
                key={card.title}
                className={`relative rounded-[30px] ${card.wide ? "lg:flex-1" : "overflow-hidden lg:w-78.75 shrink-0"}`}
                style={{ background: card.bg, height: "299px" }}
              >
                {/* Icon box + title — absolute, top-left */}
                <div
                  className="absolute flex flex-col gap-6 items-start"
                  style={{ left: "20px", top: "28px" }}
                >
                  <div
                    className="flex items-center justify-center rounded-[25px] shrink-0"
                    style={{ width: "50px", height: "50px", background: "#e2e0ff", padding: "15px" }}
                  >
                    {typeof card.icon === "string" ? (
                      <img src={card.icon} alt="" className="w-5 h-5 object-contain" />
                    ) : (
                      card.icon
                    )}
                  </div>
                  <h3
                    className="font-semibold leading-[1.3]"
                    style={{ fontFamily: sora, fontSize: "26px", color: "#222c44", width: `${titleWidth}px` }}
                  >
                    {card.title}
                  </h3>
                </div>

                {/* Description — vertically centred at top: 224px */}
                <p
                  className="-translate-y-1/2 absolute"
                  style={{
                    fontFamily: inter,
                    fontSize: "16px",
                    color: "#808080",
                    lineHeight: "1.3",
                    left: "20px",
                    top: "224px",
                    width: "266px",
                  }}
                >
                  {card.desc}
                </p>

                {/* Union / decorative image — top-right, Figma: left 418px top 20px */}
                {card.union && (
                  <img
                    src={card.union}
                    alt=""
                    aria-hidden="true"
                    className="absolute pointer-events-none select-none"
                    style={{ left: "418px", top: "20px", width: "198px", height: "259px" }}
                  />
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
