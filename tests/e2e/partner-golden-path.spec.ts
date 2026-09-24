import { expect, test } from "@playwright/test";

/**
 * Partner golden path: overview (KPI provenance, live milestone alert) ->
 * narratives (citations, copy) -> scenarios (slider-driven outcomes) ->
 * the metrics API in both CSV and JSON. Runs against the production build
 * in demo mode.
 */

test.describe("partner golden path", () => {
  test("overview: KPI provenance and a live milestone alert", async ({ page }) => {
    await page.goto("/partners");

    // Open provenance on a KPI tile.
    const kpiSection = page.locator("section", { hasText: "Key metrics by pillar" });
    await kpiSection.getByRole("button").first().click();
    await expect(page.getByText("Source", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Quoted from the page").or(page.getByText("How it's calculated"))).toBeVisible();
    await page.keyboard.press("Escape");

    // The live panel runs at speed 4; the first milestone (STEM students, at replay
    // t=36s) should fire within about 9s of real time. Give it generous headroom.
    const alert = page.getByText("Simulated milestone").first();
    await expect(alert).toBeVisible({ timeout: 15_000 });

    const alertCard = alert.locator("xpath=ancestor::div[contains(@class,'rounded-md')][1]");
    // Its suggested post carries numbered citation chips (buttons) and the guardrail's Verified badge.
    await expect(alertCard.locator("button.num").first()).toBeVisible({ timeout: 10_000 });
    await expect(alertCard.locator('span[tabindex="0"]', { hasText: "Verified" })).toBeVisible();
  });

  test("narratives: LinkedIn post citations and plain-text copy", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/partners/narratives");

    await expect(page.getByRole("radio", { name: "LinkedIn post" })).toHaveAttribute("data-state", "on");
    await expect(page.locator("button.num").first()).toBeVisible({ timeout: 10_000 });

    const copyButton = page.getByRole("button", { name: /Copy as plain text/ });
    await copyButton.click();
    await expect(page.getByRole("button", { name: /Copied with footnotes/ })).toBeVisible();
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText.length).toBeGreaterThan(20);
    expect(clipboardText).not.toContain("[F:");
  });

  test("scenarios: a slider changes the outcomes table and the explanation", async ({ page }) => {
    await page.goto("/partners/scenarios");

    const table = page.locator("table");
    const before = await table.innerText();

    const slider = page.getByRole("slider").first();
    await slider.focus();
    for (let i = 0; i < 10; i++) await page.keyboard.press("ArrowRight");

    await expect(async () => {
      expect(await table.innerText()).not.toBe(before);
    }).toPass({ timeout: 5_000 });

    await expect(page.getByText("What this means")).toBeVisible();
    await expect(page.locator('span[tabindex="0"]', { hasText: "Verified" }).first()).toBeVisible({ timeout: 10_000 });
  });

  test("metrics API: CSV export and pillar-filtered JSON", async ({ request }) => {
    const csv = await request.get("/api/partner/metrics?format=csv");
    expect(csv.ok()).toBeTruthy();
    expect(csv.headers()["content-type"]).toContain("text/csv");
    const csvBody = await csv.text();
    const lines = csvBody.trim().split("\n");
    expect(lines.length).toBeGreaterThan(1);
    expect(lines[0]).toContain("id");
    expect(lines[0]).toContain("pillar");
    expect(lines[0]).toContain("status");

    const json = await request.get("/api/partner/metrics?pillar=governance");
    expect(json.ok()).toBeTruthy();
    const body = await json.json();
    expect(body.count).toBeGreaterThan(0);
    expect(body.metrics.length).toBe(body.count);
    for (const m of body.metrics) {
      expect(m.pillar).toBe("governance");
    }
  });
});
