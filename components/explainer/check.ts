/**
 * The number check behind the "See the check work" example on /how-it-works:
 * the desk's Check my draft (lib/ai/check-draft.ts) on one sentence, then the
 * AI guardrail (checkText) on the cited result, exactly as generated text is
 * checked. Deterministic and offline.
 */
import { checkDraft, draftWithCitations } from "@/lib/ai/check-draft";
import { checkText } from "@/lib/ai/guardrail";
import { getFact } from "@/lib/data/load";
import type { GuardrailReport } from "@/lib/data/schemas";

type NumberResult = {
  raw: string;
  start: number;
  end: number;
  /** "context" covers years and ordinals, which are read but not checked. */
  status: "matched" | "held" | "context";
  /** The fact the number matched (matched), or the closest published figure in the sentence's terms (held). */
  factId: string | null;
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
  const draft = checkDraft(input);
  const numbers: NumberResult[] = draft.findings.map((f) => ({
    raw: f.raw,
    start: f.start,
    end: f.end,
    status: f.status,
    factId: f.status === "matched" ? f.factId : f.nearest,
  }));
  const cited = draftWithCitations(draft).text;
  const guardrail = draft.factIds.length ? checkText(cited, { facts: draft.factIds.map(getFact), derived: [] }) : null;
  return { text: draft.text, numbers, cited, guardrail, passed: draft.held === 0 && Boolean(guardrail?.passed) };
}

/** The same figure with its last two digits swapped: the typing slip the example starts from. It is not a fact. */
export function transposed(value: number): string {
  const s = String(Math.round(Math.abs(value)));
  if (s.length < 2) return s;
  return `${s.slice(0, -2)}${s.at(-1)}${s.at(-2)}`;
}
