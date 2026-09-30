/**
 * "Check my draft": matches every number in a partner's own copy against the
 * fact base. Deterministic and offline (no model call), so the result is
 * instant and the same every time.
 *
 * A number is matched only when its value agrees with a fact (same rules as
 * the AI guardrail, via numbersMatch) AND the sentence around it points at
 * that fact: the unit after the number, or words it shares with the fact's
 * metric, phrase, topic, partner tags or initiative. A bare value that
 * happens to exist somewhere in the fact base is not enough. Everything else
 * is held back with a reason. Years and ordinals are read as context, not
 * as claims.
 */
import { extractNumbers, numbersMatch, type FoundNumber } from "@/lib/data/numbers";
import { factCitation, facts as allFacts, findFact, initiatives } from "@/lib/data/load";
import type { Fact } from "@/lib/data/schemas";

export type FindingStatus = "matched" | "held" | "context";

export type DraftFinding = {
  /** The number as written, e.g. "257", "£140,000", "93%". */
  raw: string;
  value: number;
  /** Offsets into `DraftCheck.text`. */
  start: number;
  end: number;
  status: FindingStatus;
  /** The fact the number is matched to (matched only). */
  factId: string | null;
  /** Other facts the number could refer to, best first. */
  alternatives: string[];
  /** For held numbers: the closest published figure of the same kind, if any. */
  nearest: string | null;
  /** One plain sentence explaining the result. Never contains a fact's figure. */
  reason: string;
  /** Things to watch even when matched: estimates, disputed figures, framing rules. */
  cautions: string[];
};

export type WordingNote = { phrase: string; start: number; end: number; reason: string };

export type DraftCheck = {
  /** The text that was checked (NFKC-normalised, which the offsets refer to). */
  text: string;
  findings: DraftFinding[];
  wording: WordingNote[];
  matched: number;
  held: number;
  /** True when there is at least one number and none is held back. */
  ok: boolean;
  /** Matched fact ids in order of first use. */
  factIds: string[];
};

/* ------------------------------------------------------------ tokens */

const STOPWORDS = new Set(
  "the and for with from that this than into over across about more most its our their your has have had was were are is been being which who what when where while also just only some each per all any not but out off one via like very".split(
    " ",
  ),
);

function stem(word: string): string {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function tokens(text: string): Set<string> {
  const out = new Set<string>();
  for (const m of text.toLowerCase().matchAll(/[a-z][a-z'-]*/g)) {
    for (const part of m[0].split(/[-']/)) {
      if (part.length >= 3 && !STOPWORDS.has(part)) out.add(stem(part));
    }
  }
  return out;
}

/** Words a fact can be recognised by: metric, phrase, topic, partner names and the initiatives that cite it. */
const bagCache = new Map<string, Set<string>>();
function factBag(f: Fact): Set<string> {
  const cached = bagCache.get(f.id);
  if (cached) return cached;
  const names = initiatives.filter((i) => i.factIds.includes(f.id)).flatMap((i) => [i.name, ...i.partners]);
  const tagWords = f.tags.map((t) => t.replace(/^(partner|charity):/, ""));
  const bag = tokens([f.metric, f.phrase?.replace(/\{\w+\}/g, "") ?? "", f.topic, ...tagWords, ...names].join(" "));
  bagCache.set(f.id, bag);
  return bag;
}

/** Words that may follow a number to name its unit, per fact unit. */
const UNIT_WORDS: Record<string, string[]> = {
  tCO2e: ["tco2e", "tonne", "ton", "t", "co2e", "carbon"],
  tonnes: ["tonne", "ton", "t"],
  "m²": ["m2", "square", "sqm"],
  impressions: ["impression", "view"],
  "young people": ["young", "people", "student", "child"],
  "schools and groups": ["school", "group"],
  x: ["x", "time"],
  GJ: ["gj", "gigajoule"],
  kWh: ["kwh"],
};

function unitWordsFor(f: Fact): string[] {
  return UNIT_WORDS[f.unit] ?? [...tokens(f.unit)];
}

/** The one or two words straight after a number, e.g. "students", "tCO2e removed". */
function followingWords(text: string, end: number): string[] {
  const m = /^[\s-]*([A-Za-z][A-Za-z0-9²]*)(?:\s+([A-Za-z][A-Za-z0-9²]*))?/.exec(text.slice(end));
  if (!m) return [];
  return [m[1], m[2]]
    .filter((w): w is string => Boolean(w))
    .map((w) => stem(w.toLowerCase().replace("²", "2")));
}

/* ------------------------------------------------------------ cautions */

/** Framing rules the stakeholders set for particular figures (see DESIGN.md, stakeholder guardrails). */
const FACT_CAUTIONS: Record<string, string> = {
  "b25-pay-gap-median":
    "Pay gap figures need the report's own explanation beside them: a pay gap is not unequal pay, it reflects representation. Lead with what the team is doing.",
  "b25-pay-gap-mean":
    "Pay gap figures need the report's own explanation beside them: a pay gap is not unequal pay, it reflects representation. Lead with what the team is doing.",
  "b25-women-share": "Pair the women's share with the report's explanation of representation and what the team is doing about it.",
  "est-freight-per-round": "This is the season total divided evenly across the rounds. Don't present it as a Singapore figure.",
  "est-travel-per-round": "This is the season total divided evenly across the rounds. Don't present it as a Singapore figure.",
  "est-saf-per-round": "This is the season total divided evenly across the rounds. Don't present it as a Singapore figure.",
  "est-rego-share": "Say \"renewable energy-backed supply\" rather than quoting a renewable share.",
  "e25-event-energy-cut": "This cut applies to European races only. Singapore trackside energy is not published.",
  "e25-removals": "Removals deal with emissions the team cannot eliminate yet. Never call them neutral, negative or an offset.",
  "e25-removals-vs-scope12": "Removals deal with emissions the team cannot eliminate yet. Never call them neutral, negative or an offset.",
};

const FLAG_CAUTIONS: Record<string, string> = {
  "source-conflict": "The reports print different values for this figure in different places. Check Data quality before using it.",
  restated: "This figure was restated. Don't compare it directly with figures from other years.",
  "not-comparable": "Not directly comparable with the same figure in other years.",
  "inconsistent-equivalence": "The reports use inconsistent equivalences for this comparison.",
  "ambiguous-layout": "The report's layout makes this figure ambiguous. Check the page before using it.",
};

function cautionsFor(f: Fact): string[] {
  const out: string[] = [];
  if (f.status === "estimated") out.push("This is an estimate calculated from published figures. Say so in the copy.");
  for (const flag of f.flags) {
    const c = FLAG_CAUTIONS[flag.kind];
    if (c && !out.includes(c)) out.push(c);
  }
  const rule = FACT_CAUTIONS[f.id];
  if (rule) out.push(rule);
  return out;
}

/* ------------------------------------------------------------ wording */

const WORDING_RULES: { re: RegExp; reason: () => string }[] = [
  {
    re: /\bcarbon[- ](?:neutral|negative)\b|\bclimate[- ](?:neutral|positive)\b|\boffset(?:s|ting)?\b/gi,
    reason: () =>
      `Carbon removals deal with emissions the team cannot eliminate yet (${factCitation(findFact("e25-removals")!).label}). Don't describe the team as neutral, negative or offsetting.`,
  },
  {
    re: /\breal[- ]time\b|\blive (?:data|figures|feed)\b/gi,
    reason: () => "The team publishes these figures in its annual report. Say when they were published rather than calling them live.",
  },
  {
    re: /\bsave the planet\b|\bgreenest\b|\bmost sustainable\b/gi,
    reason: () => "Avoid green superlatives. Say what the team did, in the report's own terms.",
  },
  {
    re: /\b(?:unlock|empower|revolutioni[sz]e|seamless|cutting-edge|game-changing)\w*/gi,
    reason: () => "House style avoids this word. Use a plainer, more specific one.",
  },
];

function wordingNotes(text: string): WordingNote[] {
  const notes: WordingNote[] = [];
  for (const rule of WORDING_RULES) {
    for (const m of text.matchAll(rule.re)) {
      const start = m.index ?? 0;
      notes.push({ phrase: m[0], start, end: start + m[0].length, reason: rule.reason() });
    }
  }
  return notes.sort((a, b) => a.start - b.start);
}

/* ------------------------------------------------------------ matching */

/** The sentence containing `index`. A full stop only ends a sentence when whitespace follows, so "144.8m" stays whole. */
function sentenceAround(text: string, index: number): string {
  const isEnd = (i: number) => text[i] === "\n" || (/[.!?]/.test(text[i] ?? "") && (i + 1 >= text.length || /\s/.test(text[i + 1])));
  let start = index;
  while (start > 0 && !isEnd(start - 1)) start--;
  let end = index;
  while (end < text.length && !isEnd(end)) end++;
  return text.slice(start, end);
}

function currencyOf(raw: string): "GBP" | "USD" | "EUR" | null {
  if (raw.includes("£")) return "GBP";
  if (raw.includes("$")) return "USD";
  if (raw.includes("€")) return "EUR";
  return null;
}

type Candidate = { fact: Fact; score: number; contextual: boolean };

function scoreCandidates(n: FoundNumber, text: string, end: number, sentence: Set<string>, pool: Fact[]): Candidate[] {
  const after = followingWords(text, end);
  const currency = currencyOf(n.raw);
  const out: Candidate[] = [];
  for (const f of pool) {
    if (f.value === null || f.status === "simulated") continue;
    const isPercent = f.unit === "%";
    if (n.percent !== isPercent) continue;
    const isMoney = f.unit === "GBP" || f.unit === "USD";
    if (currency && currency !== f.unit) continue;
    if (!numbersMatch(n, Math.abs(f.value))) continue;

    const bag = factBag(f);
    let overlap = 0;
    for (const t of sentence) if (bag.has(t)) overlap++;
    const unitWords = unitWordsFor(f);
    const unitMatch = (currency !== null && isMoney) || after.some((w) => unitWords.includes(w));
    const exact = Math.abs(f.value) === n.value;
    // A percentage or a sum of money alone says little: most facts share
    // those units. It needs at least one shared word to count as context.
    const contextual = isPercent || isMoney ? overlap >= 1 : overlap >= 1 || unitMatch;
    const score = overlap + (unitMatch ? 3 : 0) + (exact ? 1 : 0) + (f.status === "verified" ? 0.5 : 0);
    out.push({ fact: f, score, contextual });
  }
  return out.sort((a, b) => b.score - a.score || a.fact.id.localeCompare(b.fact.id));
}

const digitsOf = (v: number) => String(Math.abs(v)).replace(/\D/g, "").split("").sort().join("");

/** Same digits in a different order, e.g. 275 for 257: most likely a typing slip. */
function isTransposition(a: number, b: number): boolean {
  return a !== b && Number.isInteger(a) && Number.isInteger(b) && digitsOf(a) === digitsOf(b);
}

/** Closest published figure of the same kind, for a number that matches nothing (typos, stale figures). */
function nearestFact(n: FoundNumber, text: string, end: number, sentence: Set<string>, pool: Fact[]): Fact | null {
  const after = followingWords(text, end);
  const currency = currencyOf(n.raw);
  let best: { fact: Fact; score: number } | null = null;
  for (const f of pool) {
    if (f.value === null || f.status === "simulated" || f.value === 0) continue;
    if (n.percent !== (f.unit === "%")) continue;
    if (currency && currency !== f.unit) continue;
    const rel = Math.abs(n.value - Math.abs(f.value)) / Math.abs(f.value);
    if (rel > 0.25) continue;
    const bag = factBag(f);
    let overlap = 0;
    for (const t of sentence) if (bag.has(t)) overlap++;
    const unitMatch = after.some((w) => unitWordsFor(f).includes(w));
    if (overlap === 0 && !unitMatch) continue;
    const score = overlap + (unitMatch ? 2 : 0) + (isTransposition(n.value, Math.abs(f.value)) ? 3 : 0) - rel * 10;
    if (!best || score > best.score) best = { fact: f, score };
  }
  return best?.fact ?? null;
}

function isYear(n: FoundNumber, text: string, end: number, pool: Fact[]): boolean {
  if (n.percent || currencyOf(n.raw) || !/^\d{4}$/.test(n.raw)) return false;
  if (n.value < 1900 || n.value > 2100) return false;
  // "2025 students" is a count, not a year.
  const after = followingWords(text, end);
  return !pool.some((f) => f.unit !== "year" && after.some((w) => unitWordsFor(f).includes(w)));
}

function isOrdinal(text: string, end: number): boolean {
  return /^(st|nd|rd|th)\b/i.test(text.slice(end));
}

/** Checks every number in `input` against the fact base (or `pool`, for tests). */
export function checkDraft(input: string, pool: Fact[] = allFacts): DraftCheck {
  const text = input.normalize("NFKC");
  const findings: DraftFinding[] = [];

  for (const n of extractNumbers(text)) {
    // The masked text keeps every offset, and a match never starts with whitespace.
    const start = n.index;
    const end = start + n.raw.length;
    const sentenceText = sentenceAround(text, start);
    const sentence = tokens(sentenceText);
    const base = { raw: n.raw, value: n.value, start, end, alternatives: [] as string[], nearest: null, cautions: [] as string[] };

    if (isOrdinal(text, end)) {
      findings.push({ ...base, status: "context", factId: null, reason: "Read as an ordinal, not a quantity." });
      continue;
    }

    const candidates = scoreCandidates(n, text, end, sentence, pool);
    const contextual = candidates.filter((c) => c.contextual);
    const year = isYear(n, text, end, pool);

    if (contextual.length > 0 && !(year && contextual[0].fact.unit !== "year")) {
      const best = contextual[0];
      findings.push({
        ...base,
        status: "matched",
        factId: best.fact.id,
        alternatives: contextual
          .slice(1)
          .filter((c) => c.score >= best.score - 2)
          .slice(0, 3)
          .map((c) => c.fact.id),
        reason: `Matches a published figure: ${best.fact.metric} (${factCitation(best.fact).label}).`,
        cautions: cautionsFor(best.fact),
      });
      continue;
    }

    if (year) {
      findings.push({ ...base, status: "context", factId: null, reason: "Read as a year. Years give context and are not checked." });
      continue;
    }

    if (candidates.length > 0) {
      findings.push({
        ...base,
        status: "held",
        factId: null,
        alternatives: candidates.slice(0, 3).map((c) => c.fact.id),
        reason: `${n.raw} appears in the fact base, but nothing in this sentence says which figure it is. Name what it counts.`,
      });
      continue;
    }

    const nearest = nearestFact(n, text, end, sentence, pool);
    const typo = nearest?.value != null && isTransposition(n.value, Math.abs(nearest.value));
    findings.push({
      ...base,
      status: "held",
      factId: null,
      nearest: nearest?.id ?? null,
      reason: typo
        ? `No published figure matches ${n.raw}. It has the same digits as a published figure, so it may be a typing slip.`
        : nearest
          ? `No published figure matches ${n.raw}. Check it against the closest published figure.`
          : `No published figure matches ${n.raw}. Add a source or take it out.`,
    });
  }

  const matched = findings.filter((f) => f.status === "matched");
  const held = findings.filter((f) => f.status === "held").length;
  return {
    text,
    findings,
    wording: wordingNotes(text),
    matched: matched.length,
    held,
    ok: findings.length > 0 && held === 0,
    factIds: [...new Set(matched.map((f) => f.factId!))],
  };
}

/**
 * The checked text with an [F:id] marker after every matched number, in the
 * same citation form the AI layer uses, so the partner citation helpers can
 * turn it into numbered footnotes.
 */
export function draftWithCitations(check: DraftCheck): { text: string; citations: string[] } {
  let out = "";
  let last = 0;
  for (const f of check.findings) {
    if (f.status !== "matched" || !f.factId) continue;
    out += `${check.text.slice(last, f.end)} [F:${f.factId}]`;
    last = f.end;
  }
  out += check.text.slice(last);
  return { text: out, citations: check.factIds };
}
