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

/**
 * Default figures printed on the fan share card / used by the warm-cache
 * script. Verified and unflagged only: never a per-round estimate or a
 * disputed total (lib/fan/share.ts holds the full curated list).
 */
export const DEFAULT_SHARE_FACT_IDS = ["e25-saf-airfreight-cut", "c25-stem-racing-students"];

/* -------------------------------------------------------------- partner */

export const NARRATIVE_FORMATS = ["linkedin-post", "quarterly-brief", "leadership-update"] as const;
export type NarrativeFormat = (typeof NARRATIVE_FORMATS)[number];

/** Facts a partner narrative may draw on: partner-tagged first, then headline ESG facts. */
export function partnerNarrativeFactIds(partnerId: string, pillars: Pillar[]): string[] {
  const tag = `partner:${partnerId}`;
  const partnerFacts = facts.filter((f) => f.tags.includes(tag) && f.status !== "simulated").map((f) => f.id);
  const hero = facts
    .filter((f) => f.tags.includes("hero") && pillars.includes(f.pillar) && !partnerFacts.includes(f.id))
    .map((f) => f.id);
  // Reserve room for hero facts so a narrower `pillars` selection actually
  // changes the fact set instead of being swamped by partner-tagged facts
  // from every pillar (the partner tag isn't itself pillar-filtered).
  const partnerBudget = Math.max(4, 10 - hero.length);
  return [...partnerFacts.slice(0, partnerBudget), ...hero].slice(0, 10);
}

export function narrativeRequest(format: NarrativeFormat, opts: { partnerId: string; pillars: Pillar[] }): Built {
  return {
    task: format,
    factIds: partnerNarrativeFactIds(opts.partnerId, opts.pillars),
    derived: [],
    params: { partner: opts.partnerId, pillars: [...opts.pillars].sort().join(",") },
  };
}

/** Plain-English explanation of a what-if scenario. Pass runScenario() outputs as derived values. */
export function scenarioExplanationRequest(derived: DerivedValue[], factIds: string[]): Built {
  return { task: "scenario-explanation", factIds: [...new Set(factIds)].sort(), derived, params: {} };
}

export const STORY_KIT_FORMATS = ["post", "funder"] as const;
export type StoryKitFormat = (typeof STORY_KIT_FORMATS)[number];

/**
 * An initiative's own facts for charity copy: the charity's own outcomes
 * (facts tagged `charity:*` that measure how participants felt) before its
 * headcounts, then everything else, with figures the reports print
 * inconsistently left out while an undisputed one remains.
 */
export function storyKitFactIds(initiativeId: string): string[] {
  const initiative = initiatives.find((i) => i.id === initiativeId);
  if (!initiative) throw new Error(`Unknown initiative "${initiativeId}"`);
  const own = initiative.factIds.map(getFact);
  const undisputed = own.filter((f) => !f.flags.some((flag) => flag.kind === "source-conflict"));
  const pool = undisputed.length ? undisputed : own;
  const rank = (f: (typeof own)[number]) => {
    const charity = f.tags.some((t) => t.startsWith("charity:"));
    return charity ? (f.unit === "%" ? 0 : 1) : 2;
  };
  const ids = [...pool].sort((a, b) => rank(a) - rank(b)).map((f) => f.id);
  return ids.length ? ids : byTagAndPillar(initiative.pillar, initiative.interests, 2);
}

/** Impact copy for a community / charity partner, grounded in its initiative's facts. */
export function storyKitRequest(initiativeId: string, format: StoryKitFormat): Built {
  return { task: "story-kit", factIds: storyKitFactIds(initiativeId), derived: [], params: { initiative: initiativeId, format } };
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
