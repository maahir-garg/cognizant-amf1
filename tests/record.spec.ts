import { test, expect } from "@playwright/test";

test.use({
  baseURL: "http://localhost:3000",
  video: { mode: "on", size: { width: 1920, height: 1080 } },
  viewport: { width: 1920, height: 1080 },
});

test("Record Complete 1080p Demo Walkthrough", async ({ page }) => {
  test.setTimeout(180000);

  // 1. Home Portal
  await page.goto("/");
  await page.waitForTimeout(1500);

  // 2. Onboarding
  await page.goto("/onboarding");
  await expect(page.locator("h1")).toContainText("Customise Your Impact Lap");
  await page.waitForTimeout(1000);
  await page.locator("text=New Fan").click();
  await page.waitForTimeout(800);
  await page.locator("select").selectOption("Singapore");
  await page.waitForTimeout(800);
  await page.locator("button[type='submit']").click();

  // 3. Interactive Story Lap
  await page.waitForURL("**/journey");
  await page.waitForTimeout(2000);

  // Quiz beat 1
  const quizOption = page.locator("button:has-text('88,153 laps')");
  if (await quizOption.isVisible()) {
    await quizOption.click();
    await page.waitForTimeout(1500);
  }

  // Provenance Drawer
  await page.locator("text=FREIGHT FOOTPRINT").click();
  await page.waitForTimeout(2000);
  await page.locator("button[aria-label='Close provenance drawer']").click();
  await page.waitForTimeout(1000);

  // 4. Live Carbon Tracker
  await page.goto("/tracker");
  await expect(page.locator("h1")).toContainText("Singapore Grand Prix");
  await page.waitForTimeout(1500);
  await page.locator("button:has-text('Raw tCO₂e Values')").click();
  await page.waitForTimeout(1000);
  await page.locator("button:has-text('Relatable Equivalents')").click();
  await page.waitForTimeout(1500);

  // 5. Sustainable Actions Hub
  await page.goto("/actions");
  await expect(page.locator("h1")).toContainText("What Can You Do This Weekend?");
  await page.waitForTimeout(1000);
  await page.locator("text=SMRT Mass Rapid Transit (MRT)").click();
  await page.waitForTimeout(1200);

  // 6. Share Card
  await page.goto("/share");
  await expect(page.locator("h1")).toContainText("Your Weekend in Impact");
  await page.waitForTimeout(2000);

  // 7. Partner Dashboard
  await page.goto("/partners");
  await expect(page.locator("h1")).toContainText("Partner Impact Intelligence Cockpit");
  await page.waitForTimeout(1500);
  await page.locator("text=Scope 1 Direct GHG Emissions").first().click();
  await page.waitForTimeout(1500);
  await page.locator("button[aria-label='Close provenance drawer']").click();
  await page.waitForTimeout(800);

  // Generate Narrative
  await page.locator("button:has-text('Generate Narrative')").click();
  await page.waitForTimeout(2000);

  // 8. What-If Scenarios
  await page.goto("/partners/scenarios");
  await expect(page.locator("h1")).toContainText("What-If Scenario Modeller");
  await page.waitForTimeout(1500);
  await page.locator("button:has-text('Explain Scenario')").click();
  await page.waitForTimeout(2000);

  // 9. Milestone Feed
  await page.goto("/partners/feed");
  await expect(page.locator("h1")).toContainText("Milestone Alert Feed");
  await page.waitForTimeout(1500);

  // 10. Partner Story Kit
  await page.goto("/partners/story-kit");
  await expect(page.locator("h1")).toContainText("Partner Story Kit");
  await page.waitForTimeout(2000);
});
