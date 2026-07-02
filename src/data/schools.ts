/**
 * Canonical school list. Order, names, and logos match the Figma "/schools"
 * design (node 808:2211): 28 programs, starting with the M7-style featured
 * set and ending with international programs.
 *
 * Logos are exported from Figma into `/public/school-logos/figma-school-*.png`.
 * The ESADE entry uses a pre-composed orange disc with its navy wordmark; the
 * `bgColor` field documents the source recipe but is not currently used by the
 * card component since the composite PNG already bakes the background in.
 */

export interface CanonicalSchool {
  /** Display name as it appears in the design. */
  name: string;
  /** Short label / abbreviation — used to match against backend `School.abbreviation`. */
  abbreviation: string;
  /** Path under /public for the round school logo. */
  logo: string;
  /** Source background colour used to compose the logo (informational only). */
  bgColor?: string;
}

export const CANONICAL_SCHOOLS: CanonicalSchool[] = [
  { name: "Harvard Business School",                  abbreviation: "HBS",           logo: "/school-logos/figma-school-harvard.png" },
  { name: "Stanford Graduate School of Business",     abbreviation: "GSB",           logo: "/school-logos/figma-school-stanford.png" },
  { name: "Kellogg School of Management",             abbreviation: "KELLOGG",       logo: "/school-logos/figma-school-kellogg.png" },
  { name: "Chicago Booth School of Business",         abbreviation: "BOOTH",         logo: "/school-logos/figma-school-booth.png" },
  { name: "MIT Sloan School of Management",           abbreviation: "MIT",           logo: "/school-logos/figma-school-mit-sloan.png" },
  { name: "The Wharton School",                       abbreviation: "WHARTON",       logo: "/school-logos/figma-school-wharton.png" },
  { name: "Columbia Business School",                 abbreviation: "CBS",           logo: "/school-logos/figma-school-columbia.png" },
  { name: "Tuck School of Business",                  abbreviation: "TUCK",          logo: "/school-logos/figma-school-tuck.png" },
  { name: "NYU Stern School of Business",             abbreviation: "STERN",         logo: "/school-logos/figma-school-nyu-stern.png" },
  { name: "Johnson Graduate School of Management",    abbreviation: "JOHNSON",       logo: "/school-logos/figma-school-johnson.png" },
  { name: "Fuqua School of Business",                 abbreviation: "FUQUA",         logo: "/school-logos/figma-school-fuqua.png" },
  { name: "Darden School of Business",                abbreviation: "DARDEN",        logo: "/school-logos/figma-school-darden.png" },
  { name: "UCLA Anderson School of Management",       abbreviation: "Anderson",      logo: "/school-logos/figma-school-ucla-anderson.png" },
  { name: "Haas School of Business",                  abbreviation: "Haas",          logo: "/school-logos/figma-school-haas.png" },
  { name: "McCombs School of Business",               abbreviation: "McCombs",       logo: "/school-logos/figma-school-mccombs.png" },
  { name: "Owen Graduate School of Management",       abbreviation: "Owen",          logo: "/school-logos/figma-school-owen.png" },
  { name: "McDonough School of Business",             abbreviation: "McDonough",     logo: "/school-logos/figma-school-mcdonough.png" },
  { name: "Tepper School of Business",                abbreviation: "Tepper",        logo: "/school-logos/figma-school-tepper.png" },
  { name: "Ross School of Business",                  abbreviation: "Ross",          logo: "/school-logos/figma-school-ross.png" },
  { name: "Yale School of Management",                abbreviation: "Yale SOM",      logo: "/school-logos/figma-school-yale.png" },
  { name: "Kenan-Flagler Business School",            abbreviation: "Kenan-Flagler", logo: "/school-logos/figma-school-kenan-flagler.png" },
  { name: "Goizueta Business School",                 abbreviation: "Goizueta",      logo: "/school-logos/figma-school-goizueta.png" },
  { name: "Marshall School of Business",              abbreviation: "Marshall",      logo: "/school-logos/figma-school-marshall.png" },
  { name: "Rice Jones Graduate School of Business",   abbreviation: "Rice",          logo: "/school-logos/figma-school-rice-jones.png" },
  { name: "London Business School",                   abbreviation: "LBS",           logo: "/school-logos/figma-school-london.png" },
  { name: "IESE Business School",                     abbreviation: "IESE",          logo: "/school-logos/figma-school-iese.png" },
  { name: "INSEAD",                                   abbreviation: "INSEAD",        logo: "/school-logos/figma-school-insead-mcdonough.png" },
  { name: "ESADE Business School",                    abbreviation: "ESADE",         logo: "/school-logos/figma-school-esade.png", bgColor: "#fc5a33" },
];

/**
 * Maps any abbreviation we might see — including legacy mixed-case versions
 * and informal nicknames — to the canonical abbreviation used as the key
 * inside `CANONICAL_SCHOOLS`. Compared case-insensitively after trim.
 */
const ABBREV_ALIASES: Record<string, string> = {
  // Featured 6
  HBS: "HBS",
  HARVARD: "HBS",
  GSB: "GSB",
  STANFORD: "GSB",
  KELLOGG: "KELLOGG",
  NORTHWESTERN: "KELLOGG",
  KSM: "KELLOGG",
  BOOTH: "BOOTH",
  CHICAGO: "BOOTH",
  BSB: "BOOTH",
  MIT: "MIT",
  SLOAN: "MIT",
  WHARTON: "WHARTON",
  UPENN: "WHARTON",
  PENN: "WHARTON",
  // Long-tail
  CBS: "CBS",
  COLUMBIA: "CBS",
  TUCK: "TUCK",
  DARTMOUTH: "TUCK",
  STERN: "STERN",
  NYU: "STERN",
  JOHNSON: "JOHNSON",
  CORNELL: "JOHNSON",
  FUQUA: "FUQUA",
  DUKE: "FUQUA",
  DARDEN: "DARDEN",
  VIRGINIA: "DARDEN",
  // Additional seeded programs
  HAAS: "Haas",
  BERKELEY: "Haas",
  "YALE SOM": "Yale SOM",
  YALE: "Yale SOM",
  SOM: "Yale SOM",
  ROSS: "Ross",
  MICHIGAN: "Ross",
  ANDERSON: "Anderson",
  UCLA: "Anderson",
  TEPPER: "Tepper",
  CMU: "Tepper",
  "CARNEGIE MELLON": "Tepper",
  MARSHALL: "Marshall",
  USC: "Marshall",
  MCCOMBS: "McCombs",
  "UT AUSTIN": "McCombs",
  TEXAS: "McCombs",
  "KENAN-FLAGLER": "Kenan-Flagler",
  UNC: "Kenan-Flagler",
  GOIZUETA: "Goizueta",
  EMORY: "Goizueta",
  MCDONOUGH: "McDonough",
  GEORGETOWN: "McDonough",
  OWEN: "Owen",
  VANDERBILT: "Owen",
  // International / additional Figma entries
  RICE: "Rice",
  JONES: "Rice",
  LBS: "LBS",
  "LONDON BUSINESS SCHOOL": "LBS",
  LONDON: "LBS",
  IESE: "IESE",
  INSEAD: "INSEAD",
  ESADE: "ESADE",
};

/**
 * Tokens that appear in almost every school name and therefore can't be used
 * as discriminative match keys. Without this guard the name fallback would
 * map every "X School of Business" to whichever canonical school happened to
 * be first in the list (in practice: Harvard), which is what produced the
 * "every school shows the Harvard shield" bug.
 */
const GENERIC_NAME_TOKENS = new Set([
  "the",
  "and",
  "of",
  "for",
  "school",
  "schools",
  "business",
  "management",
  "graduate",
  "college",
  "university",
  "institute",
]);

/**
 * Resolve a logo for an arbitrary School returned by the API. Tries the
 * abbreviation first (with common aliases), then a name-token match against
 * the canonical list — but only on *distinctive* tokens (skips generic
 * filler words like "school", "of", "business").
 */
export function resolveSchoolLogo(school: {
  name?: string | null;
  abbreviation?: string | null;
}): string | undefined {
  const abbr = (school.abbreviation ?? "").toUpperCase().trim();
  if (abbr) {
    const aliasKey = ABBREV_ALIASES[abbr];
    if (aliasKey) {
      const hit = CANONICAL_SCHOOLS.find((s) => s.abbreviation === aliasKey);
      if (hit) return hit.logo;
    }
  }

  const name = (school.name ?? "").toLowerCase().trim();
  if (!name) return undefined;
  const nameTokens = new Set(
    name.split(/[\s\-]+/).filter((t) => t.length >= 4 && !GENERIC_NAME_TOKENS.has(t)),
  );
  if (nameTokens.size === 0) return undefined;

  const byName = CANONICAL_SCHOOLS.find((s) =>
    s.name
      .toLowerCase()
      .split(/[\s\-]+/)
      .some((t) => t.length >= 4 && !GENERIC_NAME_TOKENS.has(t) && nameTokens.has(t)),
  );
  return byName?.logo;
}
