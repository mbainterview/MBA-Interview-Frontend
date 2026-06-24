#!/usr/bin/env node
/**
 * Convert arbitrary px values on Tailwind spacing-scale utilities
 * to canonical form. Tailwind v4 spacing scale is 0.25rem (= 4px) per unit,
 * so [Npx] becomes the literal N/4 (e.g. px-[18px] -> px-4.5, w-[345px] -> w-86.25).
 *
 * Only utilities that use the spacing scale are converted; text-[Npx],
 * rounded-[Npx], border-[Npx], shadow, ring, etc. use other scales and are
 * left alone. This is a pixel-perfect-equivalent rewrite — the rendered
 * result is identical.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "src");

// Utilities that use the spacing scale (Tailwind v4).
const SPACING_UTILITIES = [
  // padding
  "p", "px", "py", "pt", "pr", "pb", "pl", "ps", "pe",
  // margin
  "m", "mx", "my", "mt", "mr", "mb", "ml", "ms", "me",
  // gap / space
  "gap", "gap-x", "gap-y", "space-x", "space-y",
  // sizing
  "w", "h", "size", "min-w", "max-w", "min-h", "max-h",
  // positioning
  "top", "right", "bottom", "left", "start", "end",
  "inset", "inset-x", "inset-y",
  // translate
  "translate-x", "translate-y", "translate",
  // line-height (shares spacing scale in v4)
  "leading",
  // misc
  "indent",
  "scroll-m", "scroll-mx", "scroll-my", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml",
  "scroll-p", "scroll-px", "scroll-py", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl",
];

// Match (optional negative -, optional variant: lg:, hover:, etc.) prefix-[Npx]
// We need to allow word boundary or start before, and ] at end.
// Capture: 1=prefix (variants + utility name), 2=number
const UTILITY_GROUP = SPACING_UTILITIES
  .map((u) => u.replace(/-/g, "\\-"))
  .join("|");

const PATTERN = new RegExp(
  // Negative lookbehind: NOT preceded by alphanumeric (so we don't match
  // partial-word matches like "footop-[10px]"). Use a non-capturing word
  // boundary equivalent.
  `(^|[^A-Za-z0-9_-])` +
    // optional negative sign + optional variants (e.g. md:, hover:, dark:, group-hover:)
    `(-?(?:[a-zA-Z0-9_-]+:)*` +
    // utility name from whitelist
    `(?:${UTILITY_GROUP}))` +
    // literal -[Npx]
    `-\\[(\\d+(?:\\.\\d+)?)px\\]`,
  "g"
);

function convert(content) {
  let count = 0;
  const next = content.replace(PATTERN, (_match, lead, util, num) => {
    const px = parseFloat(num);
    const units = px / 4;
    // Format: integer if whole, decimal otherwise (drop trailing zeros)
    let canonical;
    if (Number.isInteger(units)) {
      canonical = String(units);
    } else {
      // Use a fixed precision then strip trailing zeros and trailing dot.
      canonical = units.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
    }
    count++;
    return `${lead}${util}-${canonical}`;
  });
  return { content: next, count };
}

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      yield* walk(full);
    } else if (/\.(tsx?|jsx?|css)$/.test(entry.name)) {
      yield full;
    }
  }
}

let totalFiles = 0;
let totalChanges = 0;
const changedFiles = [];

for await (const file of walk(ROOT)) {
  const original = await fs.readFile(file, "utf8");
  const { content, count } = convert(original);
  if (count > 0) {
    await fs.writeFile(file, content, "utf8");
    totalFiles++;
    totalChanges += count;
    changedFiles.push(`${count.toString().padStart(4)}  ${path.relative(ROOT, file)}`);
  }
}

console.log(`Converted ${totalChanges} occurrences across ${totalFiles} files:\n`);
console.log(changedFiles.join("\n"));
