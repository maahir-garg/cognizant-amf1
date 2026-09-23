/**
 * Automated demo recording script using Playwright.
 * Launches headless browser at 1080p, walks through both golden paths,
 * and saves a clean video walkthrough in /docs/demo-video/.
 */
import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";

async function recordWalkthrough() {
  const outputDir = path.join(process.cwd(), "docs", "demo-video");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("Starting Automated 1080p Demo Walkthrough Recording...\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();
  const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";

  try {
    // 1. Home Portal
    console.log("-> Recording: Home Portal");
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // 2. Fan Onboarding
    console.log("-> Recording: Fan Onboarding (30s setup)");
    await page.goto(`${baseUrl}/onboarding`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.locator("text=New Fan").click();
    await page.waitForTimeout(1000);
    await page.locator("select").selectOption("Singapore");
    await page.waitForTimeout(1000);
    await page.locator("button[type='submit']").click();

    // 3. Interactive Story Lap
    console.log("-> Recording: Interactive Story Lap & Quiz Beats");
    await page.waitForURL("**/journey");
    await page.waitForTimeout(2500);

    // Answer quiz beat 1
    const quizOpt = page.locator("button:has-text('88,153 laps')");
    if (await quizOpt.isVisible()) {
      await quizOpt.click();
      await page.waitForTimeout(2000);
    }

    // Inspect provenance drawer
    await page.locator("text=FREIGHT FOOTPRINT").click();
    await page.waitForTimeout(2000);
    await page.locator("button[aria-label='Close provenance drawer']").click();
    await page.waitForTimeout(1000);

    // 4. Live Carbon Tracker
    console.log("-> Recording: Live Carbon Tracker & Relatable Equivalents");
    await page.goto(`${baseUrl}/tracker`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await page.locator("button:has-text('Raw tCO₂e Values')").click();
    await page.waitForTimeout(1500);
    await page.locator("button:has-text('Relatable Equivalents')").click();
    await page.waitForTimeout(2000);

    // 5. Sustainable Actions Hub
    console.log("-> Recording: Sustainable Actions & Credits");
    await page.goto(`${baseUrl}/actions`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.locator("text=SMRT Mass Rapid Transit (MRT)").click();
    await page.waitForTimeout(1500);

    // 6. Share Card Generator
    console.log("-> Recording: 9:16 Social Story Share Card");
    await page.goto(`${baseUrl}/share`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);

    // 7. Partner Intelligence Dashboard
    console.log("-> Recording: Partner Intelligence Dashboard");
    await page.goto(`${baseUrl}/partners`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await page.locator("text=Scope 1 Direct GHG Emissions").click();
    await page.waitForTimeout(2000);
    await page.locator("button[aria-label='Close provenance drawer']").click();
    await page.waitForTimeout(1000);

    // Generate narrative
    await page.locator("button:has-text('Generate Narrative')").click();
    await page.waitForTimeout(2500);

    // 8. What-If Scenario Modeller
    console.log("-> Recording: What-If Scenario Modeller");
    await page.goto(`${baseUrl}/partners/scenarios`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await page.locator("button:has-text('Explain Scenario')").click();
    await page.waitForTimeout(2500);

    // 9. Milestone Alert Feed
    console.log("-> Recording: Milestone Alert Feed");
    await page.goto(`${baseUrl}/partners/feed`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    console.log("\nWalkthrough recording completed successfully!");
  } catch (err) {
    console.error("Recording error:", err);
  } finally {
    await context.close();
    await browser.close();
    console.log(`Video saved in: ${outputDir}`);
  }
}

if (process.argv[1]?.includes("record-demo")) {
  recordWalkthrough();
}
