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
