import { describe, expect, it } from "vitest";
import { checkText } from "@/lib/ai/guardrail";
import { DEFAULT_SHARE_FACT_IDS, shareCaptionRequest } from "@/lib/ai/requests";
import { renderTemplate } from "@/lib/ai/templates";
import { getFact, getRace, quizzes, races } from "@/lib/data/load";
import { DEFAULT_FAN, quickCheckQuestions } from "@/lib/fan/quiz";
import { captionAfterUnit } from "@/lib/format";
import { isUpcoming, raceDates, raceProgrammes } from "@/lib/fan/race";
import { SITE_URL } from "@/lib/config";
import {
  CARD_NAME_MAX,
  LINKEDIN_SHARE_URL,
  SHARE_FACT_IDS,
  SHARE_MAX_FACTS,
  badgeShareFacts,
  cardName,
  cardNameInput,
  shareFactContext,
  shareFactValue,
  shareSourceLine,
} from "@/lib/fan/share";
import { QuizBadge } from "@/lib/fan/storage";
import { comparePhrase, hasTripParams, parseTripParams, planLine, tripResult } from "@/lib/fan/trip";

const singapore = getRace("singapore-2026");

describe("captions under a figure", () => {
  it("read on from the unit instead of repeating it", () => {
    expect(captionAfterUnit("Students engaged at the STEM Racing World Finals", "students")).toBe("engaged at the STEM Racing World Finals");
    expect(captionAfterUnit("Young people reached by the STEM learning programme", "young people")).toBe("reached by the STEM learning programme");
    expect(captionAfterUnit("Countries represented at the finals", "countries")).toBe("represented at the finals");
  });
  it("leave other captions alone", () => {
    expect(captionAfterUnit("Supply chain share of the footprint", "%")).toBe("Supply chain share of the footprint");
    expect(captionAfterUnit("Solar panels on the campus roof", "panels")).toBe("Solar panels on the campus roof");
  });
});

describe("share card facts", () => {
  it("say where and when from data", () => {
    expect(shareFactContext("c25-stem-racing-students")).toBe("In Singapore, 2025");
    expect(shareFactContext("e24-solar-panels")).toBe("2024 figure");
  });
  it("are verified and carry no data-quality flags", () => {
    for (const id of [...SHARE_FACT_IDS, ...DEFAULT_SHARE_FACT_IDS]) {
      const f = getFact(id);
      expect(f.status, id).toBe("verified");
      expect(f.flags, id).toEqual([]);
    }
  });
  it("never include the pay gap, workforce split or a per-round estimate", () => {
    expect(SHARE_FACT_IDS.some((id) => /pay-gap|women-share|per-round/.test(id))).toBe(false);
  });
  it("prints symbols with the figure and a true minus sign", () => {
    expect(shareFactValue("e25-saf-airfreight-cut")).toBe("31%");
    expect(shareFactValue("e25-supply-chain-share")).toBe("81%");
  });
  it("names every page the figures come from", () => {
    expect(shareSourceLine(["e25-saf-airfreight-cut", "e25-supply-chain-share", "e24-solar-panels"])).toBe(
      "2025 report, pp. 19, 24 · 2024 report, p. 25",
    );
  });
});

describe("quick check", () => {
  it("serves three questions to new fans and five to long-time fans", () => {
    expect(quickCheckQuestions("new")).toHaveLength(3);
    expect(quickCheckQuestions("watched")).toHaveLength(5);
  });
  it("avoids pay, workforce split, flagged facts and per-round estimates", () => {
    for (const q of quizzes) {
      const f = getFact(q.factId);
      expect(q.factId, q.id).not.toMatch(/pay-gap|women-share|per-round/);
      expect(f.flags.map((x) => x.kind), q.id).not.toContain("source-conflict");
    }
  });
});

describe("quick-check badge and the card it starts", () => {
  const base = { depth: "new", answered: 3, matched: 2, completedAt: "2026-10-01T10:00:00.000Z" };

  it("records the facts behind the questions answered", () => {
    const factIds = quickCheckQuestions("new").map((q) => q.factId);
    expect(QuizBadge.parse({ ...base, factIds }).factIds).toEqual(factIds);
  });
  it("still reads a badge saved before it carried facts, and drops a malformed list", () => {
    expect(QuizBadge.safeParse(base).success).toBe(true);
    const bad = QuizBadge.parse({ ...base, factIds: "e25-saf-airfreight-cut" });
    expect(bad.factIds).toBeUndefined();
    expect(bad.depth).toBe("new");
  });
  it("starts the card from the quiz figures the card can carry, at both depths", () => {
    for (const depth of ["new", "watched"] as const) {
      const quizIds = quickCheckQuestions(depth).map((q) => q.factId);
      const start = badgeShareFacts(quizIds, [...DEFAULT_SHARE_FACT_IDS]);
      expect(start.length, depth).toBeGreaterThan(0);
      expect(start.length, depth).toBeLessThanOrEqual(SHARE_MAX_FACTS);
      for (const id of start) {
        expect(SHARE_FACT_IDS, id).toContain(id);
        expect(quizIds, id).toContain(id);
      }
    }
    expect(badgeShareFacts(quickCheckQuestions("new").map((q) => q.factId), [])).toContain("e25-supply-chain-share");
  });
  it("falls back to the defaults without quiz facts, or with none the card can carry", () => {
    expect(badgeShareFacts(undefined, [...DEFAULT_SHARE_FACT_IDS])).toEqual(DEFAULT_SHARE_FACT_IDS);
    expect(badgeShareFacts(["c25-ai-skills-gap", "not-a-fact"], [...DEFAULT_SHARE_FACT_IDS])).toEqual(DEFAULT_SHARE_FACT_IDS);
  });
  it("words a template caption for the quiz figures that passes the guardrail", () => {
    for (const depth of ["new", "watched"] as const) {
      const ids = badgeShareFacts(quickCheckQuestions(depth).map((q) => q.factId), [...DEFAULT_SHARE_FACT_IDS]);
      const req = shareCaptionRequest(DEFAULT_FAN, ids, "singapore-2026");
      const facts = ids.map(getFact);
      const text = renderTemplate(req, facts);
      expect(text.length, text).toBeLessThanOrEqual(110);
      expect(checkText(text, { facts, derived: [] }).passed, text).toBe(true);
    }
  });
});

describe("sharing beyond the card", () => {
  it("links LinkedIn's share dialog to the site address and nothing else", () => {
    const url = new URL(LINKEDIN_SHARE_URL);
    expect(url.origin).toBe("https://www.linkedin.com");
    expect(url.pathname).toBe("/sharing/share-offsite/");
    expect([...url.searchParams.keys()]).toEqual(["url"]);
    expect(url.searchParams.get("url")).toBe(`https://${SITE_URL}`);
  });
});

describe("first name on the card", () => {
  it("keeps letters in any script, spaces, hyphens and apostrophes", () => {
    expect(cardName("  Alex ")).toBe("Alex");
    expect(cardName("Mary-Jane O'Neil")).toBe("Mary-Jane O'Neil");
    expect(cardName("Zoë")).toBe("Zoë");
    expect(cardName("李华")).toBe("李华");
  });
  it("drops numbers, web addresses and symbols so the card carries no stray figures", () => {
    expect(cardName("Alex 81%")).toBe("Alex");
    expect(cardName("Sam 🏎️")).toBe("Sam");
    expect(cardName("<Sam>")).toBe("Sam");
    expect(cardName("example.com")).toBe("examplecom");
    expect(cardName("1234")).toBeNull();
    expect(cardName("")).toBeNull();
    expect(cardName(null)).toBeNull();
  });
  it("caps the length and lets a space through while typing", () => {
    expect(cardNameInput("Mary ")).toBe("Mary ");
    expect(cardNameInput("   Mary   Ann")).toBe("Mary Ann");
    expect(Array.from(cardNameInput("A".repeat(60)))).toHaveLength(CARD_NAME_MAX);
  });
  it("is never part of the caption request", () => {
    const req = shareCaptionRequest(DEFAULT_FAN, [...DEFAULT_SHARE_FACT_IDS], "singapore-2026");
    expect(Object.keys(req).sort()).toEqual(["derived", "factIds", "fan", "params", "task"]);
    expect(Object.keys(req.fan ?? {}).sort()).toEqual(["cityId", "interests", "level"]);
  });
});

describe("trip planner", () => {
  it("compares the MRT with a taxi as a share of its emissions", () => {
    const r = tripResult({ modeId: "mrt", km: 10 }, singapore);
    expect(r.lead).toBe("About a fifth of a taxi's emissions");
    expect(r.secondary).toBe("About a sixth of the emissions of driving alone");
    expect(r.kg).toBeCloseTo(0.572, 3);
  });
  it("words small differences as percentages, in both directions", () => {
    expect(comparePhrase(1.125, "car")).toBe("about 11% less than the emissions of driving alone");
    expect(comparePhrase(1 / 1.125, "taxi")).toBe("about 13% more than a taxi's emissions");
    expect(comparePhrase(1.43, "taxi")).toBe("about 30% less than a taxi's emissions");
    expect(comparePhrase(Infinity, "taxi")).toBe("no tailpipe emissions, unlike a taxi");
  });
  it("falls back to defaults for bad GET params and ignores the old city param", () => {
    expect(parseTripParams({ city: "atlantis", mode: "rocket", km: "-4" })).toEqual({ modeId: "mrt", km: 5 });
    expect(parseTripParams({ city: "jakarta", mode: "bus", km: "500" })).toEqual({ modeId: "bus", km: 40 });
  });
  it("treats a link as explicit only when it carries a planner choice", () => {
    expect(hasTripParams({})).toBe(false);
    expect(hasTripParams({ mode: "bus" })).toBe(true);
    expect(hasTripParams({ km: "3" })).toBe(true);
  });
  it("writes the plan line for one fan or a group", () => {
    expect(planLine("mrt", singapore)).toBe("My plan: the MRT to Marina Bay");
    expect(planLine("mrt", singapore, true)).toBe("Our squad is taking the MRT to Marina Bay");
  });
});

describe("race pages", () => {
  it("links Singapore to its real programmes only", () => {
    const ids = raceProgrammes(singapore).map((p) => p.initiative.id);
    expect(ids).toEqual(["trackside-stem-outreach", "stem-racing-world-finals", "unearth-your-greatness"]);
  });
  it("treats only the hero race as upcoming in this data", () => {
    expect(races.filter((r) => isUpcoming(r, new Date("2026-09-30"))).map((r) => r.id)).toEqual(["singapore-2026"]);
  });
  it("formats the weekend as a date range", () => {
    expect(raceDates(singapore)).toBe("9 to 11 Oct 2026");
  });
});
