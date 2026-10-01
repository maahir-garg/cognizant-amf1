import { expect, test } from "@playwright/test";
import { closeDrawer, expectDrawerWithPage } from "./helpers";

/** The story at "/": title page, six chapters with one name each, and the race-weekend ending. */

const CHAPTERS = ["the campus", "the supply chain", "moving the team", "at the circuit", "beyond the track", "the finish line"] as const;

test.describe("the story", () => {
  test("has exactly one h1", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toBeVisible();
  });

  for (const old of ["/start", "/lap", "/act"]) {
    test(`${old} redirects to the story`, async ({ page, request }) => {
      const res = await request.get(old, { maxRedirects: 0 });
      expect([301, 307, 308]).toContain(res.status());
      expect(new URL(res.headers()["location"], "http://x").pathname).toBe("/");

      await page.goto(old);
      await expect(page).toHaveURL(/\/$/);
    });
  }

  test("chapter headings render without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("h2")).not.toHaveCount(0);
    // Each chapter's one name sits in its label ("Chapter 3 of 6 · Moving the team").
    const labels = (await page.locator("section[id] > header .kicker").allInnerTexts()).map((h) => h.toLowerCase());
    for (const chapter of CHAPTERS)
      expect(
        labels.some((h) => h.endsWith(chapter)),
        `chapter "${chapter}"`,
      ).toBe(true);
    // Every step card is in the HTML.
    await expect(page.locator("li[data-step] article").first()).toBeVisible();
    await context.close();
  });

  test("a figure in the story opens its source", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("button", { name: /Show source\.$/ })
      .first()
      .scrollIntoViewIfNeeded();
    await page
      .getByRole("button", { name: /Show source\.$/ })
      .first()
      .click();
    await expectDrawerWithPage(page);
    await closeDrawer(page);
  });

  test("the depth toggle persists across a reload", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    // The title page toggle; the chapter tracker carries a second copy mid-story.
    const watched = page.getByRole("radio", { name: "Watched for years" }).first();
    await expect(page.getByRole("radio", { name: "New to F1" }).first()).toBeChecked();
    await page.locator("label", { hasText: "Watched for years" }).first().click();
    await expect(watched).toBeChecked();
    await page.reload();
    await expect(watched).toBeChecked();
    // Long-time fans get the denser brief at the top of each chapter; the detail stays one tap away.
    await expect(page.getByRole("heading", { name: "In brief" }).first()).toBeAttached();
  });

  test("the chapter tracker lists every chapter", async ({ page }) => {
    await page.goto("/");
    const tracker = page.getByRole("navigation", { name: /chapter/i });
    // Phones fold the chapter list (and the depth toggle) behind one button.
    const menu = tracker.getByText("Chapters and detail");
    if (await menu.isVisible()) await menu.click();
    const items = (await tracker.getByRole("link").allInnerTexts()).map((t) => t.toLowerCase());
    for (const chapter of CHAPTERS)
      expect(
        items.some((t) => t.includes(chapter)),
        `tracker "${chapter}"`,
      ).toBe(true);
  });

  test("the ending sends fans to the race page, the quiz and the card", async ({ page }) => {
    await page.goto("/");
    for (const href of ["/weekend/singapore-2026#take-part", "/weekend/singapore-2026#getting-there", "/quiz"]) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeAttached();
    }
    const card = page.getByRole("link", { name: "Make your race-week card" });
    await expect(card).toHaveAttribute("href", /^\/share/);
    await card.scrollIntoViewIfNeeded();
    await card.click();
    await expect(page).toHaveURL(/\/share/);
  });
});
