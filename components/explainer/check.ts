/**
 * The number check behind the "See the check work" example on /how-it-works.
 *
 * Two real stages, both deterministic and offline:
 *  1. Every number in the sentence is looked up in the whole fact base
 *     (numbersMatch, the same tolerance the guardrail uses). A number only
 *     counts as matched when the sentence also shares words with the fact,
 *     so a value that happens to exist elsewhere is not enough.
 *  2. The matched facts are cited inline and the cited sentence is run
 *     through the AI guardrail (checkText), exactly as generated text is.
 *
 * The desk's Check my draft does a fuller version of stage 1 (units,
 * cautions, wording rules); this file keeps the explainer self-contained.
 */
import { checkText } from "@/lib/ai/guardrail";
import { facts, getFact } from "@/lib/data/load";
import { extractNumbers, numbersMatch } from "@/lib/data/numbers";
import type { Fact, GuardrailReport } from "@/lib/data/schemas";

export type NumberResult = {
  raw: string;
  start: number;
  end: number;
  status: "matched" | "held" | "year";
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

const STOP = new Set(["with", "from", "that", "this", "their", "than", "into", "over", "across", "about", "including", "team", "team's"]);

function words(text: string): Set<string> {
  const out = new Set<string>();
  for (const m of text.toLowerCase().matchAll(/[a-z][a-z']{3,}/g)) {
    const w = m[0].replace(/'s$/, "").replace(/s$/, "");
    if (!STOP.has(m[0]) && !STOP.has(w)) out.add(w);
  }
  return out;
}

const bags = new Map<string, Set<string>>();
function bag(f: Fact): Set<string> {
  let b = bags.get(f.id);
  if (!b) {
    b = words(`${f.metric} ${f.phrase?.replace(/\{\w+\}/g, "") ?? ""} ${f.topic}`);
    bags.set(f.id, b);
  }
  return b;
}

function overlap(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const w of a) if (b.has(w)) n++;
  return n;
}

export function checkSentence(input: string): SentenceCheck {
  const text = input.normalize("NFKC");
  const terms = words(text);
  const numeric = facts.filter((f) => f.value !== null && f.status !== "simulated");

  const numbers: NumberResult[] = extractNumbers(text).map((n) => {
    const base = { raw: n.raw, start: n.index, end: n.index + n.raw.length };
    if (/^\d{4}$/.test(n.raw) && n.value >= 1900 && n.value <= 2100) return { ...base, status: "year", factId: null };

    const sameKind = numeric.filter((f) => (f.unit === "%") === n.percent);
    const matches = sameKind
      .filter((f) => numbersMatch(n, Math.abs(f.value!)))
      .map((f) => ({ f, score: overlap(terms, bag(f)) }))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score);
    if (matches.length) return { ...base, status: "matched", factId: matches[0].f.id };

    // Nothing matches: name the published figure the sentence seems to be about, if one is close.
    const nearest = sameKind
      .map((f) => ({ f, score: overlap(terms, bag(f)), rel: Math.abs(n.value - Math.abs(f.value!)) / Math.abs(f.value!) }))
      .filter((c) => c.score >= 2 && c.rel <= 0.25)
      .sort((a, b) => b.score - a.score || a.rel - b.rel)[0];
    return { ...base, status: "held", factId: nearest?.f.id ?? null };
  });

  let cited = "";
  let last = 0;
  for (const r of numbers) {
    if (r.status !== "matched") continue;
    cited += `${text.slice(last, r.end)} [F:${r.factId}]`;
    last = r.end;
  }
  cited += text.slice(last);

  const ids = [...new Set(numbers.filter((r) => r.status === "matched").map((r) => r.factId!))];
  const guardrail = ids.length ? checkText(cited, { facts: ids.map(getFact), derived: [] }) : null;
  const held = numbers.some((r) => r.status === "held");
  return { text, numbers, cited, guardrail, passed: !held && Boolean(guardrail?.passed) };
}

/** The same figure with its last two digits swapped: the typing slip the example starts from. It is not a fact. */
export function transposed(value: number): string {
  const s = String(Math.round(Math.abs(value)));
  if (s.length < 2) return s;
  return `${s.slice(0, -2)}${s.at(-1)}${s.at(-2)}`;
}
