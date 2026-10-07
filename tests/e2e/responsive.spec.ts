import { expect, test } from "@playwright/test";
import { DESK_ROUTES, ROUTES, watchConsole } from "./helpers";

/**
 * Every route at phone width (390 px, the mobile project) and on the
 * projector (1920 x 1080, the desktop project): no horizontal scroll, the
 * site header in view, no console errors and no failed requests.
 */

const ALL = [...new Set([...ROUTES, ...DESK_ROUTES])];

for (const route of ALL) {
  test(`${route} fits the viewport with the header visible and no errors`, async ({ page }) => {
    const errors = watchConsole(page);
    const failed: string[] = [];
    page.on("requestfailed", (req) => {
      // Next's router prefetches links as `?_rsc=` requests and cancels the
      // ones still in flight when the page is torn down: not a broken request.
      if (req.url().includes("_rsc=") && req.failure()?.errorText === "net::ERR_ABORTED") return;
      failed.push(`${req.method()} ${req.url()}: ${req.failure()?.errorText}`);
    });

    const response = await page.goto(route);
    expect(response?.ok(), `${route} should respond 2xx`).toBeTruthy();
    await page.waitForLoadState("networkidle");

    const header = page.locator("header").first();
    await expect(header).toBeVisible();
    await expect(header.getByRole("link", { name: /the story/i }).first()).toBeVisible();

    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.scrollingElement!.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(scrollWidth, `${route}: page is ${scrollWidth}px wide in a ${innerWidth}px viewport`).toBeLessThanOrEqual(innerWidth);

    // The sticky header stays in view once the page has scrolled.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await expect(header).toBeInViewport();

    expect(errors, `${route} console errors:\n${errors.join("\n")}`).toEqual([]);
    expect(failed, `${route} failed requests:\n${failed.join("\n")}`).toEqual([]);
  });
}

// How it works and Sources are footer links, not headline tabs (mentor feedback, 6 Oct), and stay one click away.
test("the header carries three tabs and the footer reaches the method pages", async ({ page }, testInfo) => {
  await page.goto("/");

  if (testInfo.project.name === "mobile") {
    await page.locator("header").first().getByRole("button", { name: "Menu" }).click();
    const sheet = page.getByRole("dialog");
    await expect(sheet.getByRole("navigation", { name: "Main" }).getByRole("link")).toHaveText(["The story", "Singapore GP", "Partners"]);
    const method = sheet.getByRole("navigation", { name: "Sources and method" });
    await expect(method.getByRole("link")).toHaveText(["Every figure and its page", "How the AI is checked"]);
    await method.getByRole("link", { name: "How the AI is checked" }).click();
    await expect(page).toHaveURL(/\/how-it-works$/);
    await expect(page.getByRole("dialog")).toBeHidden();
  } else {
    const main = page.locator("header").first().getByRole("navigation", { name: "Main" });
    await expect(main.getByRole("link")).toHaveText(["The story", "Singapore GP", "Partners"]);
  }

  await page.locator("footer").getByRole("link", { name: "Every figure and its page" }).click();
  await expect(page).toHaveURL(/\/sources$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.locator("footer").getByRole("link", { name: "How the AI is checked" }).click();
  await expect(page).toHaveURL(/\/how-it-works$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
