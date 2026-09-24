/**
 * Request builders for every AI task. The fan and partner UIs and
 * scripts/warm-cache.ts all build requests through these functions, so the
 * cache keys used at demo time are exactly the ones that were warmed.
 *
 * Signatures are shared contract (lead-owned). The fact selection inside
 * each builder may be tuned by the AI workstream.
 */
import { facts, getFact, initiatives, quizzes } from "@/lib/data/load";
import type { AiRequest, DerivedValue, FanProfile, Pillar } from "@/lib/data/schemas";

type Built = AiRequest;

const byTagAndPillar = (pillar: Pillar, tags: string[], limit: number): string[] => {
  const pool = facts.filter((f) => f.pillar === pillar && f.status !== "simulated" && !f.tags.includes("data-quality"));
  const scored = pool
    .map((f) => ({
      id: f.id,
      score: (f.tags.includes("hero") ? 3 : 0) + f.tags.filter((t) => tags.includes(t)).length * 2 + (f.value !== null ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return scored.slice(0, limit).map((s) => s.id);
};

/* ------------------------------------------------------------------ fan */

/** Sector intro for the fan lap. New fans get more context, die-hards fewer, denser facts. */
export function fanStoryRequest(fan: FanProfile, pillar: Pillar): Built {
  const limit = fan.level === "die-hard" ? 4 : fan.level === "casual" ? 3 : 2;
  const tags = [...fan.interests, fan.cityId === "singapore" ? "singapore" : ""].filter(Boolean);
  return {
    task: "fan-story",
    factIds: byTagAndPillar(pillar, tags, limit),
    derived: [],
    fan,
    params: { pillar },
  };
}

/** One-line personalised reveal after a quiz answer. */
export function quizRevealRequest(fan: FanProfile, quizId: string, correct: boolean): Built {
  const quiz = quizzes.find((q) => q.id === quizId);
  if (!quiz) throw new Error(`Unknown quiz "${quizId}"`);
  return { task: "quiz-reveal", factIds: [quiz.factId], derived: [], fan, params: { quizId, correct } };
}

/** Caption for the 9:16 share card. `factIds` are the figures printed on the card. */
export function shareCaptionRequest(fan: FanProfile, factIds: string[], raceId: string): Built {
  return { task: "share-caption", factIds, derived: [], fan, params: { raceId } };
}

/* -------------------------------------------------------------- partner */

export const NARRATIVE_FORMATS = ["linkedin-post", "quarterly-brief", "investor-summary"] as const;
export type NarrativeFormat = (typeof NARRATIVE_FORMATS)[number];
export const NARRATIVE_TONES = ["confident", "warm", "formal"] as const;
export type NarrativeTone = (typeof NARRATIVE_TONES)[number];

/** Facts a partner narrative may draw on: partner-tagged first, then headline ESG facts. */
export function partnerNarrativeFactIds(partnerId: string, pillars: Pillar[]): string[] {
  const tag = `partner:${partnerId}`;
  const partnerFacts = facts.filter((f) => f.tags.includes(tag) && f.status !== "simulated").map((f) => f.id);
  const hero = facts
    .filter((f) => f.tags.includes("hero") && pillars.includes(f.pillar) && !partnerFacts.includes(f.id))
    .map((f) => f.id);
  return [...partnerFacts, ...hero].slice(0, 10);
}

export function narrativeRequest(format: NarrativeFormat, opts: { partnerId: string; pillars: Pillar[]; tone: NarrativeTone }): Built {
  return {
    task: format,
    factIds: partnerNarrativeFactIds(opts.partnerId, opts.pillars),
    derived: [],
    params: { partner: opts.partnerId, pillars: [...opts.pillars].sort().join(","), tone: opts.tone },
  };
}

/** Plain-English explanation of a what-if scenario. Pass runScenario() outputs as derived values. */
export function scenarioExplanationRequest(derived: DerivedValue[], factIds: string[]): Built {
  return { task: "scenario-explanation", factIds: [...new Set(factIds)].sort(), derived, params: {} };
}

/** Suggested campaign post when a live milestone fires. The milestone value is simulated. */
export function milestonePostRequest(milestone: { counterId: string; label: string; threshold: number; unit: string }, factIds: string[]): Built {
  const derived: DerivedValue[] = [
    {
      id: `ms-${milestone.counterId}`,
      label: milestone.label,
      value: milestone.threshold,
      unit: milestone.unit,
      formula: "Simulated live counter crossed a milestone threshold (demo data)",
    },
  ];
  return { task: "linkedin-post", factIds, derived, params: { partner: "cognizant", milestone: milestone.counterId, simulated: true } };
}

/** Impact copy for a community / charity partner, grounded in its initiative's facts. */
export function storyKitRequest(initiativeId: string, format: "post" | "summary"): Built {
  const initiative = initiatives.find((i) => i.id === initiativeId);
  if (!initiative) throw new Error(`Unknown initiative "${initiativeId}"`);
  const factIds = initiative.factIds.length ? initiative.factIds : byTagAndPillar(initiative.pillar, initiative.interests, 2);
  return { task: "story-kit", factIds, derived: [], params: { initiative: initiativeId, format } };
}

/* ------------------------------------------------------- demo personas */

/** Personas the offline cache is warmed for. Keep in sync with docs/DEMO_SCRIPT.md. */
export const DEMO_PERSONAS: FanProfile[] = [
  { level: "new", cityId: "singapore", interests: ["environment", "stem"] },
  { level: "casual", cityId: "singapore", interests: ["community", "inclusion"] },
  { level: "die-hard", cityId: "london", interests: ["environment", "tech"] },
  { level: "new", cityId: "kuala-lumpur", interests: ["stem", "tech"] },
];

/** Sanity helper for tests: every id a builder returns must exist. */
export function assertFactIds(req: Built): Built {
  req.factIds.forEach(getFact);
  return req;
}
