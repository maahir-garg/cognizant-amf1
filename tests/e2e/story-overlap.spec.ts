import { expect, test } from "@playwright/test";

/**
 * Phones: a story card must never cover the chart its step is talking about.
 * For every graphic step, at several scroll positions while that step is the
 * active one, sample the visible chart and check that no point on it is
 * painted by a card.
 */
const PHONES = [
  { width: 390, height: 844 },
  { width: 360, height: 740 },
  { width: 414, height: 896 },
];

for (const viewport of PHONES) {
  test(`phone ${viewport.width}x${viewport.height}: no card covers the chart it describes`, async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "phone layout check; runs once in the mobile project");
    const context = await browser.newContext({ viewport, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");

    const steps = await page.locator('li[data-step][data-box="graphic"]').count();
    expect(steps).toBeGreaterThan(0);

    const problems: string[] = [];
    for (let i = 0; i < steps; i++) {
      // Positions inside the step's active window (its box spans the centre line).
      for (const at of [0.45, 0.2, 0, -0.2, -0.4]) {
        const hit = await page.evaluate(
          async ({ i, at }) => {
            const li = document.querySelectorAll<HTMLElement>('li[data-step][data-box="graphic"]')[i];
            const h = li.getBoundingClientRect().height;
            window.scrollTo(0, li.getBoundingClientRect().top + window.scrollY - (96 + at * h));
            await new Promise((r) => setTimeout(r, 350));
            const stage = li.closest("section")!.querySelector<HTMLElement>("[data-active-step]")!;
            if (Number(stage.dataset.activeStep) !== Number(li.dataset.step)) return null; // not this step's window
            const fig = stage.querySelector<HTMLElement>("[data-active] figure");
            if (!fig) return null;
            const r = fig.getBoundingClientRect();
            const top = Math.max(r.top, 97);
            const bottom = Math.min(r.bottom, window.innerHeight - 1);
            for (let y = top + 2; y < bottom; y += 12) {
              for (let x = r.left + 2; x < r.right; x += 24) {
                const el = document.elementFromPoint(x, y);
                if (el?.closest("article")) return `${li.closest("section")!.id} step ${li.dataset.step}: card at ${Math.round(x)},${Math.round(y)}`;
              }
            }
            return null;
          },
          { i, at },
        );
        if (hit) problems.push(hit);
      }
    }
    expect(problems, problems.join("\n")).toEqual([]);
    await context.close();
  });
}
