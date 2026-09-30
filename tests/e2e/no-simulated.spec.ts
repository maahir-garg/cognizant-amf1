import { expect, test } from "@playwright/test";
import { FAN_ROUTES, fullPageText } from "./helpers";

/**
 * Fan pages never show simulated data, disputed figures or the product's
 * old names. The text checked includes closed "detail" disclosures,
 * screen-reader-only labels, the title and the meta description.
 */

const FORBIDDEN: [RegExp, string][] = [
  [/\bsimulated\b/i, "the Simulated status"],
  [/source conflict/i, "a disputed-figure flag"],
  [/impact lap/i, "the old product name"],
  [/impact credits?/i, "the removed credits"],
  [/pit lane classroom/i, "the removed illustrative initiative"],
];

/** A past Singapore round, a European round with trackside data and a fly-away. */
const RACE_PAGES = ["/weekend/singapore-2025", "/weekend/gbr-2025", "/weekend/can-2024"];

for (const route of [...FAN_ROUTES, ...RACE_PAGES]) {
  test(`${route} has no simulated, disputed or retired content`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    const text = await fullPageText(page);
    for (const [pattern, what] of FORBIDDEN) {
      const hit = pattern.exec(text);
      const context = hit ? text.slice(Math.max(0, hit.index - 60), hit.index + 60).replace(/\s+/g, " ") : "";
      expect(hit, `${route} shows ${what}: "…${context}…"`).toBeNull();
    }
  });
}
