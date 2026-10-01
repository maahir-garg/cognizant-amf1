import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { ROUTES } from "./helpers";

/**
 * Accessibility gate: axe-core (WCAG 2.0 and 2.1, A and AA rules) on every
 * main route, at both project sizes. Serious and critical violations fail;
 * minor and moderate ones are left for review.
 */

for (const route of ROUTES) {
  test(`${route} has no serious or critical accessibility violations`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const blocking = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");

    const detail = blocking
      .map((v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.map((n) => n.target.join(" ")).join("\n  ")}`)
      .join("\n\n");
    expect(blocking, `${route}:\n${detail}`).toEqual([]);
  });
}
