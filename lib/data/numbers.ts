/**
 * Number extraction and matching, shared by the data verifier
 * (scripts/verify-data.ts) and the AI numeric guardrail (lib/ai/guardrail.ts).
 */

export type FoundNumber = {
  /** Exact text that was parsed, e.g. "£300K", "87,162.40", "14%". */
  raw: string;
  value: number;
  index: number;
  percent: boolean;
};

const MULTIPLIERS: Record<string, number> = {
  k: 1e3,
  thousand: 1e3,
  m: 1e6,
  million: 1e6,
  mn: 1e6,
  bn: 1e9,
  billion: 1e9,
};

// Tokens that contain digits but are names, not quantities.
const IGNORED_PATTERNS: RegExp[] = [
  /\bscope\s*[123](\s*(and|&|,)\s*[123])*/gi,
  /\biso\s*\d{4,5}(-\d)?(:\d{4})?/gi,
  /\bsdgs?\s*\d{1,2}/gi,
  /\b(amr|amr-)\d{2}\b/gi,
  /\bformula\s*(one|1)\b/gi,
  /\bf1(®|™)?/gi,
  /\bco(2|₂)e?\b/gi,
  /\btco(2|₂)e\b/gi,
  /\bgri\s*\d{1,3}(-\d{1,2})?/gi,
  /\[(?:F|D):[a-z0-9-]+\]/g,
];

function mask(text: string): string {
  let out = text;
  for (const re of IGNORED_PATTERNS) out = out.replace(re, (m) => " ".repeat(m.length));
  return out;
}

const NUMBER_RE =
  /([£$€]\s?)?(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)(?:\s?(bn|billion|million|thousand|mn|k|m)\b)?(\s?%| per ?cent)?/gi;

const WORD_NUMBERS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, fifteen: 15, twenty: 20, first: 1, second: 2, third: 3, fourth: 4,
};

/**
 * Extract every quantity-looking number from a piece of text.
 * `words: true` also reads number words ("eight", "third"); the data verifier
 * uses it for quotes, the AI guardrail does not (too many false positives).
 */
export function extractNumbers(text: string, opts: { words?: boolean } = {}): FoundNumber[] {
  const masked = mask(text.normalize("NFKC"));
  const found: FoundNumber[] = [];
  if (opts.words) {
    for (const m of masked.matchAll(/\b([a-z]+)\b/gi)) {
      const v = WORD_NUMBERS[m[1].toLowerCase()];
      if (v !== undefined) found.push({ raw: m[0], value: v, index: m.index ?? 0, percent: false });
    }
  }
  for (const m of masked.matchAll(NUMBER_RE)) {
    const index = m.index ?? 0;
    // Skip digits glued to a preceding letter (CO2, F1, H2O) - already masked mostly.
    const before = masked[index - 1];
    if (before && /[A-Za-z]/.test(before) && !m[1]) continue;
    let value = Number(m[2].replace(/,/g, ""));
    const suffix = m[3]?.toLowerCase();
    if (suffix) {
      // "m" is ambiguous with metres; only treat as million when followed by nothing unit-like.
      value *= MULTIPLIERS[suffix] ?? 1;
    }
    if (!Number.isFinite(value)) continue;
    found.push({ raw: m[0].trim(), value, index, percent: Boolean(m[4]) });
  }
  return found;
}

function decimalsOf(raw: string): number {
  const digits = raw.replace(/[^0-9.]/g, "");
  const dot = digits.indexOf(".");
  return dot === -1 ? 0 : digits.length - dot - 1;
}

/**
 * True when `candidate` (as written in text) is a faithful rendering of
 * `reference`: exact, or rounded to the precision the text uses, or within
 * 0.5% (covers "87k" for 87,162.40 and "about 1,200" for 1,188 is NOT allowed).
 */
export function numbersMatch(candidate: FoundNumber | number, reference: number): boolean {
  const value = typeof candidate === "number" ? candidate : candidate.value;
  if (value === reference) return true;
  if (reference === 0) return value === 0;
  const rel = Math.abs(value - reference) / Math.abs(reference);
  if (rel <= 0.005) return true;
  if (typeof candidate !== "number") {
    const dp = decimalsOf(candidate.raw);
    const factor = 10 ** dp;
    if (Math.round(reference * factor) / factor === value) return true;
    // "87k" style: compare at the precision of the leading figure.
    const mag = 10 ** Math.max(0, Math.floor(Math.log10(Math.abs(reference))) - 2);
    if (/[km]|thousand|million|bn/i.test(candidate.raw) && Math.abs(value - reference) <= mag * 5) {
      return true;
    }
  }
  return false;
}

/** Normalise text for verbatim quote matching against extracted PDF text. */
export function normaliseForQuote(text: string): string {
  return text
    .replace(/[\u2122\u00AE]/g, "")
    .replace(/\bOne\s?TM\b/gi, "One")
    .normalize("NFKC")
    .replace(/\u00AD/g, "")
    .replace(/[\u2018\u2019\u00B4`]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014\u2011]/g, "-")
    .replace(/-\s*\n\s*/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
