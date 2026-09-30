import { expect, test } from "@playwright/test";
import { closeDrawer, expectDrawerWithPage, watchConsole } from "./helpers";

/**
 * /how-it-works for judges and partners. The worked number check is the
 * page's trust moment: the partner's slip (275) is held back, the corrected
 * sentence (257) passes with a citation to the report page.
 */

const sentence = (n: string) =>
  `Make A Mark Day brought ${n} students to the factory for AI, coding and careers sessions with Cognizant.`;

test.describe("how it works", () => {
  test("the worked check holds back 275, then passes 257 with a citation", async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto("/how-it-works");
    await expect(page.locator("h1")).toHaveCount(1);

    const check = page.locator("#check");
    const [slip, fixed] = [check.locator("ol > li").nth(0), check.locator("ol > li").nth(1)];

    await expect(slip.locator("blockquote")).toContainText("275 students");
    await expect(slip.getByText("Deliberate error for this example")).toBeVisible();
    await expect(slip.getByText("Held back", { exact: true })).toBeVisible();
    await expect(slip).toContainText("275 is not in the fact base");

    await expect(fixed.locator("blockquote")).toContainText("257 students");
    await expect(fixed.getByText(/Passes · Figures checked/)).toBeVisible();
    await expect(fixed.getByText("Held back", { exact: true })).toHaveCount(0);
    const cite = fixed.getByRole("button", { name: /2025 report, p\. 59/ });
    await expect(cite).toBeVisible();
    await cite.click();
    await expectDrawerWithPage(page);
    await closeDrawer(page);

    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("the check runs on a sentence of your own", async ({ page }) => {
    await page.goto("/how-it-works");
    const check = page.locator("#check");
    await check.getByText("Check a sentence of your own").click();
    const box = check.getByRole("textbox");
    await expect(box).toHaveValue(sentence("275"));
    await expect(check.locator('[aria-live="polite"]').getByText("Held back", { exact: true })).toBeVisible();

    await box.fill(sentence("257"));
    await expect(check.locator('[aria-live="polite"]').getByText(/Passes · Figures checked/)).toBeVisible();
  });

  test("the worked check is in the server HTML", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/how-it-works");
    const check = page.locator("#check");
    await expect(check.getByText("Held back", { exact: true }).first()).toBeVisible();
    await expect(check.getByText(/Passes · Figures checked/).first()).toBeVisible();
    await context.close();
  });
});
