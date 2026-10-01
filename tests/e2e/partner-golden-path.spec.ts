import { expect, test } from "@playwright/test";
import { closeDrawer, expectDrawerWithPage, watchConsole } from "./helpers";

/**
 * Impact desk golden path: this race week -> Narratives (LinkedIn draft,
 * citations, approval unlocks copying) -> Check my draft (the demo's 257 vs
 * 275 trust moment) -> Scenarios -> Story kit co-branding -> Data quality ->
 * ROI -> the metrics export. Runs against the production build in demo mode.
 */

const DEMO_LINE = "Make A Mark Day brought 257 students to the factory for AI, coding and careers sessions with partners including Cognizant.";
const TYPO_LINE = DEMO_LINE.replace("257", "275");

test.describe("partner golden path", () => {
  test("this race week renders the Singapore desk", async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto("/partners");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Singapore Grand Prix");
    await expect(
      page.getByRole("navigation", { name: "Impact desk" }).getByRole("link", { name: "This race week" }),
    ).toHaveAttribute("aria-current", "page");
    for (const title of ["Published for this race", "Progress figures to use", "Joint with Cognizant", "Not published", "Suggested post"]) {
      await expect(page.getByRole("heading", { name: title })).toBeVisible();
    }
    await expect(page.getByText(/^Data gap · /).first()).toBeVisible();
    await expect(page.getByText(/Updated when the team publishes/).first()).toBeVisible();
    // The suggested post is a Singapore angle, with its own approval trail.
    await expect(page.getByText(/races at the Singapore Grand Prix this week/)).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("#suggested").getByRole("button", { name: "Send for review" })).toBeVisible();
    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("narratives: a cited LinkedIn draft goes draft -> in review -> approved, which unlocks copying", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/partners/narratives");

    await page.locator("label", { hasText: "LinkedIn post" }).click();
    await expect(page.getByRole("radio", { name: /LinkedIn post/ })).toBeChecked();

    const draft = page.getByRole("article", { name: "LinkedIn post draft" });
    const chips = draft.getByRole("button", { name: /^Source \d+: / });
    await expect(chips.first()).toBeVisible({ timeout: 15_000 });
    await expect(draft.getByText("Figures checked")).toBeVisible();

    // A citation chip opens the report page it came from.
    // Open a chip for a report figure (the partnership title comes from the team website, which has no page).
    await draft.getByRole("button", { name: /^Source \d+: Students engaged/ }).first().click();
    await expectDrawerWithPage(page);
    await closeDrawer(page);

    const approval = draft.getByRole("region", { name: "Approval" });
    const copy = approval.getByRole("button", { name: /Copy with footnotes/ });
    await expect(copy).toBeDisabled();

    await approval.getByRole("button", { name: "Send for review" }).click();
    await expect(approval.getByText(/^In review since/)).toBeVisible();
    await expect(copy).toBeDisabled();

    const approve = approval.getByRole("button", { name: "Approve" });
    await expect(approve).toBeDisabled();
    await approval.getByLabel("Reviewer").fill("Test Reviewer");
    await approve.click();

    await expect(approval.getByText("Approved by Test Reviewer", { exact: true })).toBeVisible();
    await expect(copy).toBeEnabled();
    await copy.click();
    await expect(approval.getByRole("button", { name: "Copied" })).toBeVisible();
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard.length).toBeGreaterThan(40);
    expect(clipboard).not.toContain("[F:");
  });

  test("check my draft: 257 passes with a citation, 275 is held back and one click fixes it", async ({ page }) => {
    await page.goto("/partners/check");
    const input = page.getByLabel("Your draft");
    const summary = page.getByText(/matched · \d+ need wording · \d+ held back/);

    // The checker opens empty; the example is a button away.
    await expect(input).toHaveValue("");
    await page.getByRole("button", { name: "Try the example" }).click();
    await expect(input).not.toHaveValue("");
    await page.getByRole("button", { name: "Clear" }).click();
    await expect(input).toHaveValue("");

    await input.fill(DEMO_LINE);
    await expect(summary).toContainText("✓ 1 matched · 0 need wording · 0 held back");
    const chip = page.getByRole("button", { name: /^Source 1: / });
    await expect(chip).toBeVisible();
    await expect(page.getByRole("cell", { name: "257", exact: true })).toBeVisible();
    await expect(page.getByText(/p\. 59/).first()).toBeVisible();
    await chip.click();
    await expectDrawerWithPage(page);
    await closeDrawer(page);
    await expect(page.getByRole("button", { name: "Send for review" })).toBeEnabled();

    await input.fill(TYPO_LINE);
    await expect(summary).toContainText("0 matched · 0 need wording · 1 held back");
    await expect(summary).not.toContainText("✓");
    await expect(page.getByRole("cell", { name: /Held back/ })).toBeVisible();
    await expect(page.getByRole("cell", { name: "275", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Send for review" })).toBeDisabled();

    await page.getByRole("button", { name: "Use the published figure" }).click();
    await expect(input).toHaveValue(DEMO_LINE);
    await expect(summary).toContainText("✓ 1 matched · 0 need wording · 0 held back");
  });

  test("check my draft: right numbers in the wrong framing never pass green", async ({ page }) => {
    await page.goto("/partners/check");
    await page.getByRole("button", { name: "Try right numbers, wrong framing" }).click();
    const summary = page.getByText(/matched · \d+ need wording · \d+ held back/);
    await expect(summary).toContainText("0 matched · 5 need wording · 1 held back");
    await expect(page.getByRole("cell", { name: "Matched", exact: true })).toHaveCount(0);
    await expect(page.getByText(/count of students, not schools/)).toBeVisible();
    await expect(page.getByText(/European races only/).first()).toBeVisible();
    await expect(page.getByText(/Don't compare yearly totals/).first()).toBeVisible();
    await expect(page.getByText(/not unequal pay/).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Send for review" })).toBeDisabled();
  });

  test("scenarios: every output is labelled Estimated", async ({ page }) => {
    await page.goto("/partners/scenarios");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("joint programmes");
    // Joint programmes only: the SAF lever is gone.
    await expect(page.getByRole("slider", { name: /SAF|aviation fuel/i })).toHaveCount(0);
    const rows = page.locator("table").first().locator("tbody tr:has(td)");
    expect(await rows.count()).toBeGreaterThan(0);
    for (const row of await rows.all()) await expect(row).toContainText("Estimated");

    // Moving a lever changes the projection, which stays Estimated.
    const table = page.locator("table").first();
    const before = await table.innerText();
    await page.getByRole("slider").first().focus();
    for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowRight");
    await expect.poll(() => table.innerText()).not.toBe(before);
    await expect(page.getByRole("heading", { name: "Projected outcomes" }).locator("xpath=..")).toContainText("Estimated");
  });

  test("story kit: an Aleto card is co-branded without Cognizant", async ({ page }) => {
    await page.goto("/partners/story-kit");
    await page.getByLabel("Community or charity partner").selectOption("aleto-leadership");
    await expect(page.getByText("The Aleto Foundation × Aston Martin Aramco").first()).toBeVisible();

    const card = page.getByRole("heading", { name: "Share card" }).locator("xpath=../..");
    await expect(card).toContainText("The Aleto Foundation");
    await expect(card).not.toContainText("Cognizant");
    for (const size of ["9:16", "1.91:1"]) await expect(card.getByText(`${size} · `)).toBeVisible();

    // The funder paragraph format exists and drafts with numbered footnotes.
    await page.locator("label", { hasText: "Funder report paragraph" }).click();
    await expect(page.getByText("Figures checked").first()).toBeVisible({ timeout: 15_000 });
  });

  test("data quality lists the flags; ROI shows unmeasured pilot slots", async ({ page }) => {
    await page.goto("/partners/data-quality");
    for (const kind of ["source-conflict", "restated", "inconsistent-equivalence"]) {
      await expect(page.locator(`#${kind}-heading`)).toBeVisible();
    }
    expect(await page.locator("tbody tr").count()).toBeGreaterThan(3);

    await page.goto("/partners/roi");
    await expect(page.getByRole("heading", { name: "Published baselines" })).toBeVisible();
    const slots = page.getByText(/^Not measured yet · /);
    expect(await slots.count()).toBeGreaterThanOrEqual(3);
    await expect(page.getByText("Charity time saved")).toBeVisible();
    // The cost range is our assumption, never presented as a team figure.
    await expect(page.getByText("Assumption · not a team or Cognizant figure")).toBeVisible();
    // Baselines are real report figures, each with a status.
    await expect(
      page
        .locator("#baselines")
        .getByRole("button", { name: /\. verified\. .*Show source\.$/ })
        .first(),
    ).toBeVisible();
  });

  test("export: CSV and JSON endpoints return the fact base with the right types", async ({ page, request }) => {
    await page.goto("/partners/export");
    const csvLink = page.getByRole("link", { name: "CSV" }).first();
    await expect(csvLink).toHaveAttribute("href", /format=csv/);

    const csv = await request.get("/api/partner/metrics?format=csv");
    expect(csv.status()).toBe(200);
    expect(csv.headers()["content-type"]).toContain("text/csv");
    const lines = (await csv.text()).trim().split("\n");
    expect(lines.length).toBeGreaterThan(10);
    for (const col of ["id", "pillar", "status"]) expect(lines[0]).toContain(col);

    const json = await request.get("/api/partner/metrics?pillar=community");
    expect(json.status()).toBe(200);
    expect(json.headers()["content-type"]).toContain("application/json");
    const body = await json.json();
    expect(body.count).toBeGreaterThan(0);
    expect(body.metrics).toHaveLength(body.count);
    for (const m of body.metrics) {
      expect(m.pillar).toBe("community");
      expect(m.status).not.toBe("simulated");
    }
  });
});
