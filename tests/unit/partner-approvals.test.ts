import { describe, expect, it } from "vitest";
import { initiatives } from "@/lib/data/load";
import { auditFacts, canCopy, draftKey, newRecord, parseStored, transition } from "@/lib/partner/approvals";
import { cardFactIds, coBrandLine, storyKitInitiatives, STORY_KIT_INITIATIVE_IDS } from "@/lib/partner/story-kit";
import { raceFacts } from "@/lib/partner/race-week";

const at = "2026-10-05T09:30:00.000Z";

describe("approval trail", () => {
  const base = newRecord({ key: draftKey("linkedin-post", "Text"), title: "LinkedIn post", text: "Text", factIds: ["c25-mam-day-students"] });

  it("goes draft -> in review -> approved with the reviewer's name and time", () => {
    expect(base.state).toBe("draft");
    expect(canCopy(base)).toBe(false);
    const review = transition(base, { type: "submit" }, at);
    expect(review.state).toBe("in-review");
    expect(canCopy(review)).toBe(false);
    const approved = transition(review, { type: "approve", reviewer: "  Priya Nair " }, at);
    expect(approved).toMatchObject({ state: "approved", reviewer: "Priya Nair", approvedAt: at });
    expect(canCopy(approved)).toBe(true);
    expect(approved.history.map((e) => e.state)).toEqual(["in-review", "approved"]);
  });

  it("refuses to approve a draft that was never sent, or without a name", () => {
    expect(() => transition(base, { type: "approve", reviewer: "Priya" }, at)).toThrow();
    const review = transition(base, { type: "submit" }, at);
    expect(() => transition(review, { type: "approve", reviewer: "   " }, at)).toThrow();
  });

  it("reopening clears the approval", () => {
    const approved = transition(transition(base, { type: "submit" }, at), { type: "approve", reviewer: "Priya" }, at);
    const reopened = transition(approved, { type: "reopen" }, at);
    expect(reopened).toMatchObject({ state: "draft", reviewer: null, approvedAt: null });
    expect(canCopy(reopened)).toBe(false);
  });

  it("records each fact's id, status, source and extraction date", () => {
    expect(auditFacts(["c25-mam-day-students", "c25-mam-day-students", "not-a-fact"])).toEqual([
      { id: "c25-mam-day-students", status: "verified", source: "2025 report, p. 59", extractedAt: "2026-09-24" },
    ]);
  });

  it("gives a changed draft a new key", () => {
    expect(draftKey("check", "257 students")).not.toBe(draftKey("check", "275 students"));
  });

  it("ignores corrupt or foreign stored values", () => {
    expect(parseStored("{not json")).toBeNull();
    expect(parseStored(JSON.stringify({ state: "approved" }))).toBeNull();
    expect(parseStored(JSON.stringify(base))).toEqual(base);
  });
});

describe("story kit", () => {
  it("includes STEM Racing and co-brands from the initiative's own partners", () => {
    expect(STORY_KIT_INITIATIVE_IDS).toContain("stem-racing-world-finals");
    for (const i of storyKitInitiatives()) {
      const line = coBrandLine(i);
      expect(line.endsWith("Aston Martin Aramco")).toBe(true);
      expect(line).not.toContain("Cognizant");
      for (const p of i.partners.filter((p) => p !== "Cognizant")) expect(line).toContain(p);
    }
  });

  it("puts the charity's own outcomes first and leaves disputed figures off the card", () => {
    const aleto = initiatives.find((i) => i.id === "aleto-leadership")!;
    expect(cardFactIds(aleto)).toEqual(["b25-aleto-network", "b25-aleto-leadership"]);
    const afbe = initiatives.find((i) => i.id === "afbe-transition")!;
    expect(cardFactIds(afbe)[0]).toBe("b25-afbe-helpful");
    const stem = initiatives.find((i) => i.id === "stem-racing-world-finals")!;
    expect(cardFactIds(stem)).toEqual(["c25-stem-racing-students", "c25-stem-racing-countries"]);
  });
});

describe("this race week", () => {
  it("never shows an even-split per-round estimate as a race figure", () => {
    const ids = raceFacts().map((f) => f.id);
    expect(ids.some((id) => /per-round/.test(id))).toBe(false);
    expect(ids).toContain("c25-stem-racing-students");
  });
});
