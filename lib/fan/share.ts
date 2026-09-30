/**
 * The share card's curated fact list. Only verified, unflagged figures that
 * read well out of context: no per-round estimates, no disputed totals, and
 * never the pay gap or workforce split (they need the report's explanation
 * next to them). The labels are the short card wording, kept to two lines
 * at card size; the figure itself always comes from the fact base.
 */
import { factCitation, getFact, getSource, sourceShortName } from "@/lib/data/load";
import { factParts } from "@/lib/format";

export const SHARE_FACTS: { id: string; label: string }[] = [
  { id: "e25-saf-airfreight-cut", label: "cut in air-freight emissions, from cleaner fuel" },
  { id: "c25-stem-racing-students", label: "students met at the STEM Racing World Finals" },
  { id: "e25-supply-chain-share", label: "of the team's footprint is its supply chain" },
  { id: "e25-progress-scope12", label: "direct emissions against the baseline year" },
  { id: "e24-solar-panels", label: "solar panels on the factory roof" },
  { id: "e25-circularity", label: "material circularity of the AMR25 car" },
];

export const SHARE_FACT_IDS = SHARE_FACTS.map((f) => f.id);
export const SHARE_MAX_FACTS = 3;

/**
 * The figure as the card prints it: symbols stay ("31%", "600+"), word units
 * move into the label ("600+" + "students met at…"), and a true minus sign.
 */
export function shareFactValue(id: string): string {
  const p = factParts(getFact(id));
  const symbol = p.unit === "%" || p.unit === "×" ? p.unit : "";
  return `${p.prefix}${p.value.replace(/^-/, "−")}${symbol}${p.suffix}`;
}

export function shareFactLabel(id: string): string {
  return SHARE_FACTS.find((f) => f.id === id)?.label ?? getFact(id).metric;
}

/** Keeps only curated ids, in curated order, at most three; falls back to the defaults. */
export function sanitiseShareFacts(ids: string[], fallback: string[]): string[] {
  const picked = SHARE_FACT_IDS.filter((id) => ids.includes(id)).slice(0, SHARE_MAX_FACTS);
  return picked.length ? picked : fallback;
}

/** "2025 report, pp. 24, 68 · 2024 report, p. 25": one line naming every page the card's figures come from. */
export function shareSourceLine(ids: string[]): string {
  const pages = new Map<string, number[]>();
  const other: string[] = [];
  for (const id of ids) {
    const fact = getFact(id);
    if (fact.sourceId && fact.page && getSource(fact.sourceId).kind === "pdf") {
      const list = pages.get(fact.sourceId) ?? [];
      if (!list.includes(fact.page)) list.push(fact.page);
      pages.set(fact.sourceId, list);
    } else {
      const label = factCitation(fact).label;
      if (!other.includes(label)) other.push(label);
    }
  }
  const parts = [...pages.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([sid, list]) => {
      const sorted = [...list].sort((a, b) => a - b);
      return `${sourceShortName(sid)}, ${sorted.length > 1 ? "pp." : "p."} ${sorted.join(", ")}`;
    });
  return [...parts, ...other].join(" · ");
}
