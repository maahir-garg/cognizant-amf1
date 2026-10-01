/**
 * Captions for desk stat tiles. A tile prints the figure with its unit
 * ("600+ students"), so the caption reads on from it ("at the STEM Racing
 * World Finals in Singapore") instead of repeating the unit. Words only: the
 * figure always comes from the fact.
 */
import { getFact } from "@/lib/data/load";
import { unitLabel } from "@/lib/format";

const DESK_CAPTIONS: Record<string, string> = {
  "c25-stem-racing-students": "at the STEM Racing World Finals in Singapore",
  "c25-stem-racing-countries": "represented among those students",
  "m-stem-programme-reach": "reached by the team's STEM programme, in the UK and at race locations",
  "c25-mam-day-students": "at Make A Mark Day, where Cognizant ran the careers sessions",
  "c25-mam-day-schools": "represented at Make A Mark Day",
  "c25-mam-day-early-careers": "at Make A Mark Day met the Early Careers team",
  "c25-ai-skills-gap": "of Make A Mark Day students started the day unsure what skills AI work needs",
  "c24-mam-day-students": "at Make A Mark Day in British Grand Prix week, the year before",
  "c24-esg-impressions": "for the team's ESG content across owned and earned social channels",
  "c24-esg-impressions-partners": "more when partners, Cognizant included, shared the team's stories",
  "c24-esg-posts-multiplier": "the impressions of a typical race weekend, for ESG posts",
  "c24-esg-conversations": "prompted by ESG posts: comments, reposts and quote posts",
  "c24-esg-interactions-growth": "growth in average interactions per ESG post on the year before",
  "b25-accelerate-sentiment": "positive sentiment on posts about Accelerate Women",
};

/** The words a unit is printed as, singular and plural ("students", "student"). */
function unitWords(unit: string): string[] {
  const label = unitLabel(unit).toLowerCase();
  if (!/[a-z]/.test(label)) return [];
  return [label, label.replace(/s$/, ""), label.split(" ")[0], label.split(" ")[0].replace(/s$/, "")].filter(Boolean);
}

/** True when a caption starts with the unit the tile has just printed ("students at ..."). */
export function repeatsUnit(caption: string, unit: string): boolean {
  const first = caption.toLowerCase();
  return unitWords(unit).some((w) => first === w || first.startsWith(`${w} `) || first.startsWith(`${w},`));
}

/** Drops a leading unit word from a caption, so a fallback metric label still reads on from the figure. */
export function withoutLeadingUnit(caption: string, unit: string): string {
  if (!repeatsUnit(caption, unit)) return caption;
  const words = unitWords(unit).sort((a, b) => b.length - a.length);
  const lower = caption.toLowerCase();
  const w = words.find((x) => lower.startsWith(x));
  return w ? caption.slice(w.length).replace(/^[\s,]+/, "") : caption;
}

/** The caption a desk tile shows under a figure. */
export function deskCaption(factId: string): string {
  const fact = getFact(factId);
  return withoutLeadingUnit(DESK_CAPTIONS[factId] ?? fact.metric, fact.unit);
}

export const DESK_CAPTION_IDS = Object.keys(DESK_CAPTIONS);
