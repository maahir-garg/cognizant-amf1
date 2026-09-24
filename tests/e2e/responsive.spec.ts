import { expect, test } from "@playwright/test";

/**
 * Every route must work at phone width (390 px) and at the projector's
 * 1920x1080 (the desktop-1080p and mobile projects cover both): no
 * horizontal overflow, no console errors, no failed network requests.
 */

const PROFILE = "new.singapore.environment-stem";

const ROUTES = [
  "/",
  "/start",
  `/lap?p=${PROFILE}`,
  `/weekend/singapore-2026?p=${PROFILE}`,
  `/share?p=${PROFILE}`,
  `/act?p=${PROFILE}`,
  "/partners",
  "/partners/narratives",
  "/partners/scenarios",
  "/partners/story-kit",
  "/sources",
];

for (const route of ROUTES) {
  test(`${route} has no horizontal overflow, console errors or failed requests`, async ({ page }) => {
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(String(err)));
    page.on("requestfailed", (req) => {
      const url = req.url();
      // Next's router prefetches links it finds on the page (a `?_rsc=` RSC
      // request) and cancels the in-flight ones on navigation/teardown — an
      // ERR_ABORTED, not a broken request. Every route it prefetches from
      // these pages (/start, /weekend/singapore-2026, /partners, /partners/narratives,
      // /partners/scenarios) is itself a real 200 route (see fan/partner golden
      // path specs), so this is safe to ignore.
      if (url.includes("_rsc=") && req.failure()?.errorText === "net::ERR_ABORTED") return;
      failedRequests.push(`${req.method()} ${url}: ${req.failure()?.errorText}`);
    });

    const response = await page.goto(route);
    expect(response?.ok(), `${route} should respond 2xx`).toBeTruthy();
    await page.waitForLoadState("networkidle");

    const overflow = await page.evaluate(() => {
      const el = document.scrollingElement!;
      return { scrollWidth: el.scrollWidth, innerWidth: window.innerWidth };
    });
    expect(overflow.scrollWidth, `${route}: scrollWidth ${overflow.scrollWidth} > innerWidth ${overflow.innerWidth}`).toBeLessThanOrEqual(
      overflow.innerWidth,
    );

    expect(consoleErrors, `${route} console errors: ${consoleErrors.join("\n")}`).toEqual([]);
    expect(failedRequests, `${route} failed requests: ${failedRequests.join("\n")}`).toEqual([]);
  });
}
