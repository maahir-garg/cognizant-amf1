import { describe, expect, it } from "vitest";
import { modeRatio, tripKg } from "@/lib/data/travel";
import { facts, initiatives } from "@/lib/data/load";
import { runScenario, SCENARIO_DEFAULTS } from "@/lib/data/scenario";
import { verifyData } from "@/lib/data/verify";

describe("fact base", () => {
  it("passes the full source audit", () => {
    const errors = verifyData().filter((i) => i.level === "error");
    expect(errors).toEqual([]);
  });
  it("labels every fact", () => {
    for (const f of facts) expect(["verified", "estimated", "simulated"]).toContain(f.status);
  });
  it("ships no simulated facts or initiatives in the product", () => {
    expect(facts.filter((f) => f.status === "simulated").map((f) => f.id)).toEqual([]);
    expect(initiatives.filter((i) => i.status === "simulated").map((i) => i.id)).toEqual([]);
  });
});

describe("travel modes", () => {
  it("prices a return trip per passenger", () => {
    expect(tripKg("mrt", 10)).toBeCloseTo(0.572, 3);
    expect(tripKg("mrt", 10, false)).toBeCloseTo(0.286, 3);
  });
  it("compares modes as a distance-free ratio", () => {
    expect(modeRatio("mrt", "car")).toBeGreaterThan(modeRatio("mrt", "taxi"));
    expect(modeRatio("walk", "taxi")).toBe(Infinity);
  });
});

describe("scenario", () => {
  it("scales verified baselines only", () => {
    const out = Object.fromEntries(runScenario(SCENARIO_DEFAULTS).map((o) => [o.id, o.value]));
    expect(out["sc-mam-students"]).toBe(Math.round(2 * 257 * 0.8));
    expect(out["sc-mentees"]).toBe(14);
  });
});
