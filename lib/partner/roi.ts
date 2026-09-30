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

export type PilotMetric = { id: string; name: string; definition: string; method: string; audience: "partner" | "fan" };

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
