/**
 * Typed, validated access to everything in /data. Safe to import from server
 * and client components: the JSON is bundled, parsed once, and frozen.
 */
import { z } from "zod";
import citiesJson from "@/data/cities.json";
import factorsJson from "@/data/conversion-factors.json";
import factsJson from "@/data/facts.json";
import initiativesJson from "@/data/initiatives.json";
import quizzesJson from "@/data/quizzes.json";
import racesJson from "@/data/races.json";
import sourcesJson from "@/data/sources.json";
import travelJson from "@/data/travel-modes.json";
import {
  City,
  ConversionFactor,
  Fact,
  Initiative,
  Quiz,
  Race,
  Source,
  TravelMode,
} from "./schemas";

function parse<T extends z.ZodType>(schema: T, data: unknown, file: string): z.infer<T>[] {
  const result = z.array(schema).safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid ${file}:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export const sources = parse(Source, sourcesJson, "data/sources.json");
export const facts = parse(Fact, factsJson, "data/facts.json");
export const initiatives = parse(Initiative, initiativesJson, "data/initiatives.json");
export const races = parse(Race, racesJson, "data/races.json");
export const cities = parse(City, citiesJson, "data/cities.json");
export const conversionFactors = parse(ConversionFactor, factorsJson, "data/conversion-factors.json");
export const travelModes = parse(TravelMode, travelJson, "data/travel-modes.json");
export const quizzes = parse(Quiz, quizzesJson, "data/quizzes.json");

const factIndex = new Map(facts.map((f) => [f.id, f]));
const sourceIndex = new Map(sources.map((s) => [s.id, s]));

export function getFact(id: string): Fact {
  const fact = factIndex.get(id);
  if (!fact) throw new Error(`Unknown fact "${id}"`);
  return fact;
}

export function findFact(id: string): Fact | undefined {
  return factIndex.get(id);
}

export function getSource(id: string): Source {
  const source = sourceIndex.get(id);
  if (!source) throw new Error(`Unknown source "${id}"`);
  return source;
}

/** The reports print different values for this figure. Fan pages and AI copy leave these out; /sources and the desk show them. */
export function isDisputed(fact: Fact): boolean {
  return fact.flags.some((f) => f.kind === "source-conflict");
}

export function factsWithTag(tag: string): Fact[] {
  return facts.filter((f) => f.tags.includes(tag));
}

export function getRace(id: string): Race {
  const race = races.find((r) => r.id === id);
  if (!race) throw new Error(`Unknown race "${id}"`);
  return race;
}

export const heroRace: Race = races.find((r) => r.hero) ?? races[0];

export function getCity(id: string): City | undefined {
  return cities.find((c) => c.id === id);
}

/** Page-level deep link into the original document, when the source is a PDF. */
export function sourceLink(sourceId: string, page?: number): string {
  const s = getSource(sourceId);
  return s.kind === "pdf" && page ? `${s.url}#page=${page}` : s.url;
}

const SHORT_NAMES: Record<string, string> = {
  "manifesto-2025": "Manifesto",
  "mam-web": "Team website",
  "defra-2025": "DEFRA 2025",
  "epa-equivalencies": "US EPA",
  "f1-calendar-2025": "F1 calendar 2025",
  "f1-calendar-2026": "F1 calendar 2026",
};

/** Short reader-facing name for a source: "2025 report", "Manifesto", "DEFRA 2025". */
export function sourceShortName(sourceId: string): string {
  const report = /^esg-(\d{4})$/.exec(sourceId);
  if (report) return `${report[1]} report`;
  return SHORT_NAMES[sourceId] ?? getSource(sourceId).title;
}

/**
 * The citation line under a figure: "2025 report, p. 42" for a quoted fact,
 * "Calculated" for an estimate, with the deep link when there is one.
 */
export function factCitation(fact: Fact): { label: string; href?: string } {
  if (fact.derivation || !fact.sourceId) return { label: "Calculated" };
  const name = sourceShortName(fact.sourceId);
  const pdf = getSource(fact.sourceId).kind === "pdf";
  return { label: pdf && fact.page ? `${name}, p. ${fact.page}` : name, href: sourceLink(fact.sourceId, fact.page) };
}
