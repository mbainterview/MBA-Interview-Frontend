"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

// Map a school (by name or abbreviation) to a logo file in /public/school-logos.
// All 29 entries match the Figma canonical list (node 808:2211). Order matters
// — INSEAD must come before McDonough (Georgetown) so "INSEAD McDonough" resolves
// to INSEAD's logo, not McDonough's.
const LOGO_MATCHERS: Array<{ test: RegExp; file: string }> = [
  { test: /\bharvard\b/i,             file: "figma-school-harvard.png" },
  { test: /\bstanford\b/i,            file: "figma-school-stanford.png" },
  { test: /\bkellogg\b/i,             file: "figma-school-kellogg.png" },
  { test: /\bbooth\b/i,               file: "figma-school-booth.png" },
  { test: /\b(mit|sloan)\b/i,         file: "figma-school-mit-sloan.png" },
  { test: /\bwharton\b/i,             file: "figma-school-wharton.png" },
  { test: /\bcolumbia\b/i,            file: "figma-school-columbia.png" },
  { test: /\btuck\b/i,                file: "figma-school-tuck.png" },
  { test: /\b(stern|nyu)\b/i,         file: "figma-school-nyu-stern.png" },
  { test: /\bjohnson\b/i,             file: "figma-school-johnson.png" },
  { test: /\bfuqua\b/i,               file: "figma-school-fuqua.png" },
  { test: /\bdarden\b/i,              file: "figma-school-darden.png" },
  { test: /\b(ucla|anderson)\b/i,     file: "figma-school-ucla-anderson.png" },
  { test: /\bhaas\b/i,                file: "figma-school-haas.png" },
  { test: /\bmccombs\b/i,             file: "figma-school-mccombs.png" },
  { test: /\bowen\b/i,                file: "figma-school-owen.png" },
  { test: /\binsead\b/i,              file: "figma-school-insead-mcdonough.png" },
  { test: /\bmcdonough\b/i,           file: "figma-school-mcdonough.png" },
  { test: /\btepper\b/i,              file: "figma-school-tepper.png" },
  { test: /\bross\b/i,                file: "figma-school-ross.png" },
  { test: /\byale\b/i,                file: "figma-school-yale.png" },
  { test: /\bkenan[-\s]?flagler\b/i,  file: "figma-school-kenan-flagler.png" },
  { test: /\bgoizueta\b/i,            file: "figma-school-goizueta.png" },
  { test: /\bmarshall\b/i,            file: "figma-school-marshall.png" },
  { test: /\bolin\b/i,                file: "figma-school-olin.png" },
  { test: /\b(rice|jones)\b/i,        file: "figma-school-rice-jones.png" },
  { test: /\blondon\b/i,              file: "figma-school-london.png" },
  { test: /\biese\b/i,                file: "figma-school-iese.png" },
  { test: /\besade\b/i,               file: "figma-school-esade.png" },
];

export function logoFor(school: {
  name: string;
  abbreviation?: string;
}): string | null {
  const haystack = `${school.name} ${school.abbreviation ?? ""}`;
  for (const { test, file } of LOGO_MATCHERS) {
    if (test.test(haystack)) return `/school-logos/${file}`;
  }
  return null;
}

function initialsFor(name: string, abbreviation?: string): string {
  if (abbreviation) return abbreviation.slice(0, 4).toUpperCase();
  return name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

interface SchoolLogoProps {
  school: { id?: string; name: string; abbreviation?: string };
  size?: number;
  className?: string;
  rounded?: boolean;
}

export function SchoolLogo({
  school,
  size = 40,
  className,
  rounded = true,
}: SchoolLogoProps) {
  const src = logoFor(school);
  if (src) {
    return (
      <Image
        src={src}
        alt={`${school.name} logo`}
        width={size}
        height={size}
        className={cn(
          "shrink-0 object-cover",
          rounded && "rounded-full",
          className,
        )}
      />
    );
  }
  // Fallback for schools without a mapped logo.
  const label = initialsFor(school.name, school.abbreviation);
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center bg-[#9ea1c5] text-[10px] font-semibold leading-none text-white",
        rounded && "rounded-full",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {label}
    </span>
  );
}
