import { expect, test, type Page } from "@playwright/test";
import { DESK_ROUTES, ROUTES, watchConsole } from "./helpers";

/**
 * The venue Wi-Fi may be dead: every request that isn't to localhost is
 * aborted, and the app must never try one anyway. Every route renders its
 * heading, generated text comes from the offline cache or the templates,
 * and the fonts are the self-hosted files.
 */

const ALL = [...new Set([...ROUTES, ...DESK_ROUTES])];
const LOCAL = new Set(["localhost", "127.0.0.1", "[::1]"]);

async function blockTheInternet(page: Page) {
  const outside: string[] = [];
  const fonts: string[] = [];
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (route.request().resourceType() === "font") fonts.push(url.href);
    if (LOCAL.has(url.hostname)) return route.continue();
    outside.push(url.href);
    return route.abort("internetdisconnected");
  });
  return { outside, fonts };
}

test.describe("offline demo", () => {
  test("every route renders with no request leaving localhost", async ({ page }) => {
    test.setTimeout(120_000);
    const { outside } = await blockTheInternet(page);
    const errors = watchConsole(page);

    for (const route of ALL) {
      const res = await page.goto(route);
      expect(res?.ok(), `${route} should respond 2xx`).toBeTruthy();
      await page.waitForLoadState("networkidle");
      await expect(page.locator("h1").first(), `${route} heading`).toBeVisible();
    }

    expect(outside, `requests that left localhost:\n${outside.join("\n")}`).toEqual([]);
    expect(errors, `console errors:\n${errors.join("\n")}`).toEqual([]);
  });

  test("generated text renders from the offline cache", async ({ page }) => {
    const { outside } = await blockTheInternet(page);
    await page.goto("/partners/narratives");
    await expect(page.getByRole("button", { name: /^Source \d+: / }).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Figures checked").first()).toBeVisible();
    await page.goto("/share");
    // Fan pages carry one plain line instead of the drafter label.
    await expect(page.getByText("Every number checked against the report").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Drafted (by|from)/)).toHaveCount(0);
    expect(outside).toEqual([]);
  });

  test("fonts are self-hosted and actually load", async ({ page }) => {
    const { fonts } = await blockTheInternet(page);
    await page.goto("/weekend/singapore-2026");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);

    expect(fonts.length, "the page should load its web fonts").toBeGreaterThan(0);
    for (const url of fonts) expect(LOCAL.has(new URL(url).hostname), url).toBe(true);

    const loaded = await page.evaluate(() =>
      [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/["']/g, "")),
    );
    for (const family of ["Newsreader Variable", "Archivo Variable"]) expect(loaded).toContain(family);

    // No stylesheet or preconnect points at a font CDN.
    const remote = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLLinkElement>("link[href]")]
        .map((l) => l.href)
        .filter((h) => /fonts\.(googleapis|gstatic)\.com|use\.typekit|fonts\.bunny/.test(h)),
    );
    expect(remote).toEqual([]);
  });
});
