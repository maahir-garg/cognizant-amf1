/**
 * Builds the fan lap sequence from a profile: three sectors (Environment,
 * Belong, Community), then a Scrutineering step for Governance, then a
 * finish step. Deterministic and data-driven, same shape used by /start's
 * preview and /lap's step-through.
 */
import { facts, quizzes } from "@/lib/data/load";
import type { FanProfile, Pillar, Quiz } from "@/lib/data/schemas";

export type SectorStep = {
  kind: "sector";
  id: Pillar;
  sectorNumber: number;
  marker: string;
  heading: string;
  /** 1-3 headline facts, shown as FactValue size="xl". */
  heroFactIds: string[];
  /** Extra facts for the die-hard compact table (includes data-quality flags where present). */
  tableFactIds: string[];
  quizzes: Quiz[];
};

export type ScrutineeringStep = {
  kind: "scrutineering";
  marker: string;
  heading: string;
  factIds: string[];
  /** A fact with a data-quality flag, shown as a worked example. */
  flagFactId: string;
  quizzes: Quiz[];
};

export type FinishStep = { kind: "finish" };

export type LapStep = SectorStep | ScrutineeringStep | FinishStep;

const SECTORS: { pillar: Pillar; heading: string }[] = [
  { pillar: "environment", heading: "Environment" },
  { pillar: "belong", heading: "Belong" },
  { pillar: "community", heading: "Community" },
];

const GOVERNANCE_FACT_IDS = ["g25-cdp", "g25-assurance", "g25-sbti", "g25-restatement"];
const GOVERNANCE_FLAG_FACT_ID = "e25-ghg-total-sbti";

function heroCountFor(level: FanProfile["level"]): number {
  return level === "die-hard" ? 3 : level === "casual" ? 2 : 1;
}

/** Same scoring idea as lib/ai/requests.ts byTagAndPillar: hero tag, shared interests, Singapore relevance. */
function rankFacts(pillar: Pillar, profile: FanProfile): string[] {
  const tags = [...profile.interests, profile.cityId === "singapore" ? "singapore" : ""].filter(Boolean);
  const pool = facts.filter((f) => f.pillar === pillar && f.status !== "simulated" && !f.tags.includes("data-quality"));
  return pool
    .map((f) => ({
      id: f.id,
      score: (f.tags.includes("hero") ? 3 : 0) + f.tags.filter((t) => tags.includes(t)).length * 2 + (f.value !== null ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .map((s) => s.id);
}

export function buildLap(profile: FanProfile): LapStep[] {
  const sectors: SectorStep[] = SECTORS.map(({ pillar, heading }, i) => {
    const ranked = rankFacts(pillar, profile);
    const heroFactIds = ranked.slice(0, heroCountFor(profile.level));
    const tableFactIds = profile.level === "die-hard" ? ranked.slice(0, 6) : [];
    return {
      kind: "sector",
      id: pillar,
      sectorNumber: i + 1,
      marker: `S${i + 1} · ${heading.toUpperCase()}`,
      heading,
      heroFactIds,
      tableFactIds,
      quizzes: quizzes.filter((q) => q.pillar === pillar && q.levels.includes(profile.level)),
    };
  });

  const scrutineering: ScrutineeringStep = {
    kind: "scrutineering",
    marker: "SCRUTINEERING · GOVERNANCE",
    heading: "Scrutineering",
    factIds: GOVERNANCE_FACT_IDS,
    flagFactId: GOVERNANCE_FLAG_FACT_ID,
    quizzes: quizzes.filter((q) => q.pillar === "governance" && q.levels.includes(profile.level)),
  };

  return [...sectors, scrutineering, { kind: "finish" }];
}

export type LapPreview = { sectorCount: number; quizCount: number };

/** Used by /start to show "4 sectors · 8 quiz beats" before the fan commits. */
export function previewLap(profile: FanProfile): LapPreview {
  const steps = buildLap(profile);
  const sectorCount = steps.filter((s) => s.kind === "sector" || s.kind === "scrutineering").length;
  const quizCount = steps.reduce((n, s) => (s.kind === "finish" ? n : n + s.quizzes.length), 0);
  return { sectorCount, quizCount };
}
