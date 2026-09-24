/**
 * Simulated "impact credits" rules: how travel choices earn credits, and the
 * tiers a fan's balance progresses through in /act. All numbers here are
 * demo-only game design, not AMF1 data — the UI must label them Simulated.
 */

/** 1 credit per 2kg CO2e saved vs driving alone, rounded, minimum 1 credit for any saving. */
const KG_PER_CREDIT = 2;

export function creditsForSaving(savingVsCarKg: number): number {
  if (savingVsCarKg <= 0) return 0;
  return Math.max(1, Math.round(savingVsCarKg / KG_PER_CREDIT));
}

export const CREDIT_RULE_COPY = `Choose a lower-carbon way to the circuit than driving alone and you earn 1 impact credit per ${KG_PER_CREDIT}kg CO2e saved (rounded, minimum 1 credit for any saving). Simulated: credits are a demo game, not a real AMF1 or Cognizant programme.`;

export type CreditTier = {
  id: string;
  name: string;
  threshold: number;
  unlocks: string;
};

export const CREDIT_TIERS: CreditTier[] = [
  { id: "pit-crew", name: "Pit crew", threshold: 0, unlocks: "Your starting rank: full access to the fan lap and Singapore tracker." },
  { id: "race-engineer", name: "Race engineer", threshold: 20, unlocks: "A denser weekend briefing and early sight of matched initiatives." },
  { id: "team-principal", name: "Team principal", threshold: 50, unlocks: "The full data-quality view, unlocked on every fact you check." },
];

export function tierFor(total: number): CreditTier {
  return [...CREDIT_TIERS].reverse().find((t) => total >= t.threshold) ?? CREDIT_TIERS[0];
}

export function nextTier(total: number): CreditTier | null {
  return CREDIT_TIERS.find((t) => total < t.threshold) ?? null;
}
