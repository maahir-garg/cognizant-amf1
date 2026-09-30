/**
 * Records the backup demo video: walks the run of show in docs/DEMO_SCRIPT.md
 * (story, Singapore race page, card, Impact desk) at presenter pace against
 * an already-running server and saves a .webm (Playwright's own
 * capture) plus an H.264 .mp4 (via ffmpeg) for dropping into slides.
 *
 *   npm run record-demo                         # http://localhost:3300
 *   npm run record-demo -- http://localhost:4000 # override
 *   DEMO_URL=http://localhost:4000 npm run record-demo
 *   npm run record-demo -- --dry-run            # walk the path, record nothing
 *
 * The server must already be running in demo mode (see README "Check it" /
 * docs/DEMO_SCRIPT.md pre-flight): `npm run build && DEMO_MODE=true npx next
 * start -p 3300`. This script only drives a browser against it; it does not
 * start or build anything, so a run against a half-built server fails fast
 * and obviously rather than recording a broken take.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import { chromium, type Locator, type Page } from "@playwright/test";

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "docs/demo-video");
const WEBM_PATH = path.join(OUT_DIR, "impact-lap-demo.webm");
const MP4_PATH = path.join(OUT_DIR, "impact-lap-demo.mp4");
const FFMPEG = process.env.FFMPEG ?? "ffmpeg";
const FFPROBE = process.env.FFPROBE ?? "ffprobe";
const MAX_MP4_BYTES = 60 * 1024 * 1024;

const ARGS = process.argv.slice(2);
/** Walks the whole path without recording or encoding: a rehearsal that the selectors still match the build. */
const DRY_RUN = ARGS.includes("--dry-run");
const BASE_URL = ARGS.find((a) => !a.startsWith("--")) ?? process.env.DEMO_URL ?? "http://localhost:3300";

const VIEWPORT = { width: 1920, height: 1080 };

function log(msg: string) {
  const t = (performance.now() / 1000).toFixed(1).padStart(6);
  console.log(`[${t}s] ${msg}`);
}

async function pause(page: Page, ms: number) {
  await page.waitForTimeout(ms);
}

/** A CSS dot that tracks real mousemove events, plus smooth-scroll for the whole document. */
async function installPresenterChrome(page: Page) {
  await page.addInitScript(() => {
    const install = () => {
      if (document.getElementById("__demo_cursor__")) return;
      const style = document.createElement("style");
      style.textContent = `
        html { scroll-behavior: smooth !important; }
        #__demo_cursor__ {
          position: fixed; z-index: 2147483647; width: 22px; height: 22px;
          border-radius: 999px; background: rgba(206, 220, 0, 0.85);
          border: 2px solid rgba(11, 26, 22, 0.9);
          box-shadow: 0 0 0 6px rgba(206, 220, 0, 0.18);
          pointer-events: none; transform: translate(-50%, -50%);
          left: -100px; top: -100px; transition: left 40ms linear, top 40ms linear;
        }
      `;
      document.head.appendChild(style);
      const dot = document.createElement("div");
      dot.id = "__demo_cursor__";
      document.body.appendChild(dot);
      window.addEventListener("mousemove", (e) => {
        dot.style.left = `${e.clientX}px`;
        dot.style.top = `${e.clientY}px`;
      });
      window.addEventListener("mousedown", () => (dot.style.transform = "translate(-50%, -50%) scale(0.7)"));
      window.addEventListener("mouseup", () => (dot.style.transform = "translate(-50%, -50%) scale(1)"));
    };
    if (document.body) install();
    else document.addEventListener("DOMContentLoaded", install);
  });
}

/** Glides the (visible) cursor to the element before clicking, presenter-style. */
async function smoothClick(page: Page, locator: Locator, opts: { pauseBefore?: number; pauseAfter?: number } = {}) {
  await locator.scrollIntoViewIfNeeded();
  await pause(page, 350);
  const box = await locator.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 24 });
    await pause(page, opts.pauseBefore ?? 300);
  }
  await locator.click();
  await pause(page, opts.pauseAfter ?? 400);
}

async function smoothScrollTo(page: Page, locator: Locator, pauseMs = 900) {
  await locator.evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "center" }));
  await pause(page, pauseMs);
}

async function goto(page: Page, pathAndQuery: string) {
  log(`goto ${pathAndQuery}`);
  await page.goto(BASE_URL + pathAndQuery, { waitUntil: "load" });
  await pause(page, 300);
}

/** Walks one chapter's step cards at reading pace, so the sticky image and graphic change under each caption. */
async function readChapter(page: Page, id: string, onCard?: (card: Locator, i: number) => Promise<void>) {
  const chapter = page.locator(`section#${id}`);
  await smoothScrollTo(page, chapter.getByRole("heading", { level: 2 }), 1200);
  await pause(page, 2400);
  const cards = chapter.locator("article");
  const count = await cards.count();
  if (count === 0) throw new Error(`chapter ${id} has no step cards`);
  for (let i = 0; i < count; i++) {
    await smoothScrollTo(page, cards.nth(i), 1000);
    await pause(page, 2200);
    await onCard?.(cards.nth(i), i);
  }
}

/** Opens a chapter's "The detail" disclosure and lets it sit on screen. */
async function openDetail(page: Page, id: string) {
  const summary = page.locator(`section#${id} details > summary`).first();
  await smoothClick(page, summary, { pauseAfter: 1200 });
  await smoothScrollTo(page, page.locator(`section#${id} details[open]`).first(), 3500);
}

async function run() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  log(`checking server at ${BASE_URL}`);
  const check = await fetch(BASE_URL).catch(() => null);
  if (!check || !check.ok) {
    console.error(
      `\nNo server responding at ${BASE_URL}. Start it first:\n` + `  npm run build && DEMO_MODE=true npx next start -p 3300\n`,
    );
    process.exit(1);
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    ...(DRY_RUN ? {} : { recordVideo: { dir: OUT_DIR, size: VIEWPORT } }),
  });
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const page = await context.newPage();
  await installPresenterChrome(page);

  const start = performance.now();

  // ------------------------------------------------------------ the story (1:30)
  await goto(page, "/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  log("story: title page and byline");
  await pause(page, 5000);

  log("story: what you get");
  await smoothScrollTo(page, page.locator("#what-you-get"), 4500);

  log("story: depth toggle, left on New to F1");
  const toggle = page.getByRole("group", { name: "How much detail?" });
  await smoothScrollTo(page, toggle, 600);
  const watched = toggle.locator("label", { hasText: "Watched for years" });
  const box = await watched.boundingBox();
  if (!box) throw new Error("depth toggle is not on screen");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 24 });
  await pause(page, 3000);

  log("story: chapter 1, the campus");
  await readChapter(page, "campus");

  log("story: chapter 2, supply chain; trust moment 1 on the 81%");
  await readChapter(page, "supply-chain", async (card, i) => {
    if (i !== 0) return;
    const figure = card.getByRole("button", { name: /Show source\.$/ }).first();
    await smoothClick(page, figure, { pauseAfter: 1200 });
    await page.getByRole("dialog").waitFor({ state: "visible" });
    await pause(page, 5500);
    await page.keyboard.press("Escape");
    await pause(page, 800);
  });

  log("story: chapter 3, moving the team; open the detail on SAF");
  await readChapter(page, "moving");
  await openDetail(page, "moving");

  log("story: chapter 4, at the circuit, ending on the Singapore gap");
  await readChapter(page, "circuit");
  await pause(page, 2500);

  log("story: chapter 5, beyond the track");
  await readChapter(page, "beyond");

  log("story: chapter 6, the finish line and the target chart");
  await readChapter(page, "finish");
  await pause(page, 2500);

  log("story: the ending, into the race weekend");
  const ending = page.locator("section#race-weekend");
  await smoothScrollTo(page, ending.getByRole("heading", { level: 2 }), 3500);
  await smoothClick(page, ending.getByRole("link", { name: "See the programmes" }), { pauseAfter: 800 });
  await page.waitForURL(/\/weekend\/singapore-2026/);

  // --------------------------------------------------- Singapore race page (4:30)
  log("race page: real programmes");
  await pause(page, 4000);
  await smoothScrollTo(page, page.getByText("Data gap: trackside energy"), 3000);

  log("race page: getting there by MRT, compared with a taxi");
  await smoothScrollTo(page, page.locator("#getting-there"), 1200);
  await smoothClick(page, page.locator("#getting-there label", { hasText: "MRT" }), { pauseAfter: 3000 });
  await smoothClick(page, page.locator("#getting-there label", { hasText: "Taxi or ride-hail" }), { pauseAfter: 2400 });
  await smoothClick(page, page.locator("#getting-there label", { hasText: "MRT" }), { pauseAfter: 2400 });

  log("race page: quick check, three answers and the badge");
  const questions = page.locator("#quick-check ol > li");
  await smoothScrollTo(page, questions.first(), 1000);
  const total = await questions.count();
  for (let i = 0; i < total; i++) {
    const q = questions.nth(i);
    await smoothScrollTo(page, q, 700);
    await smoothClick(page, q.locator("label").first(), { pauseAfter: 2600 });
  }
  await smoothScrollTo(page, page.getByText("Badge earned"), 2500);

  // --------------------------------------------------------------- share (6:30)
  await goto(page, "/share");
  log("share: pick a team figure, then save the card");
  await pause(page, 3500);
  const spare = page
    .getByRole("group", { name: /Team figures/ })
    .locator("label:has(input[type=checkbox]:not(:checked):not(:disabled))");
  await smoothClick(page, spare.first(), { pauseAfter: 2200 });
  const save = page.getByRole("button", { name: "Save the card" });
  await smoothClick(page, save, { pauseAfter: 3000 });

  // ------------------------------------------------------ Impact desk (7:00)
  await goto(page, "/partners");
  log("desk: this race week, joint Cognizant facts and data gaps");
  await pause(page, 4000);
  await smoothScrollTo(page, page.getByRole("heading", { name: /^Joint with/ }), 2500);
  await smoothScrollTo(page, page.getByRole("heading", { name: "Not published" }), 2500);

  await goto(page, "/partners/narratives");
  log("desk: LinkedIn draft, a citation chip, then approve");
  await smoothClick(page, page.locator("label", { hasText: "LinkedIn post" }), { pauseAfter: 1500 });
  const chip = page
    .getByRole("article", { name: "LinkedIn post draft" })
    .getByRole("button", { name: /^Source \d+: / })
    .first();
  await chip.waitFor({ state: "visible", timeout: 15_000 });
  await pause(page, 3500);
  await smoothClick(page, chip, { pauseAfter: 1200 });
  await pause(page, 4000);
  await page.keyboard.press("Escape");
  await pause(page, 600);
  const approval = page.getByRole("region", { name: "Approval" });
  await smoothClick(page, approval.getByRole("button", { name: "Send for review" }), { pauseAfter: 1200 });
  await approval.getByLabel("Reviewer").pressSequentially("Demo reviewer", { delay: 70 });
  await smoothClick(page, approval.getByRole("button", { name: "Approve" }), { pauseAfter: 3000 });

  await goto(page, "/partners/check");
  log("desk: trust moment 2, 275 is held back, 257 passes with a citation");
  const draft = page.getByLabel("Your draft");
  await smoothClick(page, draft, { pauseAfter: 400 });
  await draft.fill("Make A Mark Day brought 275 students to the factory for AI, coding and careers sessions with Cognizant.");
  await pause(page, 4500);
  await smoothClick(page, page.getByRole("button", { name: "Use the published figure" }), { pauseAfter: 4500 });

  await goto(page, "/partners/data-quality");
  log("desk: data quality flags");
  await pause(page, 3000);
  await page.mouse.wheel(0, 900);
  await pause(page, 3500);

  await goto(page, "/partners/export");
  log("desk: export");
  await pause(page, 3500);

  await goto(page, "/partners/roi");
  log("desk: published baselines beside the pilot measures");
  await pause(page, 3000);
  await smoothScrollTo(page, page.locator("#pilot"), 3500);

  // ------------------------------------------------------ how it works (12:00)
  await goto(page, "/how-it-works");
  log("how it works: the worked number check, then the business model and pilot");
  await pause(page, 3000);
  await smoothScrollTo(page, page.locator("#check"), 5500);
  await smoothScrollTo(page, page.locator("#return"), 4000);
  await smoothScrollTo(page, page.locator("#pilot"), 6000);

  await goto(page, "/");
  log("close: back to the title page");
  await pause(page, 3500);

  const totalSeconds = (performance.now() - start) / 1000;
  log(`walk complete in ${totalSeconds.toFixed(1)}s`);

  if (DRY_RUN) {
    await browser.close();
    log("dry run: nothing recorded");
    return;
  }

  const video = page.video();
  if (!video) throw new Error("No video was recorded (recordVideo context option missing?)");
  await context.close();
  await video.saveAs(WEBM_PATH);
  await browser.close();
  log(`saved ${WEBM_PATH} (${(statSync(WEBM_PATH).size / 1e6).toFixed(1)} MB)`);

  encodeMp4(20);
}

function encodeMp4(crf: number) {
  log(`encoding H.264 mp4 at crf ${crf}`);
  execFileSync(FFMPEG, [
    "-y",
    "-i",
    WEBM_PATH,
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    String(crf),
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-an",
    MP4_PATH,
  ]);
  const size = statSync(MP4_PATH).size;
  log(`mp4 is ${(size / 1e6).toFixed(1)} MB`);
  if (size > MAX_MP4_BYTES && crf < 32) {
    log("over ~60MB, re-encoding at a higher crf");
    encodeMp4(crf + 4);
    return;
  }
  const probe = execFileSync(FFPROBE, [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height,duration",
    "-of",
    "default=noprint_wrappers=1",
    MP4_PATH,
  ]).toString();
  log(`ffprobe: ${probe.trim().replace(/\n/g, ", ")}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
