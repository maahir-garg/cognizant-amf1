import { describe, expect, it } from "vitest";
import { DEFAULT_SHARE_FACT_IDS } from "@/lib/ai/requests";
import { getFact, getRace, quizzes, races } from "@/lib/data/load";
import { quickCheckQuestions } from "@/lib/fan/quiz";
import { isUpcoming, raceDates, raceProgrammes } from "@/lib/fan/race";
import { SHARE_FACT_IDS, shareFactValue, shareSourceLine } from "@/lib/fan/share";
import { comparePhrase, hasTripParams, parseTripParams, planLine, tripResult } from "@/lib/fan/trip";

const singapore = getRace("singapore-2026");

describe("share card facts", () => {
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
