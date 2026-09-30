import { describe, expect, it } from "vitest";
import { checkText } from "@/lib/ai/guardrail";
import { CHAPTER_IDS, DEMO_PERSONAS, FAN_CHAPTER_FACTS, STORY_DEFAULT_FAN, fanChapterRequest } from "@/lib/ai/requests";
import { renderTemplate } from "@/lib/ai/templates";
import { findFact, getFact } from "@/lib/data/load";
import { CHAPTERS, allCopyStrings, chapterFactIds, parseCopy } from "@/lib/story/chapters";
import { DEFAULT_FAN } from "@/lib/fan/quiz";
import { formatDateRange } from "@/lib/story/dates";
import { footprintSegments, graphicFactIds, progressRows, targetBars, tracksideStoryRows } from "@/lib/story/graphics";

const everyFactId = [...new Set([...CHAPTERS.flatMap(chapterFactIds), ...graphicFactIds()])];

describe("story chapters", () => {
  it("follow the brief's order and match the AI chapter ids", () => {
    expect(CHAPTERS.map((c) => c.id)).toEqual([...CHAPTER_IDS]);
    expect(CHAPTERS.map((c) => c.number)).toEqual(CHAPTERS.map((_, i) => i + 1));
  });

  it("reference only facts that exist", () => {
    const missing = everyFactId.filter((id) => !findFact(id));
    expect(missing).toEqual([]);
  });

  it("never put a digit in copy: figures come from the fact base", () => {
    // Model and series names are not figures.
    const names = /\b(AMR2[56]|F1)\b/g;
    const offenders = allCopyStrings().filter((s) => /\d/.test(s.replace(names, "").replace(/\{f:[a-z0-9-]+\}/g, "")));
    expect(offenders).toEqual([]);
  });

  it("keep steps short: one idea per screen", () => {
    for (const c of CHAPTERS) {
      for (const s of c.steps) {
        const words = s.copy.replace(/\{f:[a-z0-9-]+\}/g, "X").split(/\s+/).length;
        expect(words, `${c.id}: ${s.copy}`).toBeLessThanOrEqual(50);
      }
    }
  });

  it("parses fact tokens", () => {
    expect(parseCopy("a {f:e25-removals} b")).toEqual([
      { kind: "text", text: "a " },
      { kind: "fact", id: "e25-removals" },
      { kind: "text", text: " b" },
    ]);
  });
});

describe("stakeholder guardrails", () => {
  const stepFactIds = (c: (typeof CHAPTERS)[number]) =>
    c.steps.flatMap((s) => [...parseCopy(s.copy).flatMap((p) => (p.kind === "fact" ? [p.id] : [])), ...(s.facts ?? []).map((f) => f.id)]);

  it("never show per-round estimates or the derived renewable share", () => {
    const banned = ["est-freight-per-round", "est-travel-per-round", "est-saf-per-round", "est-rego-share"];
    expect(everyFactId.filter((id) => banned.includes(id))).toEqual([]);
  });

  it("show the pay gap and workforce share only in the Belong detail, next to the p. 55 explanation", () => {
    const sensitive = ["b25-pay-gap-median", "b25-pay-gap-mean", "b25-women-share"];
    for (const c of CHAPTERS) {
      expect(stepFactIds(c).filter((id) => sensitive.includes(id)), c.id).toEqual([]);
      if (c.id !== "beyond") expect(chapterFactIds(c).filter((id) => sensitive.includes(id)), c.id).toEqual([]);
    }
    const payGap = getChapterDetail("beyond").find((d) => d.facts?.includes("b25-pay-gap-median"));
    expect(payGap?.text).toMatch(/not the same as unequal pay/);
    expect(payGap?.cite?.page).toBe(55);
  });

  it("show no disputed figure except the footprint total the report's own target chart uses", () => {
    const conflicted = everyFactId.filter((id) => getFact(id).flags.some((f) => f.kind === "source-conflict"));
    expect(conflicted).toEqual(["e25-ghg-total-sbti"]);
  });

  it("word the laps comparisons as the team's own, in a petrol road car", () => {
    for (const c of CHAPTERS) {
      for (const s of c.steps) {
        if (/\{f:e25-(saf|cups)-laps\}/.test(s.copy)) expect(s.copy).toMatch(/petrol road car, its own comparison/);
      }
    }
  });

  it("never frame removals as offsetting or neutral", () => {
    const text = allCopyStrings().join(" ").toLowerCase();
    for (const word of ["carbon neutral", "carbon negative", "offset", "save the planet", "net zero hero"]) expect(text).not.toContain(word);
  });

  it("say that fan travel is outside the team's footprint", () => {
    expect(allCopyStrings().some((s) => /not part of the team's footprint/.test(s))).toBe(true);
  });
});

function getChapterDetail(id: string) {
  return CHAPTERS.find((c) => c.id === id)!.detail;
}

describe("graphics", () => {
  it("footprint parts add up to the published total", () => {
    const sum = footprintSegments().reduce((a, s) => a + s.share, 0);
    expect(sum).toBeCloseTo(1, 3);
  });

  it("target chart runs baseline -> latest -> 2030 -> 2050 and says 'past the target' only where true", () => {
    expect(targetBars().map((b) => b.factId)).toEqual(["e23-ghg-baseline", "e25-ghg-total-sbti", "e25-target-2030-tco2e", "e25-target-2050-tco2e"]);
    const [s12, s3] = progressRows();
    expect(s12.pastTarget).toMatch(/past the \d{4} target/);
    expect(s3.pastTarget).toBeNull();
  });

  it("trackside rows are the European rounds only", () => {
    const rows = tracksideStoryRows();
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.some((r) => /singapore|marina/i.test(r.label))).toBe(false);
  });
});

describe("fanChapterRequest", () => {
  const personas = [STORY_DEFAULT_FAN, ...DEMO_PERSONAS];

  it.each(CHAPTER_IDS.map((id) => [id]))("%s passes the guardrail through the template at both depths", (id) => {
    for (const persona of personas) {
      for (const level of ["new", "die-hard"] as const) {
        const req = fanChapterRequest({ ...persona, level }, id);
        const facts = req.factIds.map(getFact);
        const text = renderTemplate(req, facts);
        const report = checkText(text, { facts, derived: [] });
        expect(report.passed, `${report.reasons.join("; ")}\n${text}`).toBe(true);
        expect(req.params.chapter).toBe(id);
      }
    }
  });

  it("gives new fans fewer facts and treats any level but die-hard as new", () => {
    for (const id of CHAPTER_IDS) {
      const fresh = fanChapterRequest({ ...STORY_DEFAULT_FAN, level: "casual" }, id);
      const deep = fanChapterRequest({ ...STORY_DEFAULT_FAN, level: "die-hard" }, id);
      expect(fresh.fan?.level).toBe("new");
      expect(fresh.factIds.length).toBeLessThan(deep.factIds.length);
      expect(deep.factIds).toEqual(FAN_CHAPTER_FACTS[id]);
    }
  });

  it("uses the same default fan as the race page and quick check", () => {
    expect(STORY_DEFAULT_FAN).toEqual(DEFAULT_FAN);
  });

  it("keeps the pay gap, workforce share and per-round estimates out of AI personalisation", () => {
    const all = Object.values(FAN_CHAPTER_FACTS).flat();
    expect(all.filter((id) => /^b25-(pay-gap|women-share)|per-round|rego-share|-laps$/.test(id))).toEqual([]);
  });
});

describe("formatDateRange", () => {
  it("joins a weekend inside one month", () => {
    expect(formatDateRange("2026-10-09", "2026-10-11")).toBe("9–11 Oct 2026");
  });
});
