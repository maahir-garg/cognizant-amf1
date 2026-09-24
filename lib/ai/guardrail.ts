/**
 * Numeric guardrail for generated text.
 *
 * Rules (all must hold for `passed`):
 *  1. Every citation [F:id] / [D:id] refers to a fact or derived value that
 *     was supplied with the request.
 *  2. Every number in the text matches (exactly, or as a faithful rounding) a
 *     number belonging to a fact or derived value that the text CITES.
 *     A fact's numbers are its value plus any figure in its period, quote,
 *     display or valueText (so "2025" is fine next to a 2025 fact).
 *  3. The text cites at least one supplied id.
 *
 * Number words ("three") are not checked; templates and prompts avoid them.
 */
import { extractNumbers, numbersMatch, type FoundNumber } from "@/lib/data/numbers";
import type { CheckedNumber, DerivedValue, Fact, GuardrailReport } from "@/lib/data/schemas";

export const CITATION_RE = /\[(F|D):([a-z0-9]+(?:-[a-z0-9]+)*)\]/g;

export function parseCitations(text: string): string[] {
  return [...new Set([...text.matchAll(CITATION_RE)].map((m) => m[2]))];
}

/** Text with citation markers removed, for display or for length checks. */
export function stripCitations(text: string): string {
  return text.replace(CITATION_RE, "").replace(/\s+([.,;:!?])/g, "$1").replace(/[ \t]{2,}/g, " ").trim();
}

type Allowed = { id: string; values: number[] };

function allowedFor(fact: Fact): Allowed {
  const values: number[] = [];
  if (fact.value !== null) values.push(Math.abs(fact.value));
  for (const text of [fact.period, fact.quote, fact.display, fact.valueText]) {
    if (text) values.push(...extractNumbers(text).map((n) => n.value));
  }
  return { id: fact.id, values };
}

function allowedForDerived(d: DerivedValue): Allowed {
  return { id: d.id, values: [Math.abs(d.value), ...extractNumbers(d.formula).map((n) => n.value)] };
}

function matchNumber(n: FoundNumber, pool: Allowed[]): string | null {
  for (const a of pool) {
    if (a.values.some((v) => numbersMatch(n, v))) return a.id;
  }
  return null;
}

export function checkText(text: string, supplied: { facts: Fact[]; derived: DerivedValue[] }): GuardrailReport {
  const reasons: string[] = [];
  const known = new Map<string, Allowed>();
  for (const f of supplied.facts) known.set(f.id, allowedFor(f));
  for (const d of supplied.derived) known.set(d.id, allowedForDerived(d));

  const cited = parseCitations(text);
  const unknownCitations = cited.filter((id) => !known.has(id));
  if (unknownCitations.length) reasons.push(`Cites ids that were not supplied: ${unknownCitations.join(", ")}`);
  if (cited.length === 0) reasons.push("No citations: every generated text must cite at least one fact.");

  const citedPool = cited.map((id) => known.get(id)).filter((a): a is Allowed => Boolean(a));
  const uncitedPool = [...known.values()].filter((a) => !cited.includes(a.id));

  const checked: CheckedNumber[] = [];
  for (const n of extractNumbers(stripCitations(text))) {
    const matchedId = matchNumber(n, citedPool);
    checked.push({ raw: n.raw, value: n.value, matchedId });
    if (!matchedId) {
      const wouldMatch = matchNumber(n, uncitedPool);
      reasons.push(
        wouldMatch
          ? `"${n.raw}" matches ${wouldMatch}, which the text does not cite`
          : `"${n.raw}" does not match any cited fact or calculation`,
      );
    }
  }

  return { passed: reasons.length === 0, checked, unknownCitations, reasons };
}
