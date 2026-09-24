/**
 * Curated KPI lists for the partner dashboard.
 *
 * `why` is a plain, number-free explanation of why a partner reader (comms,
 * sustainability or investor relations) cares about this metric. The number
 * itself is never written here: it always comes from the fact base via
 * <FactValue>/<InlineFact>, so it stays correct if the underlying fact
 * changes.
 */
import { factsWithTag } from "@/lib/data/load";
import type { Fact, Pillar } from "@/lib/data/schemas";

export type Kpi = { factId: string; why: string };

export const PILLAR_KPIS: Record<Pillar, Kpi[]> = {
  environment: [
    {
      factId: "e25-travel-logistics-cut",
      why: "The clearest year-on-year proof point that travel and logistics emissions are falling, the lever the team controls most directly.",
    },
    {
      factId: "e25-saf-avoided",
      why: "Direct evidence that sustainable aviation fuel is displacing high-carbon jet fuel on race freight, a live decarbonisation story.",
    },
    {
      factId: "est-scope12-change-vs-2023",
      why: "The trend line comms, sustainability and investors ask for first: is the team's own footprint rising or falling.",
    },
    {
      factId: "e25-ghg-total-sbti",
      why: "The size of the challenge: the whole footprint the science-based targets are designed to cut.",
    },
    {
      factId: "e25-removals",
      why: "Shows what the team is doing about emissions it cannot yet cut, rather than only offsetting the rest.",
    },
  ],
  belong: [
    {
      factId: "b25-aleto-network",
      why: "A measured outcome for mentees, not just a headcount of who took part in the programme.",
    },
    {
      factId: "b25-women-share",
      why: "A structural inclusion metric that comms and DEI teams are asked to report every year.",
    },
    {
      factId: "b25-accelerate-sentiment",
      why: "Independent proof that a partner-branded mentoring scheme is genuinely valued by the people on it.",
    },
  ],
  community: [
    {
      factId: "c24-esg-impressions",
      why: "How far the team's sustainability and inclusion stories already travel on social media.",
    },
    {
      factId: "c24-esg-posts-multiplier",
      why: "Evidence that impact content outperforms ordinary race-weekend posts, which is the case for doing more of it.",
    },
    {
      factId: "c25-stem-racing-students",
      why: "Global STEM reach at the World Finals held in Singapore, the market this pitch is set in.",
    },
    {
      factId: "c25-charity-2025",
      why: "The simplest number a sustainability or impact report needs: what was raised for good causes.",
    },
  ],
  governance: [
    {
      factId: "g25-cdp",
      why: "An external rating a partner can cite without having to explain the underlying methodology.",
    },
    {
      factId: "g25-assurance",
      why: "Tells a reader the published numbers have been checked by someone outside the team.",
    },
    {
      factId: "g25-sbti",
      why: "Confirms the climate target is validated against a recognised external standard, not self-set.",
    },
    {
      factId: "g-cognizant-role",
      why: "States what Cognizant actually does in the partnership, in the team's own published words.",
    },
  ],
};

/** Tag used across the fact base for facts that describe joint Cognizant activity. */
export const JOINT_PARTNER_TAG = "partner:cognizant";

/** Facts that describe joint Cognizant x Aston Martin Aramco activity, quantitative and qualitative. */
export function jointCognizantFacts(): Fact[] {
  return factsWithTag(JOINT_PARTNER_TAG);
}
