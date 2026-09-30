import { describe, expect, it } from "vitest";
import { DEFAULT_SHARE_FACT_IDS } from "@/lib/ai/requests";
import { getFact, getRace, quizzes, races } from "@/lib/data/load";
import { quickCheckQuestions } from "@/lib/fan/quiz";
import { isUpcoming, raceDates, raceProgrammes } from "@/lib/fan/race";
import { SHARE_FACT_IDS, shareFactValue, shareSourceLine } from "@/lib/fan/share";
import { comparePhrase, parseTripParams, planLine, tripResult } from "@/lib/fan/trip";

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
    expect(shareFactValue("e25-progress-scope12")).toBe("−74%");
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
  it("compares the MRT with a taxi as a ratio", () => {
    const r = tripResult({ cityId: "singapore", modeId: "mrt", km: 10 }, singapore);
    expect(r.lead).toBe("About 5 times lower than a taxi");
    expect(r.secondary).toBe("About 6 times lower than driving alone");
    expect(r.kg).toBeCloseTo(0.572, 3);
  });
  it("words small differences as percentages, in both directions", () => {
    expect(comparePhrase(1.125)).toBe("about 11% lower than");
    expect(comparePhrase(1 / 1.125)).toBe("about 13% higher than");
    expect(comparePhrase(1.43)).toBe("about 30% lower than");
    expect(comparePhrase(Infinity)).toBe("no tailpipe emissions, unlike");
  });
  it("falls back to defaults for bad GET params", () => {
    expect(parseTripParams({ city: "atlantis", mode: "rocket", km: "-4" })).toEqual({ cityId: "singapore", modeId: "mrt", km: 10 });
    expect(parseTripParams({ city: "jakarta", mode: "bus", km: "500" })).toEqual({ cityId: "jakarta", modeId: "bus", km: 60 });
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
