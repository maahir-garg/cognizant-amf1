/**
 * What-if scenario model for joint AMF1 x partner initiatives.
 *
 * Every projection is (lever) x (verified per-unit baseline). No elasticities,
 * no invented costs. Each output carries its formula, input facts and
 * assumptions so the UI and the AI explanation can cite them, and the
 * outputs are handed to the guardrail as DerivedValues.
 */
import { getFact } from "./load";
import type { DerivedValue } from "./schemas";

export type ScenarioInput = {
  /** Extra race-weekend editions of a Make A Mark Day-style STEM day (0-10). */
  stemEditions: number;
  /** Expected turnout vs the 2025 Make A Mark Day, in percent (50-100). */
  turnoutPct: number;
  /** Extra Aleto-style mentoring cohorts per year (0-4). */
  mentoringCohorts: number;
  /** Target reduction in air-freight emissions from SAF, in percent (31-60; 31 = today). */
  safReductionPct: number;
};

export const SCENARIO_DEFAULTS: ScenarioInput = {
  stemEditions: 3,
  turnoutPct: 80,
  mentoringCohorts: 1,
  safReductionPct: 31,
};

export const SCENARIO_LIMITS = {
  stemEditions: { min: 0, max: 10, step: 1 },
  turnoutPct: { min: 50, max: 100, step: 5 },
  mentoringCohorts: { min: 0, max: 4, step: 1 },
  safReductionPct: { min: 31, max: 60, step: 1 },
} as const;

export type ScenarioOutput = {
  id: string;
  label: string;
  value: number;
  unit: string;
  formula: string;
  factIds: string[];
  assumptions: string[];
};

const num = (id: string): number => {
  const v = getFact(id).value;
  if (v === null) throw new Error(`Fact ${id} has no numeric value`);
  return v;
};

export function runScenario(input: ScenarioInput): ScenarioOutput[] {
  const perEdition = num("c25-mam-day-students");
  const cohortSize = num("b25-aleto-cohort");
  const networkRate = num("b25-aleto-network") / 100;
  const safAvoidedToday = num("e25-saf-avoided");
  const airFreightBase = num("est-airfreight-before-saf");
  const kgPerLap = num("est-kg-per-lap-2025");

  const students = Math.round(input.stemEditions * perEdition * (input.turnoutPct / 100));
  const mentees = input.mentoringCohorts * cohortSize;
  const networkGrowth = Math.round(mentees * networkRate);
  const safAvoided = Math.round(airFreightBase * (input.safReductionPct / 100));
  const safExtra = Math.max(0, safAvoided - safAvoidedToday);
  const extraLaps = Math.round((safExtra * 1000) / kgPerLap);

  return [
    {
      id: "sc-students",
      label: "Extra students reached at race-weekend STEM days",
      value: students,
      unit: "students",
      formula: `${input.stemEditions} editions x ${perEdition} students (2025 Make A Mark Day) x ${input.turnoutPct}% turnout`,
      factIds: ["c25-mam-day-students"],
      assumptions: ["Each edition matches the 2025 Make A Mark Day format and size.", "Turnout is a planning assumption, not a measured rate."],
    },
    {
      id: "sc-mentees",
      label: "Extra mentees per year",
      value: mentees,
      unit: "mentees",
      formula: `${input.mentoringCohorts} cohorts x ${cohortSize} students (2025 Aleto cohort, programme page)`,
      factIds: ["b25-aleto-cohort"],
      assumptions: ["Uses the smaller of the two published cohort sizes (14 vs 15)."],
    },
    {
      id: "sc-network-growth",
      label: "Mentees expected to report a stronger professional network",
      value: networkGrowth,
      unit: "mentees",
      formula: `${mentees} mentees x ${Math.round(networkRate * 100)}% (2025 Aleto outcome)`,
      factIds: ["b25-aleto-cohort", "b25-aleto-network"],
      assumptions: ["Assumes new cohorts see the same outcome rate as the 2025 cohort."],
    },
    {
      id: "sc-saf-avoided",
      label: "Air-freight emissions avoided through SAF",
      value: safAvoided,
      unit: "tCO2e",
      formula: `${Math.round(airFreightBase)} t implied air freight x ${input.safReductionPct}% reduction`,
      factIds: ["est-airfreight-before-saf", "e25-saf-avoided", "e25-saf-airfreight-cut"],
      assumptions: ["Assumes the saving scales linearly with SAF certificate volume.", "SAF cost is not published, so this model shows the carbon side only."],
    },
    {
      id: "sc-saf-extra",
      label: "Extra emissions avoided vs 2025",
      value: safExtra,
      unit: "tCO2e",
      formula: `${safAvoided} t - ${safAvoidedToday} t avoided in 2025`,
      factIds: ["e25-saf-avoided"],
      assumptions: [],
    },
    {
      id: "sc-saf-extra-laps",
      label: "Extra saving in laps of Silverstone",
      value: extraLaps,
      unit: "laps",
      formula: `${safExtra} t x 1,000 / ${kgPerLap.toFixed(2)} kg per lap`,
      factIds: ["est-kg-per-lap-2025"],
      assumptions: ["Uses the team's own 2025 lap equivalence."],
    },
  ];
}

/** Scenario outputs as guardrail-ready derived values. */
export function scenarioDerivedValues(outputs: ScenarioOutput[]): DerivedValue[] {
  return outputs.map((o) => ({ id: o.id, label: o.label, value: o.value, unit: o.unit, formula: o.formula }));
}
