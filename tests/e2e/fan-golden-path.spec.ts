import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { closeDrawer, expectDrawerWithPage, HERO_RACE, watchConsole } from "./helpers";

/**
 * Fan golden path after the overhaul: the Singapore race page (what the team
 * published, real programmes, getting there, a figure's source) -> the quick
 * check (badge, a cited figure after every answer) -> the race-week card
 * (chosen facts with status, PNG export). Runs against the production build
 * in demo mode, which is what the offline pitch demo serves.
 *
 * The story at "/" has its own spec (story.spec.ts).
 */

type Initiative = { id: string; name: string; status: string };

async function initiatives(): Promise<Initiative[]> {
  const file = path.resolve(__dirname, "../../data/initiatives.json");
  return JSON.parse(await readFile(file, "utf8")) as Initiative[];
}

async function fresh(page: Page) {
  await page.goto("/quiz");
  await page.evaluate(() => window.localStorage.clear());
}

test.describe("fan golden path", () => {
  test("Singapore race page: sections, data gap, programmes and a sourced figure", async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(HERO_RACE);

    await expect(page.getByRole("heading", { level: 1, name: "Singapore Grand Prix" })).toBeVisible();

    // Every section the page promises is there, and the "On this page" nav points at it.
    const nav = page.getByRole("navigation", { name: "On this page" });
    for (const id of ["published", "take-part", "getting-there", "quick-check", "season"]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
      await expect(nav.locator(`a[href="#${id}"]`)).toHaveCount(1);
    }

    // Singapore trackside energy is not published: a gap, not a guess.
    const published = page.locator("#published");
    await expect(published.getByText("Data gap: trackside energy")).toBeVisible();
    await expect(published).toContainText("night race");

    // Take part: only programmes the fact base holds as verified, and at least the two the demo names.
    const all = await initiatives();
    const verified = new Set(all.filter((i) => i.status === "verified").map((i) => i.name));
    const names = await page.locator("#take-part article h3").allInnerTexts();
    expect(names.length).toBeGreaterThanOrEqual(2);
    for (const name of names) expect(verified, `"${name}" should be a verified programme`).toContain(name);
    expect(names.some((n) => /STEM Racing/.test(n))).toBe(true);
    expect(names.some((n) => /Unearth Your Greatness/.test(n))).toBe(true);

    // A figure opens the provenance drawer on its report page.
    await published
      .getByRole("button", { name: /Show source\.$/ })
      .first()
      .click();
    await expectDrawerWithPage(page);
    await closeDrawer(page);

    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("getting there: GET params render an Estimated ratio, never laps", async ({ page }) => {
    await page.goto(`${HERO_RACE}?km=12&mode=mrt#getting-there`);
    const section = page.locator("#getting-there");
    await expect(section.getByRole("group", { name: "How you'll get there" }).getByRole("radio", { name: /MRT/ })).toBeChecked();
    await expect(page.locator("#trip-km")).toHaveValue("12");

    const result = section.locator('[aria-live="polite"]');
    await expect(result.getByText("Estimated", { exact: true })).toBeVisible();
    await expect(result).toContainText(/(of|than) a taxi's emissions/i);
    await expect(result).toContainText(/driving alone/i);
    // The result follows every change, so the no-JavaScript Compare button stays hidden.
    await expect(section.getByRole("button", { name: "Compare" })).toHaveCount(0);
    await expect(section).not.toContainText(/\blaps?\b/i);

    // Switching mode updates the comparison in place.
    await section.locator("label", { hasText: "Taxi or ride-hail" }).click();
    await expect(section.getByRole("radio", { name: /Taxi/ })).toBeChecked();
    await expect(result).toContainText(/driving alone/i);
    await expect(section).not.toContainText(/\blaps?\b/i);
  });

  test("the travel plan survives a trip to the card and back", async ({ page }) => {
    await fresh(page);
    const section = page.locator("#getting-there");
    const preview = page.getByRole("img", { name: /^Card preview/ });

    await page.goto(HERO_RACE);
    await section.locator("label", { hasText: "Public bus" }).click();
    await expect(section.getByRole("radio", { name: /Public bus/ })).toBeChecked();

    await page.goto("/share");
    await expect(preview).toHaveAttribute("aria-label", /the bus to Marina Bay/);

    // Coming back to the race page must start from the saved plan, not reset it to the default.
    await page.goto(HERO_RACE);
    await expect(section.getByRole("radio", { name: /Public bus/ })).toBeChecked();

    await page.goto("/share");
    await expect(preview).toHaveAttribute("aria-label", /the bus to Marina Bay/);
  });

  test("getting there works without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(`${HERO_RACE}?km=20&mode=bus#getting-there`);
    const section = page.locator("#getting-there");
    await expect(section.getByText("Estimated", { exact: true }).first()).toBeVisible();
    await expect(section).toContainText(/less than a taxi's emissions/i);
    await expect(section.getByRole("button", { name: "Compare" })).toBeVisible();
    await expect(section).not.toContainText(/\blaps?\b/i);
    await context.close();
  });

  test("quick check -> badge -> race-week card export", async ({ page }) => {
    const errors = watchConsole(page);
    await fresh(page);

    // ---- /quiz: answer every question; each reveal shows the cited figure with its status ----
    await page.goto("/quiz");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Quick check/);
    const questions = page.locator("ol > li");
    const total = await questions.count();
    expect(total).toBeGreaterThanOrEqual(3);

    for (let i = 0; i < total; i++) {
      const q = questions.nth(i);
      await q.locator("label").first().click();
      // The verdict line only: the AI reveal below can also start with "Not quite".
      await expect(q.getByText(/^(✓ Correct, and the report agrees\.|Not quite\. Here's what the report says\.)$/)).toBeVisible();
      const figure = q.getByRole("button", { name: /Show source\.$/ });
      await expect(figure).toBeVisible();
      await expect(figure).toContainText(/Verified|Estimated/);
      // The grounded explanation arrives from the offline cache or the template, with its plain check label (fan pages never name the drafter).
      await expect(q.getByText("Every number checked against the report")).toBeVisible({ timeout: 15_000 });
    }

    await expect(page.getByText("Badge earned")).toBeVisible();
    await expect(page.getByText("Pit-wall ready").first()).toBeVisible();

    // The cited figure after an answer opens its source.
    await questions
      .first()
      .getByRole("button", { name: /Show source\.$/ })
      .click();
    await expectDrawerWithPage(page);
    await closeDrawer(page);

    // ---- /share: the preview carries the chosen facts, their status and the badge ----
    await page.getByRole("link", { name: /Add it to your card/ }).click();
    await expect(page).toHaveURL(/\/share$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("card");

    const preview = page.getByRole("img", { name: /^Card preview/ });
    await expect(preview).toBeVisible();
    await expect(preview.getByText("Pit-wall ready")).toBeVisible();

    // Pick one more figure and check it lands on the card with a status label.
    const figures = page.getByRole("group", { name: /Team figures/ });
    const unchecked = figures.locator("label:has(input[type=checkbox]:not(:checked):not(:disabled))").first();
    const value = (await unchecked.locator("span.num").innerText()).trim();
    await unchecked.click();
    await expect(preview).toContainText(value);
    const statuses = await preview.getByText(/^(Verified|Estimated)$/).count();
    const shownFigures = await figures.locator("input[type=checkbox]:checked").count();
    expect(statuses).toBeGreaterThanOrEqual(shownFigures);

    // ---- Export: a real 1080 x 1920 PNG, big enough to hold the car image and fonts ----
    const save = page.getByRole("button", { name: "Save the card" });
    await expect(save).toBeEnabled();
    const [download] = await Promise.all([page.waitForEvent("download", { timeout: 30_000 }), save.click()]);
    expect(download.suggestedFilename()).toMatch(/\.png$/);
    const file = await download.path();
    const buf = await readFile(file!);
    expect(buf.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(buf.readUInt32BE(16)).toBe(1080);
    expect(buf.readUInt32BE(20)).toBe(1920);
    expect(buf.byteLength).toBeGreaterThan(50 * 1024);

    expect(errors, errors.join("\n")).toEqual([]);
  });
});
