import { expect, test } from "@playwright/test";

/**
 * The demo must survive a dead Wi-Fi connection at the venue: every request
 * whose host isn't localhost is aborted, and the app should never attempt
 * one anyway (fonts are self-hosted, AI text comes from the demo cache, the
 * live feed is same-origin SSE with a local fallback).
 */

const FAN_PATH = [
  "/",
  "/start",
  "/lap?p=new.singapore.environment-stem",
  "/weekend/singapore-2026?p=new.singapore.environment-stem",
  "/share?p=new.singapore.environment-stem",
  "/act?p=new.singapore.environment-stem",
];

const PARTNER_PATH = ["/partners", "/partners/narratives", "/partners/scenarios", "/partners/story-kit"];

async function withOfflineGuard(
  page: import("@playwright/test").Page,
  run: (aborted: string[], errors: string[]) => Promise<void>,
) {
  const aborted: string[] = [];
  const errors: string[] = [];
  await page.route("**/*", (route) => {
    const host = new URL(route.request().url()).hostname;
    if (host === "localhost" || host === "127.0.0.1") return route.continue();
    aborted.push(route.request().url());
    return route.abort();
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  await run(aborted, errors);
}

test.describe("offline demo resilience", () => {
  test("fan path renders fully offline with AI text and no errors", async ({ page }) => {
    await withOfflineGuard(page, async (aborted, errors) => {
      for (const path of FAN_PATH) {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
      }
      // AI text rendered (the guardrail's Verified badge) on the lap page.
      await page.goto("/lap?p=new.singapore.environment-stem");
      await expect(page.locator('span[tabindex="0"]', { hasText: "Verified" }).first()).toBeVisible({
        timeout: 10_000,
      });

      expect(aborted, `should never attempt a non-localhost request: ${aborted.join(", ")}`).toEqual([]);
      expect(errors, `no console errors: ${errors.join(", ")}`).toEqual([]);
    });
  });

  test("partner path renders fully offline with AI text and no errors", async ({ page }) => {
    await withOfflineGuard(page, async (aborted, errors) => {
      for (const path of PARTNER_PATH) {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
      }
      await page.goto("/partners/narratives");
      await expect(page.locator("button.num").first()).toBeVisible({ timeout: 10_000 });

      expect(aborted, `should never attempt a non-localhost request: ${aborted.join(", ")}`).toEqual([]);
      expect(errors, `no console errors: ${errors.join(", ")}`).toEqual([]);
    });
  });

  test("the live feed (SSE or its local fallback) advances offline", async ({ page }) => {
    await withOfflineGuard(page, async (aborted, errors) => {
      await page.goto("/weekend/singapore-2026?p=new.singapore.environment-stem");
      const livePanel = page.locator("section", { hasText: "Live feed" });
      const counter = livePanel.locator("span.num.text-xl.font-semibold.text-ink").first();
      await expect(counter).toBeVisible();
      const before = await counter.innerText();
      await expect(async () => {
        expect(await counter.innerText()).not.toBe(before);
      }).toPass({ timeout: 10_000 });

      expect(aborted, `should never attempt a non-localhost request: ${aborted.join(", ")}`).toEqual([]);
      expect(errors, `no console errors: ${errors.join(", ")}`).toEqual([]);
    });
  });
});
