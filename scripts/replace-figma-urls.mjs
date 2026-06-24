#!/usr/bin/env node
/**
 * Replaces every `https://www.figma.com/api/mcp/asset/<uuid>` URL in src/
 * with `/figma-assets/<uuid>.<ext>` IF a local copy with that uuid exists in
 * public/figma-assets/. URLs whose local copy is missing (because they
 * expired before we could download) are left untouched and reported.
 *
 * Run: node scripts/replace-figma-urls.mjs
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "src");
const ASSETS_DIR = path.join(ROOT, "public", "figma-assets");

const URL_RE = /https:\/\/www\.figma\.com\/api\/mcp\/asset\/([a-f0-9-]{36})/g;

async function buildLocalIndex() {
  const map = new Map(); // uuid → /figma-assets/<uuid>.<ext>
  for (const file of await fs.readdir(ASSETS_DIR)) {
    const m = file.match(/^([a-f0-9-]{36})\.(\w+)$/);
    if (m) map.set(m[1], `/figma-assets/${file}`);
  }
  return map;
}

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(tsx?|jsx?|css|mdx?)$/.test(entry.name)) yield full;
  }
}

async function main() {
  const localIndex = await buildLocalIndex();
  console.error(`Local figma-assets cache: ${localIndex.size} files`);

  let filesTouched = 0;
  let urlsReplaced = 0;
  const stillBroken = new Set();

  for await (const file of walk(SRC_DIR)) {
    const before = await fs.readFile(file, "utf8");
    const after = before.replace(URL_RE, (full, uuid) => {
      const local = localIndex.get(uuid);
      if (local) {
        urlsReplaced++;
        return local;
      }
      stillBroken.add(uuid);
      return full;
    });
    if (after !== before) {
      await fs.writeFile(file, after);
      filesTouched++;
    }
  }

  console.log(JSON.stringify({
    filesTouched,
    urlsReplaced,
    stillBrokenCount: stillBroken.size,
    stillBroken: [...stillBroken],
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
