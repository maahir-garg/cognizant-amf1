/**
 * The ROI panel: what the team has already published about how far impact
 * content travels, beside the measures a pilot would add. Pilot measures
 * have a definition and a method, never a value: nothing has been measured
 * yet, so nothing is shown.
 */

export type Baseline = { factId: string; why: string };

/** Published reach and sentiment, the baseline a partner would compare a pilot with. */
export const ROI_BASELINES: Baseline[] = [
  { factId: "c24-esg-impressions", why: "How far the team's impact stories already travel." },
  { factId: "c24-esg-impressions-partners", why: "Extra reach when partners, Cognizant included, share the team's stories." },
  { factId: "c24-esg-posts-multiplier", why: "Impact posts outperform a typical race-weekend post." },
  { factId: "c24-esg-conversations", why: "Comments, reposts and quote posts the stories prompted." },
  { factId: "c24-esg-interactions-growth", why: "Interactions per impact post are rising year on year." },
  { factId: "b25-accelerate-sentiment", why: "Sentiment on posts about a partner-led programme." },
];

export type PilotMetric = {
  id: string;
  name: string;
  definition: string;
  method: string;
  audience: "partner" | "charity" | "fan";
  /** The published figure a pilot result is read against, when there is one. */
  baselineFactId?: string;
};

export const PILOT_METRICS: PilotMetric[] = [
  {
    id: "brief-to-approved",
    name: "Time from brief to approved post",
    definition: "Minutes between opening a draft on the desk and a named reviewer approving it.",
    method: "Read from the approval trail's timestamps.",
    audience: "partner",
  },
  {
    id: "first-pass-check",
    name: "First-pass check rate",
    definition: "Share of drafts where every number matches the fact base on the first check.",
    method: "Logged by Check my draft, before any edits.",
    audience: "partner",
  },
  {
    id: "card-shares",
    name: "Card shares",
    definition: "Story-kit and fan cards downloaded, and shares of the links they carry.",
    method: "Download counts plus tagged links, no personal data.",
    audience: "partner",
  },
  {
    id: "partner-amplification",
    name: "Partner amplification",
    definition: "Impressions on posts partners publish from the desk, against the partner impressions the team already reports.",
    method: "Partners' own platform analytics for posts with a desk audit record.",
    audience: "partner",
    baselineFactId: "c24-esg-impressions-partners",
  },
  {
    id: "post-sentiment",
    name: "Sentiment on desk posts",
    definition: "Share of positive reactions to posts drafted on the desk, read against a partner-led programme's published sentiment.",
    method: "The same social listening method the team's report uses.",
    audience: "partner",
    baselineFactId: "b25-accelerate-sentiment",
  },
  {
    id: "charity-time-saved",
    name: "Charity time saved",
    definition: "Hours a charity's comms lead spends turning the team's figures into a post and a funder paragraph, before and with the story kit.",
    method: "Timed in a baseline week, then logged from the story kit's approval trail.",
    audience: "charity",
  },
  {
    id: "charity-outcome",
    name: "One outcome the charity reports",
    definition: "A single measure each charity chooses and publishes itself, such as mentees in work a year on, shown beside the team's figures.",
    method: "Supplied and sourced by the charity, then checked like any other fact before it appears.",
    audience: "charity",
  },
  {
    id: "story-completion",
    name: "Story completion",
    definition: "Share of visitors who reach the final chapter of the story.",
    method: "Anonymous, cookie-free page analytics.",
    audience: "fan",
  },
  {
    id: "next-race-return",
    name: "Next-race return",
    definition: "Share of visitors who come back in the week of the next race.",
    method: "Anonymous, cookie-free page analytics.",
    audience: "fan",
  },
  {
    id: "consented-recall",
    name: "Recall of Cognizant's role",
    definition: "Share of surveyed fans who can name Cognizant's role in the partnership after the story.",
    method: "Opt-in survey with consent, compared with a group who did not see the story.",
    audience: "fan",
  },
];

/**
 * A first-year cost range for the 2027 pilot. Not a team or Cognizant
 * figure: it is our planning assumption, built from the pilot team in
 * docs/ROI.md and an assumed cost per person, so every step is shown and
 * can be replaced with real rates.
 */
export const PILOT_COST_ASSUMPTION = {
  people: [
    { role: "Product lead", fte: 1 },
    { role: "Engineers", fte: 2 },
    { role: "ESG data analyst", fte: 1 },
    { role: "Designer", fte: 0.5 },
  ],
  /** Assumed fully loaded annual cost per full-time person, GBP. */
  perPerson: { low: 90_000, high: 130_000 },
  /** Assumed model, hosting and tooling for a season, GBP. */
  running: { low: 10_000, high: 30_000 },
} as const;

export function pilotCostRange(a = PILOT_COST_ASSUMPTION): { fte: number; low: number; high: number } {
  const fte = a.people.reduce((sum, p) => sum + p.fte, 0);
  return { fte, low: fte * a.perPerson.low + a.running.low, high: fte * a.perPerson.high + a.running.high };
}
