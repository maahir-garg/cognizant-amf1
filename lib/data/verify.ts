/**
 * Data audit used by `npm run verify:data` and the unit tests. Node-only.
 *
 * For every verified fact: the cited page exists and each quote fragment is
 * found on it, and the fact's value appears inside the quote.
 * For every estimated fact: the derivation recomputes to the stored value.
 * For every reference (initiatives, races, quizzes, events): the ids exist.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { evaluate } from "./derive";
import { cities, conversionFactors, counters, events, facts, initiatives, quizzes, races, sources, travelModes } from "./load";
import { extractNumbers, normaliseForQuote, numbersMatch } from "./numbers";
import type { Fact } from "./schemas";

export type Issue = { level: "error" | "warn"; where: string; message: string };

const ROOT = path.resolve(__dirname, "../..");
const pageCache = new Map<string, string[]>();

function pagesFor(sourceId: string): string[] | null {
  if (pageCache.has(sourceId)) return pageCache.get(sourceId)!;
  const s = sources.find((x) => x.id === sourceId);
  if (!s) return null;
  let pages: string[] | null = null;
  if (s.textPath) {
    pages = JSON.parse(readFileSync(path.join(ROOT, s.textPath), "utf8")) as string[];
  } else if (s.localPath && /\.(txt|csv)$/.test(s.localPath)) {
    pages = [readFileSync(path.join(ROOT, s.localPath), "utf8")];
  }
  if (pages) pageCache.set(sourceId, pages.map(normaliseForQuote));
  return pages ? pageCache.get(sourceId)! : null;
}

function quoteFragments(quote: string): string[] {
  return quote.split(/\s*…\s*/).map((q) => q.trim()).filter(Boolean);
}

function checkQuote(where: string, sourceId: string, page: number, quote: string, issues: Issue[]): boolean {
  const pages = pagesFor(sourceId);
  if (!pages) {
    issues.push({ level: "error", where, message: `source "${sourceId}" has no text to check against` });
    return false;
  }
  const text = pages[page - 1];
  if (text === undefined) {
    issues.push({ level: "error", where, message: `page ${page} out of range (${pages.length} pages)` });
    return false;
  }
  let ok = true;
  for (const frag of quoteFragments(quote)) {
    if (!text.includes(normaliseForQuote(frag))) {
      issues.push({ level: "error", where, message: `quote fragment not found on p${page}: "${frag}"` });
      ok = false;
    }
  }
  return ok;
}

function valueInQuote(f: Fact): boolean {
  if (f.value === null) return true;
  const target = Math.abs(f.value);
  const nums = extractNumbers(f.quote ?? "", { words: true });
  return nums.some((n) => numbersMatch(n, target) || (f.unit === "%" && numbersMatch(n.value, target)));
}

export function verifyData(): Issue[] {
  const issues: Issue[] = [];
  const factIds = new Set<string>();
  const factById = new Map(facts.map((f) => [f.id, f]));

  for (const f of facts) {
    const where = `fact ${f.id}`;
    if (factIds.has(f.id)) issues.push({ level: "error", where, message: "duplicate id" });
    factIds.add(f.id);

    if (f.status === "verified") {
      if (!sources.some((s) => s.id === f.sourceId)) {
        issues.push({ level: "error", where, message: `unknown source "${f.sourceId}"` });
        continue;
      }
      const found = checkQuote(where, f.sourceId!, f.page!, f.quote!, issues);
      if (found && !valueInQuote(f)) {
        issues.push({ level: "error", where, message: `value ${f.value} not present in quote "${f.quote}"` });
      }
    }

    if (f.status === "estimated" && f.derivation) {
      for (const id of f.derivation.inputs) {
        if (!factById.has(id)) issues.push({ level: "error", where, message: `derivation input "${id}" missing` });
      }
      try {
        const computed = evaluate(f.derivation.expression, (id) => {
          const input = factById.get(id);
          if (!input || input.value === null) throw new Error(`input "${id}" has no numeric value`);
          return input.value;
        });
        if (f.value === null || !numbersMatch(computed, f.value)) {
          issues.push({ level: "error", where, message: `derivation gives ${computed}, stored ${f.value}` });
        }
      } catch (e) {
        issues.push({ level: "error", where, message: (e as Error).message });
      }
    }

    for (const flag of f.flags) {
      for (const id of flag.relatedFactIds) {
        if (!factById.has(id)) issues.push({ level: "error", where, message: `flag references unknown fact "${id}"` });
      }
    }
  }

  const need = (where: string, ids: string[]) => {
    for (const id of ids) if (!factIds.has(id)) issues.push({ level: "error", where, message: `unknown fact "${id}"` });
  };

  const cityIds = new Set(cities.map((c) => c.id));
  const raceIds = new Set(races.map((r) => r.id));

  for (const i of initiatives) {
    const where = `initiative ${i.id}`;
    need(where, i.factIds);
    for (const c of i.cityIds) if (!cityIds.has(c)) issues.push({ level: "error", where, message: `unknown city "${c}"` });
    for (const r of i.raceIds) if (!raceIds.has(r)) issues.push({ level: "error", where, message: `unknown race "${r}"` });
    if (i.status === "verified" && (!i.sourceId || !i.page)) {
      issues.push({ level: "error", where, message: "verified initiatives need sourceId and page" });
    }
    if (i.status === "simulated" && !i.notes) {
      issues.push({ level: "error", where, message: "simulated initiatives must explain themselves in notes" });
    }
  }

  for (const r of races) {
    need(`race ${r.id}`, r.factIds);
    if (!cityIds.has(r.cityId)) issues.push({ level: "error", where: `race ${r.id}`, message: `unknown city "${r.cityId}"` });
  }
  for (const c of cities) {
    if (c.homeRaceId && !raceIds.has(c.homeRaceId)) {
      issues.push({ level: "error", where: `city ${c.id}`, message: `unknown race "${c.homeRaceId}"` });
    }
  }

  for (const q of quizzes) {
    const where = `quiz ${q.id}`;
    const fact = factById.get(q.factId);
    if (!fact) {
      issues.push({ level: "error", where, message: `unknown fact "${q.factId}"` });
      continue;
    }
    if (q.answerIndex >= q.options.length) issues.push({ level: "error", where, message: "answerIndex out of range" });
    if (fact.value !== null) {
      const answer = extractNumbers(q.options[q.answerIndex]);
      if (!answer.some((n) => numbersMatch(n, Math.abs(fact.value!)))) {
        issues.push({ level: "error", where, message: `correct option "${q.options[q.answerIndex]}" does not match fact value ${fact.value}` });
      }
    }
  }

  const counterIds = new Set(counters.map((c) => c.id));
  for (const e of events) {
    need(`event ${e.id}`, e.factIds);
    if (!raceIds.has(e.raceId)) issues.push({ level: "error", where: `event ${e.id}`, message: `unknown race "${e.raceId}"` });
    if (e.increment && !counterIds.has(e.increment.counter)) {
      issues.push({ level: "error", where: `event ${e.id}`, message: `unknown counter "${e.increment.counter}"` });
    }
  }

  for (const c of conversionFactors) {
    const where = `factor ${c.id}`;
    if (c.status === "verified" && c.quote) checkQuote(where, c.sourceId, c.page ?? 1, c.quote, issues);
    if (c.status === "estimated") {
      if (!c.derivation) {
        issues.push({ level: "error", where, message: "estimated factors need a derivation" });
        continue;
      }
      try {
        const computed = evaluate(c.derivation.expression, (id) => {
          const input = factById.get(id);
          if (!input || input.value === null) throw new Error(`input "${id}" has no numeric value`);
          return input.value;
        });
        if (!numbersMatch(computed, c.kgCO2ePerUnit)) {
          issues.push({ level: "error", where, message: `derivation gives ${computed}, stored ${c.kgCO2ePerUnit}` });
        }
      } catch (e) {
        issues.push({ level: "error", where, message: (e as Error).message });
      }
    }
  }

  for (const t of travelModes) {
    const where = `travel ${t.id}`;
    const src = sources.find((s) => s.id === t.sourceId);
    if (t.kgCO2ePerPassengerKm === 0) continue; // walking: zero by definition, no row to check
    if (!src?.localPath) {
      issues.push({ level: "error", where, message: `source "${t.sourceId}" has no local file` });
      continue;
    }
    const rows = readFileSync(path.join(ROOT, src.localPath), "utf8").split(/\r?\n/);
    const row = rows.find((l) => l.startsWith(`${t.ref},`));
    if (!row) issues.push({ level: "error", where, message: `row "${t.ref}" not found in ${src.localPath}` });
    else if (Number(row.split(",").at(-1)) !== t.kgCO2ePerPassengerKm) {
      issues.push({ level: "error", where, message: `factor ${t.kgCO2ePerPassengerKm} does not match row "${row}"` });
    }
  }

  return issues;
}
