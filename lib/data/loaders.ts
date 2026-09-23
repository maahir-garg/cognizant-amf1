import {
  FactSchema,
  Fact,
  InitiativeSchema,
  Initiative,
  RaceWeekendSchema,
  RaceWeekend,
  ConversionFactorSchema,
  ConversionFactor,
  EventStreamItemSchema,
  EventStreamItem,
} from "./schemas";

import factsData from "@/data/facts.json";
import initiativesData from "@/data/initiatives.json";
import racesData from "@/data/races.json";
import conversionFactorsData from "@/data/conversion-factors.json";
import eventsData from "@/data/events.json";

export function getFacts(): Fact[] {
  return factsData.map((item) => FactSchema.parse(item));
}

export function getFactById(id: string): Fact | undefined {
  return getFacts().find((fact) => fact.id === id);
}

export function getInitiatives(): Initiative[] {
  return initiativesData.map((item) => InitiativeSchema.parse(item));
}

export function getInitiativesByRace(raceSlug: string): Initiative[] {
  return getInitiatives().filter((init) => init.race_slug === raceSlug);
}

export function getRaces(): RaceWeekend[] {
  return racesData.map((item) => RaceWeekendSchema.parse(item));
}

export function getHeroRace(): RaceWeekend {
  const races = getRaces();
  return races.find((r) => r.slug === "singapore-gp") || races[0];
}

export function getConversionFactors(): ConversionFactor[] {
  return conversionFactorsData.map((item) => ConversionFactorSchema.parse(item));
}

export function getEvents(): EventStreamItem[] {
  return eventsData.map((item) => EventStreamItemSchema.parse(item));
}
