/**
 * The number check behind the "See the check work" example on /how-it-works.
 * A thin view over the desk's own checker, so the explainer shows exactly
 * what partners get:
 *  1. lib/ai/check-draft.ts matches every number to a published figure by
 *     value and by what the sentence says it counts, and flags right numbers
 *     in the wrong framing (scope, place, targets, restated years, sensitive
 *     figures) as needing rewording.
 *  2. The matched facts are cited inline and the cited sentence is run
 *     through the AI guardrail (checkText), exactly as generated text is.
 */
import { checkDraft, draftWithCitations } from "@/lib/ai/check-draft";
import { checkText } from "@/lib/ai/guardrail";
import { getFact } from "@/lib/data/load";
import type { GuardrailReport } from "@/lib/data/schemas";

export type NumberResult = {
  raw: string;
  start: number;
  end: number;
  /** "context" covers years and ordinals, which are read but not checked. */
  status: "matched" | "wording" | "held" | "context";
  /** The fact the number matched (matched, wording), or the closest published figure (held). */
  factId: string | null;
  /** Why it was held back or needs rewording. */
  reason: string;
  needs: string[];
};

export type SentenceCheck = {
  text: string;
  numbers: NumberResult[];
  /** The sentence with an [F:id] citation after every matched number: what the guardrail reads. */
  cited: string;
  guardrail: GuardrailReport | null;
  passed: boolean;
};

export function checkSentence(input: string): SentenceCheck {
  const check = checkDraft(input);
  const numbers: NumberResult[] = check.findings.map((f) => ({
    raw: f.raw,
    start: f.start,
    end: f.end,
    status: f.status,
    factId: f.status === "held" ? f.nearest : f.factId,
    reason: f.reason,
    needs: f.needs,
  }));
  const { text: cited, citations } = draftWithCitations(check);
  const guardrail = citations.length ? checkText(cited, { facts: citations.map(getFact), derived: [] }) : null;
  return { text: check.text, numbers, cited, guardrail, passed: check.ok && Boolean(guardrail?.passed) };
}

/** The same figure with its last two digits swapped: the typing slip the example starts from. It is not a fact. */
export function transposed(value: number): string {
  const s = String(Math.round(Math.abs(value)));
  if (s.length < 2) return s;
  return `${s.slice(0, -2)}${s.at(-1)}${s.at(-2)}`;
}
