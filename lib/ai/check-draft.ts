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
 * is held back with a reason, including a number whose counted noun is not
 * the fact's unit ("257 schools" for a figure about students). Years and
 * ordinals are read as context, not as claims.
 *
 * A matched number can still "need wording" when the figure is right but the
 * sentence frames it in a way the report does not support: the wrong scope
 * ("total emissions" for a Scope 1 and 2 figure), the wrong place (a
 * European-races figure at Singapore), a target stated as a result, a
 * comparison of restated yearly totals, or a sensitive figure without the
 * context the report gives it. Those block review until reworded or
 * acknowledged.
 */
import { extractNumbers, numbersMatch, type FoundNumber } from "@/lib/data/numbers";
import { factCitation, facts as allFacts, findFact, getFact, initiatives } from "@/lib/data/load";
import type { Fact } from "@/lib/data/schemas";
import { unitLabel } from "@/lib/format";

export type FindingStatus = "matched" | "wording" | "held" | "context";

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
  /** For "wording": what the sentence must say or stop saying before the figure can go. */
  needs: string[];
};

export type WordingNote = { phrase: string; start: number; end: number; reason: string };

export type DraftCheck = {
  /** The text that was checked (NFKC-normalised, which the offsets refer to). */
  text: string;
  findings: DraftFinding[];
  wording: WordingNote[];
  matched: number;
  /** Numbers that match but need rewording. */
  needsWording: number;
  held: number;
  /** True when there is at least one number, none is held back and none needs wording. */
  ok: boolean;
  /** Matched fact ids (including those needing wording) in order of first use. */
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

/**
 * Nouns that name what a number counts. When one follows a number it has to
 * be the fact's own unit: "257 schools" is not the figure for 257 students.
 * Built from every unit in the fact base plus common counted nouns.
 */
const COUNTED_NOUNS = new Set<string>([
  ...allFacts.flatMap((f) => (f.value === null ? [] : unitWordsFor(f))).filter((w) => !["t", "x", "time", "carbon"].includes(w)),
  ..."school company team volunteer hour tree car race staff employee colleague partner mentor mentee city pupil class charity day week month kid".split(" "),
]);

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

type Candidate = { fact: Fact; score: number; overlap: number; contextual: boolean };

/** Candidates for a number, plus facts whose value matched but whose unit the counted noun contradicts. */
function scoreCandidates(
  n: FoundNumber,
  text: string,
  end: number,
  sentence: Set<string>,
  pool: Fact[],
): Candidate[] & { mismatched?: Fact[] } {
  const after = followingWords(text, end);
  const noun = after[0] && COUNTED_NOUNS.has(after[0]) ? after[0] : null;
  const currency = currencyOf(n.raw);
  const out: Candidate[] & { mismatched?: Fact[] } = [];
  out.mismatched = [];
  for (const f of pool) {
    if (f.value === null || f.status === "simulated") continue;
    const isPercent = f.unit === "%";
    if (n.percent !== isPercent) continue;
    const isMoney = f.unit === "GBP" || f.unit === "USD";
    if (currency && currency !== f.unit) continue;
    if (!numbersMatch(n, Math.abs(f.value))) continue;

    const unitWords = unitWordsFor(f);
    if (noun && !isPercent && !isMoney && !unitWords.includes(noun)) {
      out.mismatched.push(f);
      continue;
    }
    const bag = factBag(f);
    let overlap = 0;
    for (const t of sentence) if (bag.has(t)) overlap++;
    const unitMatch = (currency !== null && isMoney) || after.some((w) => unitWords.includes(w));
    const exact = Math.abs(f.value) === n.value;
    // A percentage or a sum of money alone says little: most facts share
    // those units. It needs at least one shared word to count as context.
    const contextual = isPercent || isMoney ? overlap >= 1 : overlap >= 1 || unitMatch;
    const score = overlap + (unitMatch ? 3 : 0) + (exact ? 1 : 0) + (f.status === "verified" ? 0.5 : 0);
    out.push({ fact: f, score, overlap, contextual });
  }
  out.sort((a, b) => b.score - a.score || a.fact.id.localeCompare(b.fact.id));
  return out;
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
    const base = {
      raw: n.raw,
      value: n.value,
      start,
      end,
      alternatives: [] as string[],
      nearest: null,
      cautions: [] as string[],
      needs: [] as string[],
    };

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
          .filter((c) => c.overlap >= 2 || c.score >= best.score - 2)
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

    const mismatched = candidates.mismatched ?? [];
    if (candidates.length === 0 && mismatched.length > 0) {
      const f = mismatched.find((m) => [...tokens(sentenceText)].some((t) => factBag(m).has(t))) ?? mismatched[0];
      const noun = /^[\s-]*([A-Za-z]+)/.exec(text.slice(end))?.[1] ?? "that";
      findings.push({
        ...base,
        status: "held",
        factId: null,
        nearest: f.id,
        reason: `${n.raw} is published as a count of ${unitLabel(f.unit)}, not ${noun}. Check what the figure counts.`,
      });
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

  applyFraming(text, findings);

  const cited = findings.filter((f) => f.status === "matched" || f.status === "wording");
  const held = findings.filter((f) => f.status === "held").length;
  const needsWording = findings.filter((f) => f.status === "wording").length;
  return {
    text,
    findings,
    wording: wordingNotes(text),
    matched: cited.length - needsWording,
    needsWording,
    held,
    ok: findings.length > 0 && held === 0 && needsWording === 0,
    factIds: [...new Set(cited.map((f) => f.factId!))],
  };
}

/* ------------------------------------------------------------ framing */

const SCOPE_RULES: { test: RegExp; says: RegExp; label: string }[] = [
  {
    test: /Scope 1 and 2/,
    says: /scope\s*1\s*(and|&)\s*2|scopes?\s*1\s*(and|&|,)\s*2|fuel and electricity|direct(ly)? (and|&) (purchased )?electricity/i,
    label: "Scope 1 and 2 (the fuel and electricity the team uses directly)",
  },
  { test: /Scope 3/, says: /scope\s*3|value chain|supply chain|indirect/i, label: "Scope 3 (the value chain)" },
  { test: /^Scope 1 emissions/, says: /scope\s*1|direct/i, label: "Scope 1 (direct)" },
  { test: /^Scope 2 emissions/, says: /scope\s*2|electricity/i, label: "Scope 2 (purchased electricity)" },
];

const TOTAL_WORDS = /\btotal\b|\boverall\b|\bwhole footprint\b|\ball (?:of )?(?:its|the team's) emissions\b|\bentire footprint\b/i;
const TARGET_WORDS = /target|\baims?\b|aiming|commit|goal|\bplans?\b|pledge|by 20\d\d|net zero|over the next/i;
const COMPARE_WORDS = /\bfrom\b.*\bto\b|\bfell\b|\brose\b|\bdown\b|\bup\b|\bcompared\b|\bversus\b|\bvs\.?\b|\bthan\b|\bcut\b|\bdropped\b|\bincreased\b/i;

const isSuperseded = (f: Fact) => /as originally reported|before restatement/i.test(f.metric) || f.flags.some((fl) => fl.kind === "not-comparable");
const isYearTotal = (f: Fact) => f.unit === "tCO2e" && f.topic === "emissions" && /^\d{4}$/.test(f.period);

/** Required context for figures the report only gives with an explanation. */
const SENSITIVE: { ids: string[]; ok: (draft: string, sentence: string) => boolean; need: string }[] = [
  {
    ids: ["b25-pay-gap-median", "b25-pay-gap-mean"],
    ok: (d) => /representation|not (?:the same as )?unequal pay|equal pay/i.test(d),
    need: "Give the report's explanation beside it: a pay gap is not unequal pay, it reflects representation. Lead with what the team is doing.",
  },
  {
    ids: ["b25-women-share"],
    ok: (d) => /representation|accelerate women|aleto|afbe/i.test(d),
    need: "Pair the women's share with the report's explanation of representation and what the team is doing about it.",
  },
  {
    ids: ["est-freight-per-round", "est-travel-per-round", "est-saf-per-round"],
    ok: (d, s) => /divided evenly|spread evenly|season total|on average|an average/i.test(d) && !/singapore|marina bay/i.test(s),
    need: "Say it is the season total divided evenly across the rounds, and don't present it as a Singapore figure.",
  },
  {
    ids: ["est-rego-share"],
    ok: () => false,
    need: "Say \"renewable energy-backed supply\" rather than quoting a renewable share.",
  },
  {
    ids: ["e25-removals", "e25-removals-vs-scope12"],
    ok: (d) => !/neutral|negative|offset|for good|cancel(?:s|led)? out|permanent/i.test(d),
    need: "Removals deal with emissions the team cannot eliminate yet. Don't call them neutral, negative, permanent or an offset.",
  },
];

/** Turns matched findings into "needs wording" where the sentence frames the figure in a way the report does not. */
function applyFraming(text: string, findings: DraftFinding[]): void {
  const matched = findings.filter((f) => f.status === "matched" && f.factId);
  for (const finding of matched) {
    const f = getFact(finding.factId!);
    const sentence = sentenceAround(text, finding.start);
    const needs: string[] = [];

    for (const rule of SCOPE_RULES) {
      if (!rule.test.test(f.metric)) continue;
      if (TOTAL_WORDS.test(sentence) || !rule.says.test(sentence)) {
        needs.push(`This is the ${rule.label} figure, not the total footprint. Name the scope in the sentence.`);
      }
      break;
    }

    if (/European races/i.test(f.metric) && (!/europ/i.test(sentence) || /singapore|marina bay|asia|night race|every race|all races/i.test(sentence))) {
      needs.push("This cut applies to European races only. Say so, and don't attach it to Singapore: its trackside energy is not published.");
    }

    if (f.qualifier === "target" && !TARGET_WORDS.test(sentence)) {
      needs.push("This is a target, not a result. Say it is what the team aims for.");
    }

    if (/as originally reported/i.test(f.metric)) {
      needs.push("This figure was replaced when the report restated earlier years. Use the restated figure or the report's own progress figures.");
    }

    if (isYearTotal(f)) {
      const others = matched
        .filter((o) => o !== finding && sentenceAround(text, o.start) === sentence)
        .map((o) => getFact(o.factId!))
        .filter((o) => (isYearTotal(o) || isSuperseded(o)) && o.period !== f.period);
      const risky = others.some((o) => isSuperseded(o) || isSuperseded(f) || o.period === "2024" || f.period === "2024");
      if (others.length > 0 && risky && COMPARE_WORDS.test(sentence)) {
        needs.push("Don't compare yearly totals: earlier years were restated and are not directly comparable. Use the report's own progress figures.");
      }
    } else if (isSuperseded(f) && COMPARE_WORDS.test(sentence)) {
      needs.push("Not directly comparable with the same figure in other years. Quote each year on its own terms.");
    }

    for (const rule of SENSITIVE) {
      if (rule.ids.includes(f.id) && !rule.ok(text, sentence)) needs.push(rule.need);
    }

    if (needs.length) {
      finding.status = "wording";
      finding.needs = needs;
      finding.reason = `The figure is published (${factCitation(f).label}), but the sentence needs rewording before it can go.`;
    }
  }
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
    if ((f.status !== "matched" && f.status !== "wording") || !f.factId) continue;
    out += `${check.text.slice(last, f.end)} [F:${f.factId}]`;
    last = f.end;
  }
  out += check.text.slice(last);
  return { text: out, citations: check.factIds };
}
