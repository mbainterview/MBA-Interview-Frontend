#!/usr/bin/env node
/**
 * One-shot Figma asset rescuer.
 *
 * Walks src/, finds every `https://www.figma.com/api/mcp/asset/<uuid>` URL,
 * downloads each to public/figma-assets/<uuid>.<ext> (sniffing extension from
 * the response Content-Type), and prints a JSON report mapping uuid → status.
 *
 * Run: node scripts/download-figma-assets.mjs
 *
 * Notes:
 * - Skips assets already on disk.
 * - Figma MCP asset URLs expire after 7 days; expired ones return 404 — they
 *   land in the `expired` array of the report so we know which to refetch.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "src");
const OUT_DIR = path.join(ROOT, "public", "figma-assets");

const URL_RE = /https:\/\/www\.figma\.com\/api\/mcp\/asset\/([a-f0-9-]{36})/g;

const EXT_FOR_MIME = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/svg+xml": "svg",
  "image/webp": "webp",
  "image/gif": "gif",
};

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(tsx?|jsx?|css|mdx?)$/.test(entry.name)) yield full;
  }
}

async function collectUrls() {
  const ids = new Set();
  for await (const file of walk(SRC_DIR)) {
    const text = await fs.readFile(file, "utf8");
    for (const match of text.matchAll(URL_RE)) ids.add(match[1]);
  }
  return [...ids];
}

async function alreadyDownloaded(id) {
  for (const ext of ["png", "jpg", "svg", "webp", "gif"]) {
    try {
      await fs.access(path.join(OUT_DIR, `${id}.${ext}`));
      return ext;
    } catch {}
  }
  return null;
}

async function downloadOne(id) {
  const existing = await alreadyDownloaded(id);
  if (existing) return { id, status: "skipped", ext: existing };

  const url = `https://www.figma.com/api/mcp/asset/${id}`;
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    return { id, status: "network-error", message: err.message };
  }
  if (!res.ok) {
    return { id, status: "expired", code: res.status };
  }
  const ct = (res.headers.get("content-type") || "").split(";")[0].trim();
  const ext = EXT_FOR_MIME[ct] || "png";
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(path.join(OUT_DIR, `${id}.${ext}`), buf);
  return { id, status: "downloaded", ext, bytes: buf.length };
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const ids = await collectUrls();
  console.error(`Found ${ids.length} unique Figma asset URLs in src/`);

  const downloaded = [];
  const skipped = [];
  const expired = [];
  const errors = [];

  // Limit concurrency to 8 to be polite to the Figma CDN
  const queue = [...ids];
  const inflight = new Set();
  async function spawn() {
    while (queue.length && inflight.size < 8) {
      const id = queue.shift();
      const p = downloadOne(id).then((r) => {
        inflight.delete(p);
        if (r.status === "downloaded") downloaded.push(r);
        else if (r.status === "skipped") skipped.push(r);
        else if (r.status === "expired") expired.push(r);
        else errors.push(r);
      });
      inflight.add(p);
    }
  }
  while (queue.length || inflight.size) {
    await spawn();
    if (inflight.size) await Promise.race(inflight);
  }

  const report = {
    total: ids.length,
    downloaded: downloaded.length,
    skipped: skipped.length,
    expired: expired.length,
    errors: errors.length,
    expiredIds: expired.map((e) => e.id),
    errorIds: errors.map((e) => ({ id: e.id, message: e.message || e.code })),
  };
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
