import { expect, test, type Page } from "@playwright/test";

/** The optional "Nearest race" choice on the title page and where the story points with it. */

async function freshStory(page: Page) {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
}

test.describe("nearest race", () => {
  test("defaults to Singapore", async ({ page }) => {
    await freshStory(page);
    const picker = page.getByRole("combobox", { name: "Nearest race" });
    await expect(picker).toHaveValue("singapore-2026");
    await expect(page.locator('#circuit a[href="/weekend/singapore-2026#published"]')).toBeAttached();
    await expect(page.getByRole("heading", { name: "Your race weekend at Marina Bay" })).toBeAttached();
    // No pointer to another race at the end when the fan hasn't chosen one.
    await expect(page.locator('#race-weekend a[href^="/weekend/"]:not([href^="/weekend/singapore-2026"])')).toHaveCount(0);
    // Singapore is the fan's race by default, so the chart marks the Marina Bay gap.
    await expect(page.locator("#circuit figure").getByText("Marina Bay (your nearest race)")).toBeAttached();
  });

  test("the choice answers where it was made and marks the race in the chart", async ({ page }) => {
    await freshStory(page);
    const picker = page.getByRole("combobox", { name: "Nearest race" });
    await picker.selectOption("gbr-2025");
    const answer = page.locator("#top p[aria-live], p[aria-live]").first();
    await expect(answer).toContainText("Your race is marked as you scroll.");
    await expect(answer.getByRole("link", { name: /British Grand Prix/ })).toHaveAttribute("href", "/weekend/gbr-2025");
    await expect(page.locator("#circuit figure").getByText("Silverstone (your nearest race)")).toBeAttached();

    // A round outside the chart says so instead of marking nothing.
    await picker.selectOption("mia-2025");
    await expect(page.locator("#circuit figure")).toContainText("the Miami Grand Prix is not in the chart");
  });

  test("past races are labelled as past", async ({ page }) => {
    await freshStory(page);
    const picker = page.getByRole("combobox", { name: "Nearest race" });
    await expect(picker.locator("option", { hasText: "British Grand Prix" })).toHaveText("British Grand Prix · past race, 2025");
    await expect(picker.locator('optgroup[label="Past races: what the team published"] option')).not.toHaveCount(0);
  });

  test("a chosen race is where the story points, and survives a reload", async ({ page }) => {
    await freshStory(page);
    const aiCalls: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/api/ai/")) aiCalls.push(r.url());
    });

    const picker = page.getByRole("combobox", { name: "Nearest race" });
    await picker.selectOption("gbr-2025");
    await expect(picker).toHaveValue("gbr-2025");

    // The circuit chapter and the ending point to the chosen race page; the Singapore exits stay.
    await expect(page.locator('#circuit a[href="/weekend/gbr-2025#published"]')).toBeAttached();
    await expect(page.getByRole("heading", { name: "The next race weekend: Marina Bay" })).toBeAttached();
    await expect(page.locator('#race-weekend a[href="/weekend/singapore-2026#take-part"]')).toBeAttached();

    await page.reload();
    await expect(page.getByRole("combobox", { name: "Nearest race" })).toHaveValue("gbr-2025");

    const link = page.locator('#race-weekend a[href="/weekend/gbr-2025"]');
    await link.scrollIntoViewIfNeeded();
    await expect(link).toBeVisible();
    await expect(link).toHaveText(/British Grand Prix/);
    await expect(page.locator("#race-weekend").getByText(/past race, 2025/)).toBeVisible();

    // The city never reaches generated copy, so choosing a race fetches nothing.
    expect(aiCalls).toEqual([]);

    await link.click();
    await expect(page).toHaveURL(/\/weekend\/gbr-2025$/);
    await expect(page.getByRole("heading", { level: 1, name: "British Grand Prix" })).toBeVisible();
  });
});
