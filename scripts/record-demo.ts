/**
 * Records the backup demo video: walks both golden paths at presenter pace
 * against an already-running server and saves a .webm (Playwright's own
 * capture) plus an H.264 .mp4 (via ffmpeg) for dropping into slides.
 *
 *   npm run record-demo                         # http://localhost:3300
 *   npm run record-demo -- http://localhost:4000 # override
 *   DEMO_URL=http://localhost:4000 npm run record-demo
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

const BASE_URL = process.argv[2] ?? process.env.DEMO_URL ?? "http://localhost:3300";
const PROFILE = "new.singapore.environment-stem";

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
  // Not "networkidle": pages with the live SSE feed never go idle.
  await page.goto(BASE_URL + pathAndQuery, { waitUntil: "load" });
  await pause(page, 300);
}

async function run() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  log(`checking server at ${BASE_URL}`);
  const check = await fetch(BASE_URL).catch(() => null);
  if (!check || !check.ok) {
    console.error(
      `\nNo server responding at ${BASE_URL}. Start it first:\n` +
        `  npm run build && DEMO_MODE=true npx next start -p 3300\n`,
    );
    process.exit(1);
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: { dir: OUT_DIR, size: VIEWPORT },
  });
  const page = await context.newPage();
  await installPresenterChrome(page);

  const start = performance.now();

  // ---------------------------------------------------------------- landing
  await goto(page, "/");
  log("landing: headline and trust strip");
  await pause(page, 5000);
  await smoothScrollTo(page, page.locator("section").nth(1), 1200);
  await pause(page, 4500);

  // ----------------------------------------------------------------- start
  await goto(page, "/start");
  log("onboarding: New to F1, Singapore, Environment + STEM");
  await smoothClick(page, page.getByRole("button", { name: /New to F1/ }), { pauseAfter: 900 });
  await smoothClick(page, page.getByRole("combobox", { name: "Home city" }), { pauseAfter: 600 });
  await smoothClick(page, page.getByRole("option", { name: "Singapore, Singapore" }), { pauseAfter: 900 });
  await smoothClick(page, page.getByRole("button", { name: "Environment", exact: true }), { pauseAfter: 600 });
  await smoothClick(page, page.getByRole("button", { name: "STEM", exact: true }), { pauseAfter: 1200 });
  await pause(page, 2500);
  await smoothClick(page, page.getByRole("button", { name: "Start your lap" }), { pauseAfter: 1200 });

  // ------------------------------------------------------------------- lap
  log("lap: sector 1, Environment - AI text and a quiz reveal");
  await page.waitForURL(/\/lap$/);
  await pause(page, 5000);
  const beat1 = page.locator('div:has(> p.label:text-is("Quiz beat"))').first();
  await smoothScrollTo(page, beat1, 900);
  await smoothClick(page, beat1.getByRole("button").first(), { pauseAfter: 3000 });
  await pause(page, 4000);

  log("lap: provenance drawer from the revealed figure");
  const revealedFact = beat1.getByRole("button", { name: /Show source/ });
  await smoothClick(page, revealedFact, { pauseAfter: 1200 });
  await pause(page, 5500);
  await page.keyboard.press("Escape");
  await pause(page, 700);

  log("lap: sector 2, Belong - another quiz reveal");
  await smoothClick(page, page.getByRole("button", { name: "Next" }), { pauseAfter: 1800 });
  await pause(page, 3000);
  const beat2 = page.locator('div:has(> p.label:text-is("Quiz beat"))').first();
  if (await beat2.count()) {
    await smoothScrollTo(page, beat2, 900);
    await smoothClick(page, beat2.getByRole("button").first(), { pauseAfter: 2800 });
    await pause(page, 3200);
  }

  log("lap: through community, scrutineering, finish");
  await smoothClick(page, page.getByRole("button", { name: "Next" }), { pauseAfter: 1400 });
  await smoothClick(page, page.getByRole("button", { name: "Next" }), { pauseAfter: 1400 });
  await smoothClick(page, page.getByRole("button", { name: "Next" }), { pauseAfter: 1800 });
  log("lap: chequered flag");
  await pause(page, 3000);

  // --------------------------------------------------------------- weekend
  log("weekend: Singapore GP - equivalents, data gap, matched initiatives, live feed");
  await smoothClick(page, page.getByRole("link", { name: /Your weekend: Singapore GP/ }), { pauseAfter: 1200 });
  await page.waitForURL(/\/weekend\/singapore-2026/);
  await pause(page, 4500);
  await smoothClick(page, page.getByRole("radio", { name: "London–New York return flights" }), { pauseAfter: 2500 });
  await pause(page, 2800);

  const dataGap = page.getByText("Data gap");
  await smoothScrollTo(page, dataGap, 3000);

  const matched = page.getByText("Matched for you");
  await smoothScrollTo(page, matched, 3200);

  const liveFeed = page.getByText("Live feed");
  await smoothScrollTo(page, liveFeed, 1800);
  log("weekend: watching the live feed tick over");
  await pause(page, 6000);

  // ----------------------------------------------------------------- share
  await goto(page, `/share?p=${PROFILE}`);
  log("share: the 9:16 card, then download");
  await pause(page, 4500);
  const download = page.getByRole("button", { name: "Download PNG" });
  await download.waitFor({ state: "visible" });
  await page.waitForFunction(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => b.textContent?.includes("Download PNG"));
    return Boolean(btn && !btn.hasAttribute("disabled"));
  });
  await smoothClick(page, download, { pauseAfter: 2200 });

  // ------------------------------------------------------------------- act
  await goto(page, `/act?p=${PROFILE}`);
  log("act: pick a lower-carbon trip, log it, see simulated credits");
  await pause(page, 1800);
  await smoothClick(page, page.getByRole("button", { name: /Walk or cycle/ }), { pauseAfter: 1200 });
  await smoothClick(page, page.getByRole("button", { name: "Log this trip" }), { pauseAfter: 3000 });
  await smoothClick(page, page.getByRole("tab", { name: "Your programme" }), { pauseAfter: 2200 });
  await pause(page, 2800);

  // --------------------------------------------------------------- partner
  await goto(page, "/partners");
  log("partners: KPI provenance");
  await pause(page, 3000);
  const kpiSection = page.locator("section", { hasText: "Key metrics by pillar" });
  const kpiButton = kpiSection.getByRole("button").first();
  await smoothScrollTo(page, kpiButton, 900);
  await smoothClick(page, kpiButton, { pauseAfter: 1200 });
  await pause(page, 4500);
  await page.keyboard.press("Escape");
  await pause(page, 700);

  log("partners: waiting for a live milestone alert");
  const alert = page.getByText("Simulated milestone").first();
  await smoothScrollTo(page, page.getByText("Live race weekend"), 900);
  await alert.waitFor({ state: "visible", timeout: 15_000 }).catch(() => log("milestone did not fire in time; continuing"));
  await smoothScrollTo(page, alert, 1600);
  await pause(page, 5500);

  // ------------------------------------------------------------ narratives
  await goto(page, "/partners/narratives");
  log("narratives: LinkedIn post with citations");
  await pause(page, 2600);
  await page.locator("button.num").first().waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
  await pause(page, 6000);

  // ------------------------------------------------------------- scenarios
  await goto(page, "/partners/scenarios");
  log("scenarios: moving a slider changes the outcomes and the explanation");
  await pause(page, 2000);
  const slider = page.getByRole("slider").first();
  await smoothScrollTo(page, slider, 900);
  await slider.focus();
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("ArrowRight");
    await pause(page, 150);
  }
  await pause(page, 4500);

  // --------------------------------------------------------------- sources
  await goto(page, "/sources");
  log("sources: every number traced, flagged facts only");
  await pause(page, 2800);
  await smoothClick(page, page.getByRole("button", { name: "flagged only" }), { pauseAfter: 1400 });
  await smoothScrollTo(page, page.locator("ul.divide-y").first(), 1600);
  await pause(page, 5500);

  const totalSeconds = (performance.now() - start) / 1000;
  log(`walk complete in ${totalSeconds.toFixed(1)}s`);

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
