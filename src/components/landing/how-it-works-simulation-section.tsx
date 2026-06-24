import type { ReactNode } from "react";
import { SectionBadge } from "@/components/shared/section-badge";

const imgBadge = "/figma-assets/6a8da5ca-93fc-4eda-b066-e07b0b43586b.png";
const imgUnion = "/figma-assets/how-it-works/union.png";

const sora  = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

const ICON_FILL = "#5450D8";

// Inline SVG icons — copied directly from Figma (tabler:message-filled,
// iconamoon:clock-fill, mingcute:mic-fill). Inlining avoids any external
// image-loading flakiness and lets React style them cleanly.
function MessageIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15.0003 2.5C15.8844 2.5 16.7322 2.85119 17.3573 3.47631C17.9825 4.10143 18.3337 4.94928 18.3337 5.83333V12.5C18.3337 13.3841 17.9825 14.2319 17.3573 14.857C16.7322 15.4821 15.8844 15.8333 15.0003 15.8333H11.0637L7.09533 18.2142C6.97582 18.2859 6.84023 18.3265 6.70097 18.3322C6.56171 18.338 6.42323 18.3088 6.29821 18.2472C6.17318 18.1856 6.0656 18.0936 5.98532 17.9796C5.90504 17.8657 5.85461 17.7335 5.83866 17.595L5.83366 17.5V15.8333H5.00033C4.14512 15.8333 3.32264 15.5046 2.70298 14.9152C2.08333 14.3258 1.71392 13.5208 1.67116 12.6667L1.66699 12.5V5.83333C1.66699 4.94928 2.01818 4.10143 2.6433 3.47631C3.26842 2.85119 4.11627 2.5 5.00033 2.5H15.0003ZM11.667 10H6.66699C6.44598 10 6.23402 10.0878 6.07774 10.2441C5.92146 10.4004 5.83366 10.6123 5.83366 10.8333C5.83366 11.0543 5.92146 11.2663 6.07774 11.4226C6.23402 11.5789 6.44598 11.6667 6.66699 11.6667H11.667C11.888 11.6667 12.1 11.5789 12.2562 11.4226C12.4125 11.2663 12.5003 11.0543 12.5003 10.8333C12.5003 10.6123 12.4125 10.4004 12.2562 10.2441C12.1 10.0878 11.888 10 11.667 10ZM13.3337 6.66667H6.66699C6.44598 6.66667 6.23402 6.75446 6.07774 6.91074C5.92146 7.06703 5.83366 7.27899 5.83366 7.5C5.83366 7.72101 5.92146 7.93298 6.07774 8.08926C6.23402 8.24554 6.44598 8.33333 6.66699 8.33333H13.3337C13.5547 8.33333 13.7666 8.24554 13.9229 8.08926C14.0792 7.93298 14.167 7.72101 14.167 7.5C14.167 7.27899 14.0792 7.06703 13.9229 6.91074C13.7666 6.75446 13.5547 6.66667 13.3337 6.66667Z"
        fill={ICON_FILL}
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.66699 9.99999C1.66699 5.39749 5.39783 1.66666 10.0003 1.66666C14.6028 1.66666 18.3337 5.39749 18.3337 9.99999C18.3337 14.6025 14.6028 18.3333 10.0003 18.3333C5.39783 18.3333 1.66699 14.6025 1.66699 9.99999ZM10.0003 6.66666C10.0003 6.44565 9.91252 6.23368 9.75624 6.0774C9.59996 5.92112 9.388 5.83333 9.16699 5.83333C8.94598 5.83333 8.73402 5.92112 8.57774 6.0774C8.42146 6.23368 8.33366 6.44565 8.33366 6.66666V9.99999C8.33368 10.221 8.42148 10.4329 8.57774 10.5892L11.0777 13.0892C11.2349 13.241 11.4455 13.325 11.6641 13.3231C11.8826 13.3212 12.0917 13.2336 12.2463 13.079C12.4008 12.9245 12.4884 12.7154 12.4903 12.4968C12.4922 12.2783 12.4083 12.0677 12.2565 11.9105L10.0003 9.65416V6.66666Z"
        fill={ICON_FILL}
      />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 1.66666C8.61929 1.66666 7.5 2.78595 7.5 4.16666V9.16666C7.5 10.5474 8.61929 11.6667 10 11.6667C11.3807 11.6667 12.5 10.5474 12.5 9.16666V4.16666C12.5 2.78595 11.3807 1.66666 10 1.66666Z"
        fill={ICON_FILL}
      />
      <path
        d="M5 9.16666C5 8.94565 4.91222 8.73369 4.75594 8.57741C4.59966 8.42113 4.3877 8.33333 4.16669 8.33333C3.94568 8.33333 3.73371 8.42113 3.57743 8.57741C3.42115 8.73369 3.33335 8.94565 3.33335 9.16666C3.33335 12.6342 5.99169 15.4842 9.16669 15.7917V17.5C9.16669 17.721 9.25448 17.933 9.41076 18.0893C9.56704 18.2455 9.77901 18.3333 10 18.3333C10.221 18.3333 10.433 18.2455 10.5893 18.0893C10.7456 17.933 10.8334 17.721 10.8334 17.5V15.7917C14.0084 15.4842 16.6667 12.6342 16.6667 9.16666C16.6667 8.94565 16.5789 8.73369 16.4226 8.57741C16.2664 8.42113 16.0544 8.33333 15.8334 8.33333C15.6124 8.33333 15.4004 8.42113 15.2441 8.57741C15.0878 8.73369 15 8.94565 15 9.16666C15 11.929 12.7625 14.1667 10 14.1667C7.23752 14.1667 5 11.929 5 9.16666Z"
        fill={ICON_FILL}
      />
    </svg>
  );
}

function IconBox({ icon }: { icon: ReactNode }) {
  return (
    <div
      className="flex items-center justify-center rounded-[25px] shrink-0"
      style={{ width: "50px", height: "50px", background: "#e2e0ff", padding: "15px" }}
    >
      {icon}
    </div>
  );
}

export function HowItWorksSimulationSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-360 mx-auto px-4 md:px-8 xl:px-15">

        {/* Heading */}
        <div className="flex flex-col items-center gap-6 mb-15 text-center">
          <SectionBadge
            icon={
              <img
                src={imgBadge}
                alt=""
                className="object-contain"
                style={{ width: "28px", height: "27px" }}
              />
            }
          >
            Realistic Practice
          </SectionBadge>

          <div className="flex flex-col gap-4">
            <h2
              className="font-semibold whitespace-nowrap"
              style={{ fontFamily: sora, fontSize: "32px", color: "#272727", lineHeight: "1.3" }}
            >
              Interview Simulation Details
            </h2>
            <p
              style={{ fontFamily: inter, fontSize: "20px", color: "#868686", lineHeight: "1.3" }}
            >
              Build foundational skills that lead to interview success.
            </p>
          </div>
        </div>

        {/* Cards row */}
        <div className="flex flex-col xl:flex-row gap-5 items-stretch">

          {/* Card 1 — Question Format (315×299) */}
          <div
            className="relative rounded-[30px] overflow-hidden shrink-0"
            style={{ background: "#edecfd", height: "299px", width: "315px", minWidth: "0", flex: "0 0 315px" }}
          >
            <div className="absolute flex flex-col gap-6 left-5 top-7">
              <IconBox icon={<MessageIcon />} />
              <h3
                className="font-semibold"
                style={{ fontFamily: sora, fontSize: "26px", color: "#272727", lineHeight: "1.3", width: "168px" }}
              >
                Question Format
              </h3>
            </div>
            <p
              className="absolute"
              style={{
                fontFamily: inter,
                fontSize: "16px",
                color: "#868686",
                lineHeight: "1.3",
                left: "20px",
                top: "224px",
                width: "266px",
              }}
            >
              Practice the most common MBA interview questions and build confidence in structuring your response.
            </p>
          </div>

          {/* Card 2 — Timed Responses (315×299) */}
          <div
            className="relative rounded-[30px] overflow-hidden shrink-0"
            style={{ background: "#edecfd", height: "299px", width: "315px", minWidth: "0", flex: "0 0 315px" }}
          >
            <div className="absolute flex flex-col gap-6 left-5 top-7">
              <IconBox icon={<ClockIcon />} />
              <h3
                className="font-semibold"
                style={{ fontFamily: sora, fontSize: "26px", color: "#272727", lineHeight: "1.3", width: "188px" }}
              >
                Timed Responses
              </h3>
            </div>
            <p
              className="absolute"
              style={{
                fontFamily: inter,
                fontSize: "16px",
                color: "#868686",
                lineHeight: "1.3",
                left: "20px",
                top: "224px",
                width: "266px",
              }}
            >
              Practice under realistic time constraints. Most responses are 60–90 seconds to simulate real conditions.
            </p>
          </div>

          {/* Card 3 — Multiple Response Modes (649×299) */}
          <div
            className="relative rounded-[30px] shrink-0"
            style={{ background: "#f9f9f9", height: "299px", width: "649px", minWidth: "0", flex: "1 1 649px" }}
          >
            <div className="absolute flex flex-col gap-6 left-5 top-7">
              <IconBox icon={<MicIcon />} />
              <h3
                className="font-semibold"
                style={{ fontFamily: sora, fontSize: "26px", color: "#272727", lineHeight: "1.3", width: "239px" }}
              >
                Multiple Response Modes
              </h3>
            </div>
            <p
              className="absolute"
              style={{
                fontFamily: inter,
                fontSize: "16px",
                color: "#868686",
                lineHeight: "1.3",
                left: "20px",
                top: "224.5px",
                width: "266px",
              }}
            >
              Choose between video recording, audio-only, or text responses based on your comfort level.
            </p>
            {/* Decorative Union shape */}
            <img
              src={imgUnion}
              alt=""
              aria-hidden="true"
              className="absolute pointer-events-none select-none"
              style={{ width: "198px", height: "259px", right: "0", top: "20px" }}
            />
          </div>

        </div>
      </div>
    </section>
  );
}
