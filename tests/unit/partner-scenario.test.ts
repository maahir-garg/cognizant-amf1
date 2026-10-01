import { describe, expect, it } from "vitest";
import { checkText } from "@/lib/ai/guardrail";
import { scenarioExplanationRequest } from "@/lib/ai/requests";
import { renderTemplate } from "@/lib/ai/templates";
import { getFact } from "@/lib/data/load";
import { runScenario, SCENARIO_DEFAULTS, SCENARIO_LIMITS, scenarioDerivedValues, type ScenarioInput } from "@/lib/data/scenario";

const byId = (input: ScenarioInput) => Object.fromEntries(runScenario(input).map((o) => [o.id, o]));

describe("joint-programme scenario", () => {
  it("models people reached only: no carbon or fuel levers", () => {
    const outputs = runScenario(SCENARIO_DEFAULTS);
    expect(Object.keys(SCENARIO_DEFAULTS).sort()).toEqual(["mamEditions", "mentoringCohorts", "stemGrowthPct", "turnoutPct"]);
    for (const o of outputs) {
      expect(o.unit).not.toMatch(/co2|laps|tonne/i);
      expect(o.id).not.toMatch(/saf/);
    }
  });

  it("scales published per-unit baselines", () => {
    const out = byId({ mamEditions: 3, turnoutPct: 100, stemGrowthPct: 50, mentoringCohorts: 2 });
    const students = getFact("c25-mam-day-students").value!;
    const reach = getFact("m-stem-programme-reach").value!;
    const cohort = getFact("b25-aleto-cohort").value!;
    expect(out["sc-mam-students"].value).toBe(3 * students);
    expect(out["sc-mam-schools"].value).toBe(3 * getFact("c25-mam-day-schools").value!);
    expect(out["sc-stem-extra"].value).toBe(Math.round(reach * 0.5));
    expect(out["sc-mentees"].value).toBe(2 * cohort);
    expect(out["sc-network-growth"].value).toBe(Math.round(2 * cohort * (getFact("b25-aleto-network").value! / 100)));
    expect(out["sc-young-people"].value).toBe(3 * students + Math.round(reach * 0.5) + 2 * cohort);
  });

  it("is zero everywhere when every lever is at its minimum", () => {
    const zero = runScenario({ mamEditions: 0, turnoutPct: SCENARIO_LIMITS.turnoutPct.min, stemGrowthPct: 0, mentoringCohorts: 0 });
    expect(zero.every((o) => o.value === 0)).toBe(true);
  });

  it("gives every output a formula, fact inputs and a rendering that names each fact", () => {
    for (const o of runScenario(SCENARIO_DEFAULTS)) {
      expect(o.formula.length).toBeGreaterThan(0);
      expect(o.factIds.length).toBeGreaterThan(0);
      expect(o.terms.length).toBeGreaterThan(1);
      for (const t of o.terms) if (t.kind === "fact") expect(o.factIds).toContain(t.id);
      o.factIds.forEach(getFact);
    }
  });

  it("explains itself in text that passes the guardrail across the lever range", () => {
    const inputs: ScenarioInput[] = [
      SCENARIO_DEFAULTS,
      { mamEditions: 0, turnoutPct: 50, stemGrowthPct: 0, mentoringCohorts: 0 },
      { mamEditions: 6, turnoutPct: 100, stemGrowthPct: 100, mentoringCohorts: 4 },
    ];
    for (const input of inputs) {
      const outputs = runScenario(input);
      const req = scenarioExplanationRequest(scenarioDerivedValues(outputs), outputs.flatMap((o) => o.factIds));
      const text = renderTemplate(req, req.factIds.map(getFact));
      const guard = checkText(text, { facts: req.factIds.map(getFact), derived: req.derived });
      expect(guard.passed, guard.reasons.join("; ")).toBe(true);
    }
  });
});
