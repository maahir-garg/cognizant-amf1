/**
 * What-if planning model for joint programmes: Make A Mark Day editions, the
 * STEM learning programme's reach, and Aleto-style mentoring cohorts.
 *
 * Every projection is (lever) x (published per-unit baseline). No
 * elasticities, no costs and no carbon: the team does not publish what a
 * programme costs, and the freight levers are the team's own operations,
 * not something a partner plans. Each output carries its formula, input
 * facts and assumptions so the UI and the AI explanation can cite them, and
 * the outputs are handed to the guardrail as DerivedValues. Every output is
 * an estimate.
 */
import { getFact } from "./load";
import type { DerivedValue } from "./schemas";

export type ScenarioInput = {
  /** Extra Make A Mark Day editions a year, e.g. at other race weekends (0-6). */
  mamEditions: number;
  /** Expected turnout at the extra editions vs the 2025 Make A Mark Day, in percent (50-100). */
  turnoutPct: number;
  /** Growth in the STEM learning programme's reach, in percent (0-100). */
  stemGrowthPct: number;
  /** Extra Aleto-style mentoring cohorts a year (0-4). */
  mentoringCohorts: number;
};

export const SCENARIO_DEFAULTS: ScenarioInput = {
  mamEditions: 2,
  turnoutPct: 80,
  stemGrowthPct: 20,
  mentoringCohorts: 1,
};

export const SCENARIO_LIMITS = {
  mamEditions: { min: 0, max: 6, step: 1 },
  turnoutPct: { min: 50, max: 100, step: 5 },
  stemGrowthPct: { min: 0, max: 100, step: 10 },
  mentoringCohorts: { min: 0, max: 4, step: 1 },
} as const;

export type ScenarioGroup = "make-a-mark" | "stem" | "mentoring" | "total";

/** One factor in a formula, for rendering: a published fact, a planning input, or another output. */
export type ScenarioTerm = { kind: "fact"; id: string } | { kind: "input"; text: string } | { kind: "output"; id: string };

export type ScenarioOutput = {
  id: string;
  group: ScenarioGroup;
  label: string;
  value: number;
  unit: string;
  /** Plain-text formula, handed to the model and the guardrail. */
  formula: string;
  /** The same formula as factors joined by the operator, for the UI. */
  terms: ScenarioTerm[];
  operator: "×" | "+";
  factIds: string[];
  assumptions: string[];
};

const num = (id: string): number => {
  const v = getFact(id).value;
  if (v === null) throw new Error(`Fact ${id} has no numeric value`);
  return v;
};

const count = (n: number, noun: string) => `${n} ${noun}${n === 1 ? "" : "s"}`;
const fact = (id: string): ScenarioTerm => ({ kind: "fact", id });
const input = (text: string): ScenarioTerm => ({ kind: "input", text });
const output = (id: string): ScenarioTerm => ({ kind: "output", id });

export function runScenario(inp: ScenarioInput): ScenarioOutput[] {
  const perEdition = num("c25-mam-day-students");
  const schoolsPerEdition = num("c25-mam-day-schools");
  const careersPerEdition = num("c25-mam-day-early-careers");
  const stemReach = num("m-stem-programme-reach");
  const cohortSize = num("b25-aleto-cohort");
  const networkRate = num("b25-aleto-network") / 100;
  const leadershipRate = num("b25-aleto-leadership") / 100;

  const turnout = inp.turnoutPct / 100;
  const students = Math.round(inp.mamEditions * perEdition * turnout);
  const schools = inp.mamEditions * schoolsPerEdition;
  const careers = Math.round(inp.mamEditions * careersPerEdition * turnout);
  const stemExtra = Math.round(stemReach * (inp.stemGrowthPct / 100));
  const mentees = inp.mentoringCohorts * cohortSize;
  const network = Math.round(mentees * networkRate);
  const leadership = Math.round(mentees * leadershipRate);
  const total = students + stemExtra + mentees;

  const sameFormat = "Each extra edition matches the 2025 Make A Mark Day format and size.";
  const turnoutNote = "Turnout is a planning assumption, not a measured rate.";

  return [
    {
      id: "sc-mam-students",
      group: "make-a-mark",
      label: "Extra students at Make A Mark Day",
      value: students,
      unit: "students",
      formula: `${count(inp.mamEditions, "edition")} x ${perEdition} students (2025 Make A Mark Day) x ${inp.turnoutPct}% turnout`,
      terms: [input(`${count(inp.mamEditions, "edition")}`), fact("c25-mam-day-students"), input(`${inp.turnoutPct}% turnout`)],
      operator: "×",
      factIds: ["c25-mam-day-students"],
      assumptions: [sameFormat, turnoutNote],
    },
    {
      id: "sc-mam-schools",
      group: "make-a-mark",
      label: "Schools and community groups represented",
      value: schools,
      unit: "schools and groups",
      formula: `${count(inp.mamEditions, "edition")} x ${schoolsPerEdition} schools and groups (2025 Make A Mark Day)`,
      terms: [input(`${count(inp.mamEditions, "edition")}`), fact("c25-mam-day-schools")],
      operator: "×",
      factIds: ["c25-mam-day-schools"],
      assumptions: [sameFormat],
    },
    {
      id: "sc-mam-careers",
      group: "make-a-mark",
      label: "Students meeting the Early Careers team",
      value: careers,
      unit: "students",
      formula: `${count(inp.mamEditions, "edition")} x ${careersPerEdition} students (2025 Make A Mark Day) x ${inp.turnoutPct}% turnout`,
      terms: [input(`${count(inp.mamEditions, "edition")}`), fact("c25-mam-day-early-careers"), input(`${inp.turnoutPct}% turnout`)],
      operator: "×",
      factIds: ["c25-mam-day-early-careers"],
      assumptions: [sameFormat, turnoutNote],
    },
    {
      id: "sc-stem-extra",
      group: "stem",
      label: "Extra young people reached by the STEM learning programme",
      value: stemExtra,
      unit: "young people",
      formula: `${stemReach} young people (STEM programme reach, Manifesto) x ${inp.stemGrowthPct}% growth`,
      terms: [fact("m-stem-programme-reach"), input(`${inp.stemGrowthPct}% growth`)],
      operator: "×",
      factIds: ["m-stem-programme-reach"],
      assumptions: [
        "The Manifesto says the programme reached more than this, so the baseline is a floor.",
        "Growth is a planning assumption, for example new race locations or more online learning.",
      ],
    },
    {
      id: "sc-mentees",
      group: "mentoring",
      label: "Extra mentees a year",
      value: mentees,
      unit: "mentees",
      formula: `${count(inp.mentoringCohorts, "cohort")} x ${cohortSize} students (2025 Aleto cohort, programme page)`,
      terms: [input(`${count(inp.mentoringCohorts, "cohort")}`), fact("b25-aleto-cohort")],
      operator: "×",
      factIds: ["b25-aleto-cohort"],
      assumptions: ["Uses the smaller of the two published cohort sizes (see Data quality)."],
    },
    {
      id: "sc-network-growth",
      group: "mentoring",
      label: "Mentees likely to report a stronger professional network",
      value: network,
      unit: "mentees",
      formula: `${mentees} mentees x ${Math.round(networkRate * 100)}% (2025 Aleto outcome)`,
      terms: [output("sc-mentees"), fact("b25-aleto-network")],
      operator: "×",
      factIds: ["b25-aleto-cohort", "b25-aleto-network"],
      assumptions: ["Assumes new cohorts see the same outcome rate as the 2025 cohort."],
    },
    {
      id: "sc-leadership-growth",
      group: "mentoring",
      label: "Mentees likely to report more leadership and confidence",
      value: leadership,
      unit: "mentees",
      formula: `${mentees} mentees x ${Math.round(leadershipRate * 100)}% (2025 Aleto outcome)`,
      terms: [output("sc-mentees"), fact("b25-aleto-leadership")],
      operator: "×",
      factIds: ["b25-aleto-cohort", "b25-aleto-leadership"],
      assumptions: ["Assumes new cohorts see the same outcome rate as the 2025 cohort."],
    },
    {
      id: "sc-young-people",
      group: "total",
      label: "Extra young people reached across the three programmes",
      value: total,
      unit: "young people",
      formula: `${students} Make A Mark Day students + ${stemExtra} STEM programme + ${mentees} mentees`,
      terms: [output("sc-mam-students"), output("sc-stem-extra"), output("sc-mentees")],
      operator: "+",
      factIds: ["c25-mam-day-students", "m-stem-programme-reach", "b25-aleto-cohort"],
      assumptions: ["Assumes no one is counted twice across programmes."],
    },
  ];
}

/** Scenario outputs as guardrail-ready derived values. */
export function scenarioDerivedValues(outputs: ScenarioOutput[]): DerivedValue[] {
  return outputs.map((o) => ({ id: o.id, label: o.label, value: o.value, unit: o.unit, formula: o.formula }));
}
