"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { HeroBanner } from "@/components/landing/hero-banner";
import { CANONICAL_SCHOOLS } from "@/data/schools";

// Hero assets
const imgHeroBadge   = "/figma-assets/badge-icon-top-programs.png";
// Section badge + search
const imgSectionBadge = "/figma-assets/a18a8865-87af-48ae-8f5e-b6f042329d95.png";
const imgSearchIcon   = "https://www.figma.com/api/mcp/asset/ff6fd384-cbc2-4aac-85c5-171071de6c47";

const sora  = "var(--font-sora), sans-serif";
const inter = "var(--font-inter), sans-serif";

const schools = CANONICAL_SCHOOLS;

function SchoolCard({
  name,
  logo,
  selected = false,
}: {
  name: string;
  logo: string;
  selected?: boolean;
}) {
  const pillBg = selected ? "#eeeefc" : "#f9f9f9";
  const pillColor = selected ? "#5450d8" : "#272727";

  return (
    <div
      className={`group relative flex flex-col rounded-[20px] bg-white transition-shadow duration-300 ease-in-out ${
        selected
          ? "shadow-[0px_10px_16px_0px_rgba(0,0,0,0.08)]"
          : "hover:shadow-[0px_10px_16px_0px_rgba(0,0,0,0.08)]"
      }`}
      style={{ width: "314px", height: "279px", border: "1px solid #e6e6e6" }}
    >
      <div className="flex flex-col gap-6 p-6">
        {/* Logo + Name */}
        <div className="flex flex-col gap-4">
          <div
            className="flex items-center justify-center rounded-[36px] shrink-0"
            style={{ width: "72px", height: "72px", border: "1px solid #e6e6e6", padding: "5px" }}
          >
            <img
              src={logo}
              alt={name}
              className="rounded-full object-cover"
              style={{ width: "62px", height: "62px" }}
            />
          </div>
          <h3
            className="font-semibold leading-[1.3]"
            style={{ fontFamily: sora, fontSize: "18px", color: "#272727" }}
          >
            {name}
          </h3>
        </div>

        {/* Mode pills */}
        <div className="flex items-start gap-3">
          <span
            className="inline-flex items-center justify-center rounded-[20px]"
            style={{ background: pillBg, color: pillColor, fontFamily: inter, fontSize: "16px", padding: "8px 16px" }}
          >
            In-person
          </span>
          <span
            className="inline-flex items-center justify-center rounded-[20px]"
            style={{ background: pillBg, color: pillColor, fontFamily: inter, fontSize: "16px", padding: "8px 16px" }}
          >
            Video
          </span>
        </div>
      </div>

      {/* Arrow button — selected card uses solid purple bg, others flip to purple on hover. */}
      <div
        className={`absolute bottom-2.5 right-2.5 flex items-center justify-center rounded-[20px] w-10 h-10 transition-colors duration-300 ease-in-out ${
          selected ? "bg-[#5450d8]" : "bg-white group-hover:bg-[#5450d8]"
        }`}
      >
        <ArrowUpRight
          className={`w-4 h-4 transition-colors duration-300 ease-in-out ${
            selected ? "text-white" : "text-[#222c44] group-hover:text-white"
          }`}
          strokeWidth={2.4}
        />
      </div>
    </div>
  );
}

export default function SchoolsPage() {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? schools.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    : schools;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <HeroBanner
          badge={{ icon: imgHeroBadge, text: "25+ Top Programs", iconWidth: 29, iconHeight: 26.574 }}
          title="Prep for Your Target Business School"
          subtitle="Each school has its unique interview style. Practice with questions tailored to your target programs."
        />

        {/* ── Schools grid ─────────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="max-w-360 mx-auto px-4 md:px-8 xl:px-15">

            {/* Header */}
            <div className="flex flex-col gap-6 mb-15">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2.5 rounded-full px-4 py-2 w-fit"
                style={{ background: "rgba(84,80,216,0.1)" }}
              >
                <img src={imgSectionBadge} alt="" className="w-7.25 h-6.75 object-contain" />
                <span style={{ fontFamily: inter, fontSize: "16px", color: "#5450d8" }}>
                  School Interview
                </span>
              </div>

              {/* Heading + description */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2
                  className="font-semibold leading-[1.3]"
                  style={{ fontFamily: sora, fontSize: "32px", color: "#222c44", maxWidth: "367px" }}
                >
                  School-Specific Interview Preparation
                </h2>
                <p
                  className="leading-[1.3]"
                  style={{ fontFamily: inter, fontSize: "20px", color: "#808080", maxWidth: "391px" }}
                >
                  Practice with questions tailored to each top business school&apos;s unique interview format
                </p>
              </div>
            </div>

            {/* Search */}
            <div
              className="mb-15 inline-block rounded-[16px]"
              style={{ border: "1.3px solid #f0f0f0", padding: "15.5px", background: "white" }}
            >
              <div
                className="flex items-center gap-3 rounded-[13px] px-4"
                style={{ background: "#f9f9f9", height: "60px", width: "clamp(280px, 40vw, 520px)" }}
              >
                <img src={imgSearchIcon} alt="" className="w-3.5 h-3.5 shrink-0 object-contain" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className="flex-1 bg-transparent outline-none placeholder:text-[#8f9bba]"
                  style={{ fontFamily: inter, fontSize: "15.5px", color: "#272727" }}
                />
              </div>
            </div>

            {/* Grid — flex-wrap with 314px fixed-width cards matches Figma node 808:2211 */}
            <div className="flex flex-wrap items-start gap-5">
              {filtered.map((school, i) => (
                <SchoolCard
                  key={school.name}
                  name={school.name}
                  logo={school.logo}
                  selected={i === 0 && !query.trim()}
                />
              ))}
              {filtered.length === 0 && (
                <p className="w-full text-center py-20" style={{ fontFamily: inter, fontSize: "18px", color: "#868686" }}>
                  No schools match &ldquo;{query}&rdquo;
                </p>
              )}
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
