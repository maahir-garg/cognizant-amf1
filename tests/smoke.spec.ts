import { test, expect } from "@playwright/test";

test.describe("Impact Lap: Full Golden Path Verification", () => {
  test("Homepage renders and displays dual audience pathways", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Impact Lap/);
    await expect(page.locator("h1")).toContainText("EVERY TENTH OF A SECOND");
    await expect(page.locator("text=Cognizant × Aston Martin Aramco F1").first()).toBeVisible();

    // Verify dual audience cards
    await expect(page.locator("text=Audience A: F1 Fans")).toBeVisible();
    await expect(page.locator("text=Audience B: Cognizant & Partners")).toBeVisible();
  });

  test("Fan Golden Path: Onboarding -> Story Lap -> Carbon Tracker -> Actions -> Share Card", async ({ page }) => {
    // 1. Onboarding
    await page.goto("/onboarding");
    await expect(page.locator("h1")).toContainText("Customise Your Impact Lap");
    await page.locator("text=New Fan").click();
    await page.locator("select").selectOption("Singapore");
    await page.locator("button[type='submit']").click();

    // 2. Interactive Story Lap
    await page.waitForURL("**/journey");
    await expect(page.locator("h2").first()).toContainText("Interactive Impact Lap");
    await expect(page.locator("text=Verified ✓ Zero-Hallucination Guardrail")).toBeVisible();

    // Complete Quiz Beat 1
    const quizOption = page.locator("button:has-text('88,153 laps')");
    await expect(quizOption).toBeVisible();
    await quizOption.click();
    await expect(page.locator("text=Telemetry Verified")).toBeVisible();

    // Test Provenance Drawer
    await page.locator("text=FREIGHT FOOTPRINT").click();
    await expect(page.locator("text=Provenance Audit Record")).toBeVisible();
    await page.locator("button[aria-label='Close provenance drawer']").click();

    // 3. Carbon Tracker
    await page.goto("/tracker");
    await expect(page.locator("h1")).toContainText("Singapore Grand Prix");
    await expect(page.locator("text=Tangible Human-Scale Equivalencies")).toBeVisible();

    // Toggle view mode
    await page.locator("button:has-text('Raw tCO₂e Values')").click();
    await expect(page.locator("text=417.09 tCO₂e").first()).toBeVisible();
    await page.locator("button:has-text('Relatable Equivalents')").click();

    // 4. Sustainable Actions Hub
    await page.goto("/actions");
    await expect(page.locator("h1")).toContainText("What Can You Do This Weekend?");
    await page.locator("text=SMRT Mass Rapid Transit (MRT)").click();
    await expect(page.locator("text=pts").first()).toBeVisible();

    // 5. 9:16 Story Share Card
    await page.goto("/share");
    await expect(page.locator("h1")).toContainText("Your Weekend in Impact");
    await expect(page.locator("text=OFFICIAL IMPACT PASS")).toBeVisible();
    await expect(page.locator("text=1,188").first()).toBeVisible();
    await expect(page.locator("button:has-text('Download Story PNG')")).toBeVisible();
  });

  test("Partner Golden Path: Dashboard -> Provenance -> Narratives -> Scenarios -> Feed -> BI API", async ({ page, request }) => {
    // 1. Partner Dashboard
    await page.goto("/partners");
    await expect(page.locator("h1")).toContainText("Partner Impact Intelligence Cockpit");

    // Provenance Drawer on KPI
    await page.locator("text=Scope 1 Direct GHG Emissions").click();
    await expect(page.locator("text=Provenance Audit Record")).toBeVisible();
    await expect(page.locator("text=Make A Mark ESG Report 2025").first()).toBeVisible();
    await page.locator("button[aria-label='Close provenance drawer']").click();

    // Generate Grounded Narrative
    await page.locator("button:has-text('Generate Narrative')").click();
    await expect(page.locator("text=LinkedIn Post").first()).toBeVisible();
    await expect(page.locator("button:has-text('Copy Text')")).toBeVisible();

    // 2. What-If Scenario Modeller
    await page.goto("/partners/scenarios");
    await expect(page.locator("h1")).toContainText("What-If Scenario Modeller");
    await expect(page.locator("text=Projected Logistics Carbon Abated")).toBeVisible();

    // 3. Milestone Alert Feed
    await page.goto("/partners/feed");
    await expect(page.locator("h1")).toContainText("Milestone Alert Feed");
    await expect(page.locator("text=Suggested Sponsor Campaign Post").first()).toBeVisible();

    // 4. Partner BI JSON API
    const apiRes = await request.get("/api/partner/metrics");
    expect(apiRes.ok()).toBeTruthy();
    const data = await apiRes.json();
    expect(data.organization).toBe("Aston Martin Aramco Formula One Team");
    expect(data.partner).toBe("Cognizant");
    expect(Array.isArray(data.metrics)).toBeTruthy();
    expect(data.metrics.length).toBeGreaterThan(0);
    expect(data.metrics[0].provenance.source_document).toBeDefined();
  });
});
