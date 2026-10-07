import { expect, type Locator, type Page } from "@playwright/test";

/** Every public route of the overhauled product, fan pages first. */
export const FAN_ROUTES = ["/", "/weekend/singapore-2026", "/quiz", "/share"] as const;

export const ROUTES = [
  ...FAN_ROUTES,
  "/partners",
  "/partners/check",
  "/partners/narratives",
  "/how-it-works",
  "/sources",
] as const;

/** The rest of the desk, covered by the offline and responsive sweeps. */
export const DESK_ROUTES = [
  "/partners",
  "/partners/narratives",
  "/partners/check",
  "/partners/scenarios",
  "/partners/story-kit",
  "/partners/data-quality",
  "/partners/measures",
  "/partners/export",
] as const;

export const HERO_RACE = "/weekend/singapore-2026";

/**
 * Collects console errors and uncaught page errors for the lifetime of the
 * page. Read `errors` at the end of the test.
 */
export function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
}

/**
 * The provenance drawer is a Radix dialog titled with the fact's metric. A
 * report fact always carries a link to its page ("Open page 19 of the 2025
 * report") and the verbatim quote.
 */
export async function expectDrawerWithPage(page: Page): Promise<Locator> {
  const drawer = page.getByRole("dialog");
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole("link", { name: /^Open page \d+ of the / })).toBeVisible();
  await expect(drawer.getByText(/^Quoted from the page/)).toBeVisible();
  return drawer;
}

export async function closeDrawer(page: Page) {
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
}

/** The text of the page body including closed <details>, sr-only text and the title, without scripts or styles. */
export async function fullPageText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const body = document.body.cloneNode(true) as HTMLElement;
    body.querySelectorAll("script, style, template, noscript").forEach((n) => n.remove());
    const meta = [...document.querySelectorAll('meta[name="description"], meta[property^="og:"]')]
      .map((m) => m.getAttribute("content") ?? "")
      .join(" ");
    return `${document.title}\n${meta}\n${body.textContent ?? ""}`;
  });
}
