import type { Pillar } from "@/lib/data/schemas";

export type JourneyStage = {
  id: "factory" | "freight" | "circuit" | "after-race";
  navLabel: string;
  marker: string;
  route: string;
  topics: string;
  heading: string;
  description: string;
  pillar: Pillar;
  factIds: string[];
  detailFactIds: string[];
};

/**
 * The car's operational path provides the order. Every visitor sees every ESG
 * pillar; a saved profile only changes the generated explanation around it.
 */
export const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: "factory",
    navLabel: "Factory",
    marker: "Factory · build",
    route: "Campus → assembly → car",
    topics: "Environment · Belong · Community",
    heading: "It starts before the car moves",
    description: "The footprint begins with the campus, the people who build the car, and the parts and services bought from suppliers.",
    pillar: "environment",
    factIds: ["e25-supply-chain-share", "e25-solar-gj"],
    detailFactIds: ["b25-women-share", "c25-mam-day-students"],
  },
  {
    id: "freight",
    navLabel: "Freight",
    marker: "In transit · move",
    route: "Factory → freight → host city",
    topics: "Environment · Governance",
    heading: "The garage crosses the world",
    description: "Cars, parts and garage equipment travel with the calendar. Freight planning and lower-carbon aviation certificates shape this part of the story.",
    pillar: "environment",
    factIds: ["e25-freight-logistics", "e25-saf-airfreight-cut"],
    detailFactIds: ["e25-saf-avoided"],
  },
  {
    id: "circuit",
    navLabel: "Circuit",
    marker: "Race weekend · run",
    route: "Host city → circuit → community",
    topics: "Environment · Community",
    heading: "At the circuit, impact becomes local",
    description: "Trackside energy meets programmes connected to the host region. Where local team data is unavailable, the experience says so plainly.",
    pillar: "community",
    factIds: ["e25-event-energy-cut", "c25-stem-racing-students"],
    detailFactIds: ["c25-stem-racing-singapore"],
  },
  {
    id: "after-race",
    navLabel: "After the race",
    marker: "After the flag · account",
    route: "Circuit → recovery → disclosure",
    topics: "Environment · Governance",
    heading: "The work continues after the flag",
    description: "Materials and surplus food still have a destination. Published methods, independent checks and visible data gaps show how the claims are governed.",
    pillar: "governance",
    factIds: ["m22-food-donated", "m22-materials-recycled"],
    detailFactIds: ["g25-cdp", "g25-assurance", "g25-restatement"],
  },
];
