import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Fan golden path: onboarding -> lap (sectors + quiz beats) -> weekend view
 * (equivalents, provenance, matched initiatives) -> share card export -> act
 * (log a trip, earn simulated credits). Runs against the production build in
 * demo mode, so this is exactly what the live pitch demo does.
 */

async function clearStorage(page: Page) {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
}

/** Locates a <QuizBeat> root: the div whose direct child is `<p class="label">Quiz beat</p>`. */
function quizBeats(page: Page): Locator {
  return page.locator('div:has(> p.label:text-is("Quiz beat"))');
}

async function answerQuizBeat(beat: Locator) {
  await beat.scrollIntoViewIfNeeded();
  await beat.getByRole("button").first().click();
  await expect(beat.getByText(/^(Correct|Not quite)$/)).toBeVisible();
  // The reveal shows the cited fact with its trust status.
  await expect(beat.getByText(/^(Verified|Estimated|Simulated)$/)).toBeVisible();
}

test.describe("fan golden path", () => {
  test("onboarding through lap, weekend, share and act", async ({ page }) => {
    await clearStorage(page);

    // ---- /start: onboard as "New to F1", Singapore, Environment + STEM ----
    await page.goto("/start");
    await page.getByRole("button", { name: /New to F1/ }).click();
    await page.getByRole("combobox", { name: "Home city" }).click();
    await page.getByRole("option", { name: "Singapore, Singapore" }).click();
    await page.getByRole("button", { name: "Environment", exact: true }).click();
    await page.getByRole("button", { name: "STEM", exact: true }).click();
    await expect(page.getByText(/sectors/)).toBeVisible();
    await page.getByRole("button", { name: "Start your lap" }).click();

    // ---- /lap: sector 1 (Environment) has quizzes for a "new" fan ----
    await expect(page).toHaveURL(/\/lap$/);
    await expect(page.getByText("S1 · ENVIRONMENT", { exact: true })).toBeVisible();

    // The sector's own AI text renders a "Verified" guardrail badge (a tooltip-triggered
    // span, distinct from a plain FactValue's status badge, which carries no tabindex).
    await expect(page.locator('span[tabindex="0"]', { hasText: "Verified" }).first()).toBeVisible({
      timeout: 15_000,
    });

    const beats = quizBeats(page);
    const beatCount = await beats.count();
    expect(beatCount).toBeGreaterThanOrEqual(3);
    for (let i = 0; i < 3; i++) {
      await answerQuizBeat(beats.nth(i));
    }

    // Walk to the end of the lap (sectors -> scrutineering -> finish).
    for (let i = 0; i < 4; i++) {
      await page.getByRole("button", { name: "Next" }).click();
    }
    await expect(page.getByText("Lap complete")).toBeVisible();

    // ---- /weekend/singapore-2026: equivalents, provenance, matched initiatives ----
    await page.getByRole("link", { name: /Your weekend: Singapore GP/ }).click();
    await expect(page).toHaveURL(/\/weekend\/singapore-2026/);

    // Switch the equivalents unit away from the F1-native default; the panel shows the Estimated label.
    const equivalentsPanel = page.getByRole("radiogroup").locator("xpath=..");
    const beforeValue = await equivalentsPanel.locator("span.num.text-5xl, span.num.text-6xl").first().innerText();
    await page.getByRole("radio", { name: "London–New York return flights" }).click();
    await expect(equivalentsPanel.getByText("Estimated", { exact: true })).toBeVisible();
    await expect(equivalentsPanel.locator("span.num.text-5xl, span.num.text-6xl").first()).not.toHaveText(beforeValue);

    await expect(page.getByText("Data gap")).toBeVisible();

    await expect(page.getByText("Matched for you")).toBeVisible();
    await expect(page.locator("article").first()).toBeVisible();

    // Open a provenance drawer from a number in the page copy.
    await page.getByRole("button", { name: "14%", exact: true }).click();
    await expect(page.getByText("Source", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Quoted from the page")).toBeVisible();
    await expect(page.getByText(/travel and logistics emissions/i).first()).toBeVisible();
    await page.keyboard.press("Escape");

    // ---- /share: download the 1080x1920 PNG ----
    await page.goto("/share?p=new.singapore.environment-stem");
    const downloadButton = page.getByRole("button", { name: "Download PNG" });
    await expect(downloadButton).toBeEnabled({ timeout: 15_000 });
    const [download] = await Promise.all([page.waitForEvent("download"), downloadButton.click()]);
    const path = await download.path();
    expect(path).toBeTruthy();
    const { readFile } = await import("node:fs/promises");
    const buf = await readFile(path!);
    // PNG signature (8 bytes) + IHDR chunk length (4) + "IHDR" (4) + width (4, BE) + height (4, BE).
    expect(buf.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    expect(width).toBe(1080);
    expect(height).toBe(1920);

    // ---- /act: pick a lower-carbon trip, log it, credits increase and are labelled Simulated ----
    await page.goto("/act?p=new.singapore.environment-stem");
    await page.getByRole("tab", { name: "Get to the circuit" }).click();
    await page.getByRole("button", { name: /Walk or cycle/ }).click();
    await page.getByRole("button", { name: "Log this trip" }).click();
    await expect(page.getByText(/impact credit.* logged/)).toBeVisible();

    await page.getByRole("tab", { name: "Your programme" }).click();
    await expect(page.getByText("Impact credits", { exact: true })).toBeVisible();
    const total = page.locator("p.num.text-6xl");
    await expect(total).toHaveText(/[1-9]\d*/);
    await expect(page.getByText("Simulated", { exact: true }).first()).toBeVisible();
  });
});
