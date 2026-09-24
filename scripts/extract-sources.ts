/**
 * Regenerates sources/text/<id>.json (one string per page) from the original
 * documents listed in data/sources.json.
 *
 *   npm run extract:sources
 *
 * Requires `pdftotext` (poppler) on PATH for PDFs. The generated text files are
 * committed so that `npm run verify:data` works in CI without the PDFs, which
 * are large and gitignored. See docs/data-sources.md for download commands.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { Source } from "../lib/data/schemas";

const root = path.resolve(__dirname, "..");
const sources = z.array(Source).parse(JSON.parse(readFileSync(path.join(root, "data/sources.json"), "utf8")));

function pdfPages(file: string): string[] {
  const raw = execFileSync("pdftotext", ["-enc", "UTF-8", file, "-"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "ignore"],
  });
  const pages = raw.split("\f");
  // pdftotext ends the last page with a form feed, leaving an empty tail.
  if (pages.at(-1)?.trim() === "") pages.pop();
  return pages.map((p) => p.trim());
}

function htmlPage(file: string): string[] {
  const html = readFileSync(file, "utf8")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");
  const text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|section)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/&[a-z]+;/g, " ")
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
  return [text];
}

let failures = 0;
for (const s of sources) {
  if (!s.textPath || !s.localPath) continue;
  const input = path.join(root, s.localPath);
  if (!existsSync(input)) {
    console.warn(`skip ${s.id}: ${s.localPath} not found (download it, see docs/data-sources.md)`);
    failures++;
    continue;
  }
  const pages = s.kind === "pdf" ? pdfPages(input) : htmlPage(input);
  if (s.pageCount && pages.length !== s.pageCount) {
    console.warn(`warn ${s.id}: expected ${s.pageCount} pages, got ${pages.length}`);
  }
  const out = path.join(root, s.textPath);
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(pages, null, 1) + "\n");
  console.log(`wrote ${s.textPath} (${pages.length} pages)`);
}
process.exit(failures ? 1 : 0);
