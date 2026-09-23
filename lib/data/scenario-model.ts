import { ScenarioInput, ScenarioOutput } from "./schemas";
import { getFacts } from "./loaders";

/**
 * Deterministic scenario calculation engine.
 * Relies on baseline figures from Make A Mark 2025 facts.
 */
export function calculateScenario(input: ScenarioInput): ScenarioOutput {
  const facts = getFacts();
  
  // Baseline freight emissions: 5,560.45 tCO2e (FACT-E-04)
  const freightFact = facts.find((f) => f.id === "FACT-E-04");
  const baselineFreight = freightFact ? freightFact.value : 5560.45;

  // Baseline STEM students: 1,250 (FACT-C-01)
  const stemFact = facts.find((f) => f.id === "FACT-C-01");
  const baselineStem = stemFact ? stemFact.value : 1250;

  // Baseline female diversity: 18.5% (FACT-S-01)
  const diversityFact = facts.find((f) => f.id === "FACT-S-01");
  const baselineDiversity = diversityFact ? diversityFact.value : 18.5;

  // 1. Freight emissions savings from Sustainable Aviation Fuel uptake
  // Aviation freight is ~72% of total calendar freight (~4,000 tCO2e).
  // SAF lifecycle reduction is ~80% compared to conventional jet fuel.
  const aviationPortion = baselineFreight * 0.72;
  const safRatio = input.saf_aviation_percent / 100;
  const freightSavedFromSaf = aviationPortion * safRatio * 0.80;

  // 2. Road freight biofuel savings (approx 28% of total freight)
  const roadPortion = baselineFreight * 0.28;
  const biofuelRatio = input.biofuel_freight_percent / 100;
  const freightSavedFromBiofuel = roadPortion * biofuelRatio * 0.85;

  const totalFreightSaved = Math.round((freightSavedFromSaf + freightSavedFromBiofuel) * 100) / 100;
  const totalScope3Reduction = totalFreightSaved;

  // 3. STEM Students additional reach
  const additionalStudents = Math.round(baselineStem * (input.stem_cohort_expand_percent / 100));

  // 4. Projected diversity gain percentage points
  // Female STEM mentorship target influence
  const diversityGain = Math.round((input.female_stem_mentorship_target * 0.08) * 10) / 10;

  const explanation = `At ${input.saf_aviation_percent}% SAF deployment and ${input.biofuel_freight_percent}% biofuel road logistics, the team abates approximately ${totalFreightSaved.toLocaleString()} tCO₂e across the season. Concurrently, expanding joint STEM cohorts by ${input.stem_cohort_expand_percent}% engages ${additionalStudents.toLocaleString()} additional future innovators, projecting a +${diversityGain}% long-term gain in engineering pipeline diversity.`;

  return {
    freight_tco2e_saved: totalFreightSaved,
    overall_scope3_reduction_tco2e: totalScope3Reduction,
    students_reached_additional: additionalStudents,
    projected_diversity_gain_percent: diversityGain,
    explanation,
    status: "estimated",
  };
}
