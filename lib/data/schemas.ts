/**
 * Shared data contract. Every JSON file in /data is parsed through these
 * schemas at load time (lib/data/load.ts) and in `npm run verify:data`.
 *
 * Trust model
 *  - verified:  value printed in a source document. Requires sourceId, page and
 *               a verbatim quote that `verify:data` finds on that page.
 *  - estimated: value computed from verified inputs with a documented
 *               expression. `verify:data` recomputes it.
 *  - simulated: demo data. Must say why in `notes`. Never shown without a label.
 */
import { z } from "zod";

export const PILLARS = ["environment", "belong", "community", "governance"] as const;
export const Pillar = z.enum(PILLARS);
export type Pillar = z.infer<typeof Pillar>;

export const STATUSES = ["verified", "estimated", "simulated"] as const;
export const Status = z.enum(STATUSES);
export type Status = z.infer<typeof Status>;

export const INTERESTS = ["environment", "community", "inclusion", "stem", "tech"] as const;
export const Interest = z.enum(INTERESTS);
export type Interest = z.infer<typeof Interest>;

const Slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "lowercase-kebab id");
const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD");

/* ------------------------------------------------------------------ sources */

export const Source = z.object({
  id: Slug,
  title: z.string(),
  publisher: z.string(),
  kind: z.enum(["pdf", "web", "dataset"]),
  url: z.url(),
  /** Original file, relative to repo root. PDFs are gitignored; see docs/data-sources.md. */
  localPath: z.string().optional(),
  /** Per-page plain text, committed. JSON array of strings, index 0 = page 1. */
  textPath: z.string().optional(),
  retrieved: IsoDate,
  published: z.string().optional(),
  pageCount: z.number().int().positive().optional(),
  notes: z.string().optional(),
});
export type Source = z.infer<typeof Source>;

/* -------------------------------------------------------------------- facts */

export const Derivation = z.object({
  /** Human-readable formula shown in the provenance drawer. */
  formula: z.string(),
  /** Machine expression over input ids in braces, e.g. "{a} / {b} * 100". */
  expression: z.string(),
  inputs: z.array(Slug).min(1),
  assumptions: z.array(z.string()).default([]),
});
export type Derivation = z.infer<typeof Derivation>;

export const QUALITY_FLAGS = [
  "source-conflict",
  "restated",
  "not-comparable",
  "inconsistent-equivalence",
  "ambiguous-layout",
] as const;

export const QualityFlag = z.object({
  kind: z.enum(QUALITY_FLAGS),
  note: z.string(),
  relatedFactIds: z.array(Slug).default([]),
});
export type QualityFlag = z.infer<typeof QualityFlag>;

export const Fact = z
  .object({
    id: Slug,
    pillar: Pillar,
    /** Short grouping key, e.g. "emissions", "freight", "mentoring", "fundraising". */
    topic: z.string(),
    /** Plain label, e.g. "Air-freight emissions avoided through SAF". */
    metric: z.string(),
    /** Numeric value, or null for qualitative facts (then `valueText` is required). */
    value: z.number().nullable(),
    /** Qualitative value, e.g. CDP grade "B" or "Limited assurance (ISO 14064-3)". */
    valueText: z.string().optional(),
    /** Canonical unit: "tCO2e", "%", "students", "GBP", "kWh", "count", "text", ... */
    unit: z.string(),
    period: z.string(),
    /** How the source prints the number, when that differs from `value` (e.g. "£300K+"). */
    display: z.string().optional(),
    qualifier: z.enum(["exact", "at-least", "approximately", "target"]).default("exact"),
    status: Status,
    sourceId: Slug.optional(),
    /** PDF page index (1-based). For the AMF1 reports this equals the printed page number. */
    page: z.number().int().positive().optional(),
    /**
     * Verbatim excerpt from the cited page. Table cells that the PDF text layer
     * splits apart can be quoted as fragments joined by " … "; each fragment
     * must appear on the page.
     */
    quote: z.string().optional(),
    derivation: Derivation.optional(),
    flags: z.array(QualityFlag).default([]),
    /** Interests and partner tags used by the relevance engine, e.g. "stem", "partner:cognizant". */
    tags: z.array(z.string()).default([]),
    extractedAt: IsoDate,
    notes: z.string().optional(),
  })
  .superRefine((f, ctx) => {
    if (f.value === null && !f.valueText) {
      ctx.addIssue({ code: "custom", message: `${f.id}: qualitative facts need valueText` });
    }
    if (f.status === "verified" && (!f.sourceId || !f.page || !f.quote)) {
      ctx.addIssue({ code: "custom", message: `${f.id}: verified facts need sourceId, page and quote` });
    }
    if (f.status === "estimated" && !f.derivation) {
      ctx.addIssue({ code: "custom", message: `${f.id}: estimated facts need a derivation` });
    }
    if (f.status === "simulated" && !f.notes) {
      ctx.addIssue({ code: "custom", message: `${f.id}: simulated facts must explain themselves in notes` });
    }
  });
export type Fact = z.infer<typeof Fact>;

/* -------------------------------------------------------------- initiatives */

export const Initiative = z.object({
  id: Slug,
  name: z.string(),
  pillar: Pillar,
  summary: z.string(),
  partners: z.array(z.string()).default([]),
  /** City ids from data/cities.json where the initiative physically happened. */
  cityIds: z.array(Slug).default([]),
  /** True if the initiative is delivered online or across many locations. */
  global: z.boolean().default(false),
  interests: z.array(Interest).min(1),
  year: z.string(),
  factIds: z.array(Slug).default([]),
  /** Race weekend link, if the source ties it to a Grand Prix. */
  raceIds: z.array(Slug).default([]),
  status: Status,
  sourceId: Slug.optional(),
  page: z.number().int().positive().optional(),
  notes: z.string().optional(),
});
export type Initiative = z.infer<typeof Initiative>;

/* ------------------------------------------------------------------- cities */

export const City = z.object({
  id: Slug,
  name: z.string(),
  country: z.string(),
  /** Nearest Grand Prix in races.json, used to pick a "home race". */
  homeRaceId: Slug.optional(),
});
export type City = z.infer<typeof City>;

/* -------------------------------------------------------------------- races */

export const Race = z.object({
  id: Slug,
  name: z.string(),
  season: z.number().int(),
  round: z.number().int().positive().optional(),
  circuit: z.string().optional(),
  cityId: Slug,
  country: z.string(),
  start: IsoDate.optional(),
  end: IsoDate.optional(),
  timezone: z.string().optional(),
  hero: z.boolean().default(false),
  /** Facts that describe this weekend specifically (trackside energy, allocations, ...). */
  factIds: z.array(Slug).default([]),
  status: Status,
  sourceId: Slug.optional(),
  page: z.number().int().positive().optional(),
  notes: z.string().optional(),
});
export type Race = z.infer<typeof Race>;

/* -------------------------------------------------------- conversion factors */

export const ConversionFactor = z.object({
  id: Slug,
  /** Plural noun phrase used in copy: "laps of Silverstone". */
  label: z.string(),
  singular: z.string(),
  /** kg CO2e represented by one unit of this equivalent. */
  kgCO2ePerUnit: z.number().positive(),
  status: z.enum(["verified", "estimated"]),
  sourceId: Slug,
  page: z.number().int().positive().optional(),
  /** Row id or section name inside the source, when there is no page. */
  ref: z.string().optional(),
  quote: z.string().optional(),
  derivation: Derivation.optional(),
  region: z.string(),
  audience: z.enum(["fan", "partner", "both"]).default("both"),
  notes: z.string().optional(),
});
export type ConversionFactor = z.infer<typeof ConversionFactor>;

/** Per-passenger travel factors for the "pick the lower-carbon option" mechanic. */
export const TravelMode = z.object({
  id: Slug,
  label: z.string(),
  kgCO2ePerPassengerKm: z.number().nonnegative(),
  status: z.enum(["verified", "estimated"]),
  sourceId: Slug,
  ref: z.string(),
  notes: z.string().optional(),
});
export type TravelMode = z.infer<typeof TravelMode>;

/* --------------------------------------------------------- simulated events */

export const EVENT_TYPES = ["freight", "session", "community", "milestone", "data"] as const;

export const FeedEvent = z.object({
  id: Slug,
  raceId: Slug,
  /** Seconds after the replay starts. */
  at: z.number().nonnegative(),
  /** Race-weekend clock label shown in the feed, e.g. "THU 14:10". */
  clock: z.string(),
  type: z.enum(EVENT_TYPES),
  title: z.string(),
  detail: z.string(),
  /** Facts the event text relies on (verified background, not the event itself). */
  factIds: z.array(Slug).default([]),
  /** Increments a simulated live counter, e.g. { counter: "sg-students-reached", by: 40 }. */
  increment: z.object({ counter: Slug, by: z.number() }).optional(),
  status: z.literal("simulated"),
});
export type FeedEvent = z.infer<typeof FeedEvent>;

export const Counter = z.object({
  id: Slug,
  label: z.string(),
  unit: z.string(),
  start: z.number(),
  /** Milestone thresholds that fire an alert when crossed. */
  milestones: z.array(z.number()).default([]),
  status: z.literal("simulated"),
  notes: z.string(),
});
export type Counter = z.infer<typeof Counter>;

/* -------------------------------------------------------------- quiz beats */

export const Quiz = z.object({
  id: Slug,
  pillar: Pillar,
  /** The fact whose value is the answer. */
  factId: Slug,
  question: z.string(),
  options: z.array(z.string()).min(2).max(4),
  answerIndex: z.number().int().nonnegative(),
  /** Fan levels that see this beat. New fans see the most. */
  levels: z.array(z.enum(["new", "casual", "die-hard"])).min(1),
  explainer: z.string(),
});
export type Quiz = z.infer<typeof Quiz>;

/* -------------------------------------------------------------- fan profile */

export const FAN_LEVELS = ["new", "casual", "die-hard"] as const;
export const FanLevel = z.enum(FAN_LEVELS);
export type FanLevel = z.infer<typeof FanLevel>;

export const FanProfile = z.object({
  level: FanLevel,
  cityId: Slug,
  interests: z.array(Interest).min(1),
});
export type FanProfile = z.infer<typeof FanProfile>;

/* ---------------------------------------------------------------- AI layer */

export const AI_TASKS = [
  "fan-story",
  "quiz-reveal",
  "share-caption",
  "linkedin-post",
  "quarterly-brief",
  "investor-summary",
  "scenario-explanation",
  "story-kit",
] as const;
export const AiTask = z.enum(AI_TASKS);
export type AiTask = z.infer<typeof AiTask>;

/** A number the model may use that is not a fact: a documented calculation. */
export const DerivedValue = z.object({
  id: Slug,
  label: z.string(),
  value: z.number(),
  unit: z.string(),
  formula: z.string(),
});
export type DerivedValue = z.infer<typeof DerivedValue>;

export const AiRequest = z.object({
  task: AiTask,
  factIds: z.array(Slug).min(1),
  derived: z.array(DerivedValue).default([]),
  fan: FanProfile.optional(),
  /** Free-form knobs, e.g. { pillar: "environment", partner: "cognizant", tone: "punchy" }. */
  params: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
});
export type AiRequest = z.infer<typeof AiRequest>;

export const CheckedNumber = z.object({
  raw: z.string(),
  value: z.number(),
  /** Fact id or derived id that justifies the number, or null when unmatched. */
  matchedId: z.string().nullable(),
});
export type CheckedNumber = z.infer<typeof CheckedNumber>;

export const GuardrailReport = z.object({
  passed: z.boolean(),
  checked: z.array(CheckedNumber),
  unknownCitations: z.array(z.string()),
  reasons: z.array(z.string()),
});
export type GuardrailReport = z.infer<typeof GuardrailReport>;

export const AiResponse = z.object({
  task: AiTask,
  /** Text with inline citations of the form [F:fact-id] or [D:derived-id]. */
  text: z.string(),
  citations: z.array(z.string()),
  generator: z.object({
    kind: z.enum(["model", "template"]),
    model: z.string().optional(),
  }),
  guardrail: GuardrailReport,
  attempts: z.number().int().positive(),
  cacheKey: z.string(),
  cached: z.boolean(),
  createdAt: z.string(),
});
export type AiResponse = z.infer<typeof AiResponse>;
