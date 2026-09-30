import { expect, test, type Page } from "@playwright/test";
import { CHAPTERS, STORY_TITLE } from "../../lib/story/chapters";
import { closeDrawer, expectDrawerWithPage, watchConsole } from "./helpers";

/**
 * The story at "/": title page with the depth toggle, six scrollytelling
 * chapters with a tracker, and the race-weekend ending. Chapter ids, labels
 * and titles come from lib/story/chapters.ts, so copy edits don't break
 * these tests.
 */

async function freshStory(page: Page) {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
}

test.describe("the story", () => {
  test("has exactly one h1, the title", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(STORY_TITLE);
    await expect(page.getByText(/every figure sourced/)).toBeVisible();
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

  test("chapters, their text and the tracker render without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    for (const c of CHAPTERS) {
      const section = page.locator(`section#${c.id}`);
      await expect(section.getByRole("heading", { level: 2, name: c.title })).toBeVisible();
      // Every step card is in the HTML, and the chapter's generated paragraph is server-rendered and checked.
      await expect(section.locator("article")).toHaveCount(c.steps.length);
      await expect(section.getByText("Figures checked").first()).toBeAttached();
    }
    const tracker = page.getByRole("navigation", { name: "Chapters" });
    for (const c of CHAPTERS) await expect(tracker.locator(`a[href="#${c.id}"]`)).toHaveCount(1);
    await context.close();
  });

  test("a figure in a chapter opens the provenance drawer on its page", async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto("/");
    const figure = page
      .locator("#supply-chain")
      .getByRole("button", { name: /supply chain.*Show source\.$/i })
      .first();
    await figure.scrollIntoViewIfNeeded();
    await expect(figure).toContainText(/Verified/);
    await figure.click();
    const drawer = await expectDrawerWithPage(page);
    await expect(drawer.getByRole("link", { name: /^Open page \d+ of the 2025 report/ })).toBeVisible();
    await closeDrawer(page);
    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("the circuit chapter shows Singapore as a data gap, not a number", async ({ page }) => {
    await page.goto("/");
    const circuit = page.locator("section#circuit");
    const lastCard = circuit.locator("article").last();
    await lastCard.scrollIntoViewIfNeeded();
    await expect(lastCard).toContainText("Singapore");
    const chart = circuit.getByRole("figure", { name: /Singapore is not published/ }).first();
    await expect(chart).toBeAttached();
    await expect(chart.getByText("Data gap", { exact: true })).toBeAttached();
    await expect(chart).toContainText("Singapore trackside energy is not published.");
  });

  test("the depth toggle opens the detail and persists across a reload", async ({ page }) => {
    await freshStory(page);
    const toggle = page.getByRole("group", { name: "How much detail?" });
    const fresh = toggle.getByRole("radio", { name: "New to F1" });
    const watched = toggle.getByRole("radio", { name: "Watched for years" });
    const firstChapter = page.locator(`section#${CHAPTERS[0].id}`);

    // New to F1 (the default): a plain-words recap, the detail closed.
    await expect(fresh).toBeChecked();
    await expect(firstChapter.getByRole("region", { name: "In plain words" })).toBeAttached();
    await expect(firstChapter.locator("details")).not.toHaveAttribute("open");

    await toggle.locator("label", { hasText: "Watched for years" }).click();
    await expect(watched).toBeChecked();
    for (const c of CHAPTERS) await expect(page.locator(`section#${c.id} details`).first()).toHaveAttribute("open");

    await page.reload();
    await expect(watched).toBeChecked();
    await expect(firstChapter.locator("details").first()).toHaveAttribute("open");

    // The race page's quick check reads the same depth.
    await page.goto("/quiz");
    await expect(page.getByRole("radio", { name: /Watched for years/ })).toBeChecked();
  });

  test("the chapter tracker lists every chapter and jumps to it", async ({ page }) => {
    await page.goto("/");
    const tracker = page.getByRole("navigation", { name: "Chapters" });
    const links = tracker.getByRole("link");
    await expect(links).toHaveCount(CHAPTERS.length);
    for (const [i, c] of CHAPTERS.entries())
      await expect(links.nth(i)).toHaveAccessibleName(new RegExp(`^${c.number}\\s?${c.short}$`));

    const last = CHAPTERS.at(-1)!;
    await tracker.locator(`a[href="#${last.id}"]`).click();
    await expect(page).toHaveURL(new RegExp(`#${last.id}$`));
    await expect(page.getByRole("heading", { level: 2, name: last.title })).toBeInViewport();
    await expect(tracker.locator(`a[href="#${last.id}"]`)).toHaveAttribute("aria-current", "step", { timeout: 5_000 });
  });

  test("the ending sends fans to the race page, the quiz and the card", async ({ page }) => {
    await page.goto("/");
    const ending = page.locator("section#race-weekend");
    for (const href of ["/weekend/singapore-2026#take-part", "/weekend/singapore-2026#getting-there", "/quiz"]) {
      await expect(ending.locator(`a[href="${href}"]`)).toHaveCount(1);
    }

    await ending.getByRole("link", { name: "See the programmes" }).click();
    await expect(page).toHaveURL(/\/weekend\/singapore-2026#take-part$/);
    await expect(page.locator("#take-part")).toBeInViewport();

    await page.goBack();
    const card = page.locator("section#race-weekend").getByRole("link", { name: "Make your race-week card" });
    await expect(card).toHaveAttribute("href", "/share");
    await card.click();
    await expect(page).toHaveURL(/\/share$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("card");
  });
});
