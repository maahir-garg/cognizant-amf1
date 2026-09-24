/**
 * Typed, validated access to everything in /data. Safe to import from server
 * and client components: the JSON is bundled, parsed once, and frozen.
 */
import { z } from "zod";
import citiesJson from "@/data/cities.json";
import factorsJson from "@/data/conversion-factors.json";
import countersJson from "@/data/counters.json";
import eventsJson from "@/data/events.json";
import factsJson from "@/data/facts.json";
import initiativesJson from "@/data/initiatives.json";
import quizzesJson from "@/data/quizzes.json";
import racesJson from "@/data/races.json";
import sourcesJson from "@/data/sources.json";
import travelJson from "@/data/travel-modes.json";
import {
  City,
  ConversionFactor,
  Counter,
  Fact,
  FeedEvent,
  Initiative,
  Quiz,
  Race,
  Source,
  TravelMode,
  type Pillar,
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
export const events = parse(FeedEvent, eventsJson, "data/events.json");
export const counters = parse(Counter, countersJson, "data/counters.json");
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

export function factsByPillar(pillar: Pillar): Fact[] {
  return facts.filter((f) => f.pillar === pillar);
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
