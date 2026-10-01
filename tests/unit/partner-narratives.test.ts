import { describe, expect, it } from "vitest";
import { enumerateDemoRequests } from "@/lib/ai/demo-requests";
import { checkText } from "@/lib/ai/guardrail";
import {
  NARRATIVE_FORMATS,
  PARTNER_EXCLUDED_FACT_IDS,
  STORY_KIT_INITIATIVE_IDS,
  narrativeRequest,
  partnerNarrativeFactIds,
  raceWeekPostRequest,
  storyKitRequest,
} from "@/lib/ai/requests";
import { renderTemplate } from "@/lib/ai/templates";
import { HERO_RACE_ID } from "@/lib/config";
import { getFact } from "@/lib/data/load";
import { PILLARS } from "@/lib/data/schemas";

const partnerRequests = enumerateDemoRequests().filter((r) => ["linkedin-post", "quarterly-brief", "leadership-update", "story-kit"].includes(r.task));
const render = (r: (typeof partnerRequests)[number]) => renderTemplate(r, r.factIds.map(getFact));

describe("partner narratives", () => {
  it("change with the pillar focus: each pillar's own facts lead", () => {
    for (const pillar of PILLARS) {
      const ids = partnerNarrativeFactIds("cognizant", [pillar]);
      const own = ids.filter((id) => getFact(id).pillar === pillar);
      expect(own.length, pillar).toBeGreaterThanOrEqual(4);
    }
    const belong = partnerNarrativeFactIds("cognizant", ["belong"]);
    expect(belong).toContain("b25-aleto-network");
    expect(belong).not.toContain("c25-mam-day-students");
  });

  it("never hand partner copy the pay gap, women's share, per-round estimates or the duplicate progress estimate", () => {
    for (const r of partnerRequests) {
      for (const id of r.factIds) expect(PARTNER_EXCLUDED_FACT_IDS.has(id), `${r.task} ${id}`).toBe(false);
      expect(r.factIds.includes("est-scope12-change-vs-2023") && r.factIds.includes("e25-progress-scope12")).toBe(false);
      for (const id of r.factIds) expect(getFact(id).flags.some((f) => f.kind === "source-conflict"), `${r.task} ${id}`).toBe(false);
    }
  });

  it("stay third person, never snide, and never open a bullet with a pronoun", () => {
    for (const r of partnerRequests.filter((x) => x.task !== "story-kit")) {
      const text = render(r);
      expect(text, r.task).not.toMatch(/\bwe hold ourselves\b|\bourselves\b|logo placement|not just asserted/);
      for (const line of text.split("\n").filter((l) => l.startsWith("- "))) expect(line, line).not.toMatch(/^- (They|Those|These|It|That)\b/);
    }
  });

  it("covers every format for each pillar on its own", () => {
    for (const format of NARRATIVE_FORMATS)
      for (const pillar of PILLARS) {
        const req = narrativeRequest(format, { partnerId: "cognizant", pillars: [pillar] });
        expect(partnerRequests.some((r) => JSON.stringify(r) === JSON.stringify(req)), `${format} ${pillar}`).toBe(true);
      }
  });
});

describe("race-week post", () => {
  const req = raceWeekPostRequest("cognizant", HERO_RACE_ID);
  const text = renderTemplate(req, req.factIds.map(getFact));

  it("is about Singapore, not Silverstone", () => {
    expect(text).toMatch(/Singapore Grand Prix/);
    expect(req.factIds).toContain("c25-stem-racing-students");
    expect(req.factIds).not.toContain("c25-mam-day-students");
    expect(req.factIds.some((id) => /per-round|^f1-/.test(id))).toBe(false);
  });

  it("passes the guardrail", () => {
    expect(checkText(text, { facts: req.factIds.map(getFact), derived: [] }).passed).toBe(true);
  });
});

describe("story kit copy", () => {
  it("covers exactly the kit's programmes", () => {
    const ids = new Set(partnerRequests.filter((r) => r.task === "story-kit").map((r) => r.params.initiative));
    expect([...ids].sort()).toEqual([...STORY_KIT_INITIATIVE_IDS].sort());
  });

  it("reads the right way round, promises nothing and names no staff figures", () => {
    for (const id of STORY_KIT_INITIATIVE_IDS)
      for (const format of ["post", "funder"] as const) {
        const req = storyKitRequest(id, format);
        const text = renderTemplate(req, req.factIds.map(getFact));
        expect(text, `${id} ${format}`).not.toMatch(/^At (The |STEM Racing|ADHD)|there's more to come|our organisation|with the ADHD Foundation/);
        expect(req.factIds).not.toContain("b25-hidden-disability");
        if (format === "funder") expect(text, id).toMatch(/Figures are for /);
      }
  });
});
