import { describe, expect, it } from "vitest";
import { checkDraft } from "@/lib/ai/check-draft";
import { facts } from "@/lib/data/load";

const figures = (text: string) => checkDraft(text).findings.filter((f) => f.status !== "context");

describe("checkDraft round 3: a share is never passed as a change", () => {
  it.each([
    ["Emissions fell 81 per cent.", "e25-supply-chain-share"],
    ["Emissions fell 81%.", "e25-supply-chain-share"],
    ["Supply chain emissions are down 81%.", "e25-supply-chain-share"],
    ["The team cut waste by 54%.", "e25-waste-recycled-share"],
    ["Kit recycling rose 47%.", "e25-kit-recycled"],
    ["The supply chain share is 81% lower than before.", "e25-supply-chain-share"],
  ])("%s", (text, factId) => {
    const check = checkDraft(text);
    expect(check.ok).toBe(false);
    const [f] = figures(text);
    expect(f.status).toBe("held");
    expect(f.nearest).toBe(factId);
    expect(f.reason).toMatch(/a share, not a change/);
  });

  it("still passes the same shares written as shares", () => {
    for (const t of [
      "81% of the footprint sits in the supply chain.",
      "The team recycled 54% of its waste.",
      "93% of mentees grew their professional network.",
      "47% of old team kit was recycled into new material.",
    ]) {
      expect(checkDraft(t).ok, t).toBe(true);
    }
  });

  it("still passes published change figures written as changes", () => {
    for (const t of [
      "Travel and logistics emissions fell 14% on the previous year.",
      "Scope 1 and 2 emissions are down 74% on the baseline year.",
      "Sustainable Aviation Fuel cut the team's air-freight emissions by 31%.",
    ]) {
      expect(checkDraft(t).ok, t).toBe(true);
    }
  });

  it("no percentage share in the fact base can be written as a fall and pass", () => {
    const shares = facts.filter(
      (f) => f.unit === "%" && (f.value ?? 0) > 0 && /share|recycled|circularity|position|turnover|hires|women|gap|sentiment/i.test(f.metric),
    );
    expect(shares.length).toBeGreaterThan(5);
    for (const f of shares) {
      const text = `${f.metric} fell ${f.value}%.`;
      expect(checkDraft(text).ok, text).toBe(false);
    }
  });
});
