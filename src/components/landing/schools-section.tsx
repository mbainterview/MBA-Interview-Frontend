import { SectionBadge } from "@/components/shared/section-badge";
import { LandingButton } from "@/components/shared/landing-button";
import { ArrowUpRight } from "lucide-react";
import { CANONICAL_SCHOOLS } from "@/data/schools";

// Section badge
const imgBadge = "/figma-assets/627c3a9c-59b6-40df-91ae-1c1d1145b198.png";

const sora  = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

const schools = CANONICAL_SCHOOLS;

export function SchoolsSection() {
  return (
    <section id="schools" className="py-20 bg-white">
      <div className="max-w-360 mx-auto px-4 md:px-8 xl:px-15">

        {/* Header */}
        <div className="flex flex-col gap-6 mb-15">
          <SectionBadge icon={<img src={imgBadge} alt="" className="w-7.25 h-6.75 object-contain" />}>
            School Interview
          </SectionBadge>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2
              className="font-bold leading-[1.3]"
              style={{ fontFamily: sora, fontSize: "40px", color: "#070707", maxWidth: "367px" }}
            >
              School-Specific Interview Preparation
            </h2>
            <p
              className="leading-[1.2]"
              style={{ fontFamily: inter, fontSize: "18px", color: "#808080", maxWidth: "391px" }}
            >
              Practice with questions tailored to each top business school&apos;s interview format
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-12.5">
          {schools.map((school) => (
            <div
              key={school.name}
              className="group relative flex flex-col gap-6 rounded-[20px] bg-white p-6 h-69.75 transition-shadow duration-300 ease-in-out hover:shadow-[0px_10px_16px_0px_rgba(0,0,0,0.08)]"
              style={{ border: "1px solid #e6e6e6" }}
            >
              {/* Logo + Name */}
              <div className="flex flex-col gap-4">
                <div
                  className="flex items-center justify-center rounded-[36px] shrink-0 w-18 h-18 p-1.25"
                  style={{ border: "1px solid #e6e6e6" }}
                >
                  <img
                    src={school.logo}
                    alt={school.name}
                    className="w-15.5 h-15.5 object-contain rounded-full"
                  />
                </div>
                <h3
                  className="font-semibold leading-[1.3]"
                  style={{ fontFamily: sora, fontSize: "18px", color: "#272727" }}
                >
                  {school.name}
                </h3>
              </div>

              {/* Arrow button — icon flips from dark to white on hover so it stays visible against the purple fill. */}
              <div className="absolute bottom-4 right-4 flex items-center justify-center rounded-[20px] w-10 h-10 bg-white group-hover:bg-[#5450d8] transition-colors duration-300 ease-in-out">
                <ArrowUpRight
                  className="w-4 h-4 text-[#222c44] group-hover:text-white transition-colors duration-300 ease-in-out"
                  strokeWidth={2.4}
                />
              </div>
            </div>
          ))}
        </div>

        {/* View All */}
        <div className="flex justify-center">
          <LandingButton
            href="/schools"
            variant="muted"
            className="rounded-[16px] px-8 py-4.5 text-xl"
          >
            View all Schools
          </LandingButton>
        </div>

      </div>
    </section>
  );
}
