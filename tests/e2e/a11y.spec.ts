import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Accessibility gate: axe-core against the same routes as responsive.spec.ts.
 * Fails on `serious` or `critical` violations only — `minor`/`moderate`
 * issues (mostly colour-contrast nuance already covered by the design
 * tokens) are out of scope for the pitch but worth a look after.
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
  test(`${route} has no serious or critical accessibility violations`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const blocking = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");

    if (blocking.length > 0) {
      const detail = blocking
        .map((v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.map((n) => n.target.join(" ")).join("\n  ")}`)
        .join("\n\n");
      expect(blocking, `${route}:\n${detail}`).toEqual([]);
    }
  });
}
