/**
 * Request builders for every AI task. The fan and partner UIs and
 * scripts/warm-cache.ts all build requests through these functions, so the
 * cache keys used at demo time are exactly the ones that were warmed.
 *
 * Signatures are shared contract (lead-owned). The fact selection inside
 * each builder may be tuned by the AI workstream.
 */
import { facts, getFact, initiatives, isDisputed, quizzes } from "@/lib/data/load";
import type { AiRequest, DerivedValue, Fact, FanProfile, Pillar } from "@/lib/data/schemas";

type Built = AiRequest;

/**
 * Never handed to the model or a template: the pay gap and the workforce
 * split only make sense beside the report's own explanation (p55), which a
 * generated paragraph cannot guarantee to carry.
 */
export const NEVER_IN_AI_COPY = ["b25-pay-gap-median", "b25-pay-gap-mean", "b25-women-share"];

/** Facts generated copy may use at all: real, undisputed and not held back above. */
function usableInCopy(f: Fact): boolean {
  return f.status !== "simulated" && !isDisputed(f) && !NEVER_IN_AI_COPY.includes(f.id);
}

/* ------------------------------------------------------------------ fan */

/** The story's chapters at "/", in reading order (lib/story/chapters.ts holds the copy). */
export const CHAPTER_IDS = ["campus", "supply-chain", "moving-the-team", "circuit", "beyond", "finish"] as const;
export type ChapterId = (typeof CHAPTER_IDS)[number];

/**
 * Facts each chapter's "In plain words" / "The detail" paragraph may use, in
 * the order the template tells them. New fans get the first two. Deliberately
 * excluded: the pay gap and workforce share (never in AI personalisation),
 * per-round estimates, the derived renewable share, and the laps comparisons
 * (the story words those itself as the team's own comparison).
 */
export const FAN_CHAPTER_FACTS: Record<ChapterId, string[]> = {
  campus: ["e24-solar-panels", "e25-cups-removed", "e25-circularity", "e25-biodiversity-net-gain"],
  "supply-chain": ["e25-supply-chain-share", "e25-supply-chain", "e25-freight-logistics", "e25-hq-energy"],
  "moving-the-team": ["e25-saf-avoided", "e25-saf-airfreight-cut", "e24-sea-freight-shift", "e25-travel-logistics-cut"],
  circuit: ["e25-event-energy-cut", "e25-trackside-gbr-hvo", "e25-trackside-gbr-grid", "e25-trackside-gbr-solar"],
  beyond: ["c25-stem-racing-students", "e25-ethiopia-children", "c25-maaden-target", "b25-accelerate-pairs"],
  finish: ["e25-progress-scope12", "e25-progress-scope3", "e25-target-scope3", "e25-target-netzero-year"],
};

/** The profile the story uses before a fan has chosen anything (matches lib/fan/quiz.ts DEFAULT_FAN). */
export const STORY_DEFAULT_FAN: FanProfile = { level: "new", cityId: "singapore", interests: ["environment", "stem"] };

/**
 * One chapter's generated paragraph. The story has two depths, so any level
 * other than "die-hard" reads as "new".
 */
export function fanChapterRequest(fan: FanProfile | null, chapterId: ChapterId): Built {
  const base = fan ?? STORY_DEFAULT_FAN;
  const level = base.level === "die-hard" ? "die-hard" : "new";
  const ids = FAN_CHAPTER_FACTS[chapterId];
  return {
    task: "fan-story",
    factIds: level === "new" ? ids.slice(0, 2) : [...ids],
    derived: [],
    fan: { ...base, level },
    params: { chapter: chapterId },
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
  const partnerFacts = facts.filter((f) => f.tags.includes(tag) && usableInCopy(f)).map((f) => f.id);
  const hero = facts
    .filter((f) => f.tags.includes("hero") && usableInCopy(f) && pillars.includes(f.pillar) && !partnerFacts.includes(f.id))
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
 * headcounts, then everything else. Figures the reports print inconsistently
 * are left out, and nothing from outside the initiative is borrowed: a
 * programme with no usable figures of its own gets no story kit.
 */
export function storyKitFactIds(initiativeId: string): string[] {
  const initiative = initiatives.find((i) => i.id === initiativeId);
  if (!initiative) throw new Error(`Unknown initiative "${initiativeId}"`);
  const own = initiative.factIds.map(getFact).filter(usableInCopy);
  const rank = (f: Fact) => {
    const charity = f.tags.some((t) => t.startsWith("charity:"));
    return charity ? (f.unit === "%" ? 0 : 1) : 2;
  };
  return [...own].sort((a, b) => rank(a) - rank(b)).map((f) => f.id);
}

/** Impact copy for a community / charity partner, grounded in its initiative's facts. */
export function storyKitRequest(initiativeId: string, format: StoryKitFormat): Built {
  return { task: "story-kit", factIds: storyKitFactIds(initiativeId), derived: [], params: { initiative: initiativeId, format } };
}

/* ------------------------------------------------------- demo personas */

/**
 * Profiles the offline cache is warmed for. The product only ever sets the
 * reading depth (the story toggle and the quick check), so these are the
 * default fan at both depths.
 */
export const DEMO_PERSONAS: FanProfile[] = [STORY_DEFAULT_FAN, { ...STORY_DEFAULT_FAN, level: "die-hard" }];
