import { describe, expect, it } from "vitest";
import { compareTrips, fanEquivalents, toEquivalent } from "@/lib/data/equivalents";
import { facts, getFact } from "@/lib/data/load";
import { matchInitiatives } from "@/lib/data/relevance";
import { runScenario, SCENARIO_DEFAULTS } from "@/lib/data/scenario";
import { verifyData } from "@/lib/data/verify";
import { replayAt, replayDuration } from "@/lib/live/replay";

describe("fact base", () => {
  it("passes the full source audit", () => {
    const errors = verifyData().filter((i) => i.level === "error");
    expect(errors).toEqual([]);
  });
  it("labels every fact", () => {
    for (const f of facts) expect(["verified", "estimated", "simulated"]).toContain(f.status);
  });
});

describe("equivalents", () => {
  it("uses the team's own Silverstone lap equivalence", () => {
    const e = toEquivalent(getFact("e25-saf-avoided").value!, "silverstone-lap");
    expect(Math.round(e.units)).toBe(88153);
    expect(e.display).toBe("88,000");
  });
  it("returns F1-native equivalents first", () => {
    expect(fanEquivalents(231.7).map((e) => e.factor.id)[0]).toBe("silverstone-lap");
  });
  it("compares trips against driving", () => {
    const trips = compareTrips(10);
    const mrt = trips.find((t) => t.mode.id === "mrt")!;
    expect(mrt.kgCO2e).toBeCloseTo(0.572, 3);
    expect(mrt.savingVsCarKg).toBeGreaterThan(0);
  });
});

describe("relevance", () => {
  it("puts Singapore initiatives first for a Singapore STEM fan", () => {
    const m = matchInitiatives({ level: "new", cityId: "singapore", interests: ["stem"] });
    expect(m[0].initiative.cityIds).toContain("singapore");
  });
});

describe("scenario", () => {
  it("scales verified baselines only", () => {
    const out = Object.fromEntries(runScenario(SCENARIO_DEFAULTS).map((o) => [o.id, o.value]));
    expect(out["sc-students"]).toBe(Math.round(3 * 257 * 0.8));
    expect(out["sc-saf-extra"]).toBe(0);
    expect(out["sc-mentees"]).toBe(14);
  });
});

describe("live replay", () => {
  it("fires milestones exactly once", () => {
    const end = replayAt("singapore-2026", replayDuration("singapore-2026"));
    expect(end.done).toBe(true);
    const ids = end.milestones.map((m) => `${m.counterId}:${m.threshold}`);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("sg-stem-students:100");
  });
});
