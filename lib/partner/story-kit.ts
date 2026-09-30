/**
 * The community and charity partner story kit: curated initiatives, the
 * co-brand line (from each initiative's own `partners`, never hard-coded),
 * the figures a card may carry and the card sizes the kit exports.
 */
import { STORY_KIT_INITIATIVE_IDS, storyKitFactIds } from "@/lib/ai/requests";
import { getFact, initiatives } from "@/lib/data/load";
import type { Initiative } from "@/lib/data/schemas";

export { STORY_KIT_INITIATIVE_IDS };

export function storyKitInitiatives(): Initiative[] {
  return STORY_KIT_INITIATIVE_IDS.map((id) => initiatives.find((i) => i.id === id)).filter((i): i is Initiative => Boolean(i));
}

/** Organisations named on the card, from the initiative record. Cognizant has its own desk, so it is left off. */
export function coBrandPartners(initiative: Initiative): string[] {
  return initiative.partners.filter((p) => p !== "Cognizant");
}

/** "The Aleto Foundation × Aston Martin Aramco"; several partners join with a middle dot. */
export function coBrandLine(initiative: Initiative): string {
  const partners = coBrandPartners(initiative);
  return partners.length ? `${partners.join(" · ")} × Aston Martin Aramco` : "Aston Martin Aramco";
}

/**
 * At most two figures per card: the charity's own outcomes first, disputed
 * figures left out, and numbers before wording (a venue or a role reads
 * better in the copy than as a card figure).
 */
export function cardFactIds(initiative: Initiative): string[] {
  const own = storyKitFactIds(initiative.id).filter((id) => initiative.factIds.includes(id));
  const numeric = own.filter((id) => getFact(id).value !== null);
  return [...numeric, ...own.filter((id) => !numeric.includes(id))].slice(0, 2);
}

export const CARD_SIZES = [
  { id: "story", label: "Story", ratio: "9:16", width: 1080, height: 1920, use: "Instagram and LinkedIn stories" },
  { id: "portrait", label: "Portrait", ratio: "4:5", width: 1080, height: 1350, use: "Instagram and LinkedIn feed" },
  { id: "landscape", label: "Link", ratio: "1.91:1", width: 1200, height: 628, use: "LinkedIn, X and newsletters" },
] as const;
export type CardSize = (typeof CARD_SIZES)[number];
