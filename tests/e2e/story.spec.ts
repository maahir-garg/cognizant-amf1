import { expect, test } from "@playwright/test";
import { closeDrawer, expectDrawerWithPage } from "./helpers";

/**
 * The story at "/". Until the scrollytelling page merges, "/" is a title
 * placeholder, so only what holds for both is asserted; the deeper checks
 * are written and marked fixme so they switch on with one edit.
 */

const CHAPTERS = ["campus", "supply chain", "moving the team", "at the circuit", "beyond the track", "finish line"] as const;

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

  /*
   * TODO(story merge): remove the fixme markers below once the scrollytelling
   * page lands on rebuild/overhaul, then check the selectors against it:
   * - all six chapter headings are in the server HTML (JavaScript off);
   * - clicking a figure in a chapter opens the provenance drawer on its page;
   * - the depth toggle ("New to F1" / "Watched for years") survives a reload
   *   and opens "The detail" by default for "Watched for years";
   * - the chapter tracker lists the six chapters;
   * - the ending links to /weekend/singapore-2026#take-part, #getting-there,
   *   /quiz, and the primary "Make your race-week card" button goes to /share.
   */

  test.fixme("chapter headings render without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    const headings = (await page.locator("h2").allInnerTexts()).map((h) => h.toLowerCase());
    for (const chapter of CHAPTERS)
      expect(
        headings.some((h) => h.includes(chapter)),
        `chapter "${chapter}"`,
      ).toBe(true);
    await context.close();
  });

  test.fixme("a figure in the story opens its source", async ({ page }) => {
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

  test.fixme("the depth toggle persists across a reload", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    const watched = page.getByRole("radio", { name: "Watched for years" });
    await expect(page.getByRole("radio", { name: "New to F1" })).toBeChecked();
    await page.locator("label", { hasText: "Watched for years" }).first().click();
    await expect(watched).toBeChecked();
    await page.reload();
    await expect(watched).toBeChecked();
    // Long-time fans get the detail open by default.
    await expect(page.locator("details[open]").first()).toBeAttached();
  });

  test.fixme("the chapter tracker lists every chapter", async ({ page }) => {
    await page.goto("/");
    const tracker = page.getByRole("navigation", { name: /chapter/i });
    const items = (await tracker.getByRole("link").allInnerTexts()).map((t) => t.toLowerCase());
    for (const chapter of CHAPTERS)
      expect(
        items.some((t) => t.includes(chapter)),
        `tracker "${chapter}"`,
      ).toBe(true);
  });

  test.fixme("the ending sends fans to the race page, the quiz and the card", async ({ page }) => {
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
