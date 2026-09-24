/**
 * Curated initiative list for the community partner story kit: verified
 * initiatives whose partner list does not include Cognizant (that's the
 * dashboard's job), spanning the pillars the story kit is meant to cover.
 */
import { initiatives } from "@/lib/data/load";
import type { Initiative } from "@/lib/data/schemas";

export const STORY_KIT_INITIATIVE_IDS = [
  "aleto-leadership",
  "afbe-transition",
  "paddle-uk-seat",
  "gp-trust-industry-day",
  "racing-pride",
  "neurodiversity-week",
] as const;

export function storyKitInitiatives(): Initiative[] {
  return STORY_KIT_INITIATIVE_IDS.map((id) => initiatives.find((i) => i.id === id)).filter((i): i is Initiative => Boolean(i));
}
