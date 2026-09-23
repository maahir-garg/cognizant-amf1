import { ConversionFactor } from "./schemas";
import { getConversionFactors } from "./loaders";

export interface EquivalentResult {
  factor: ConversionFactor;
  calculated_value: number;
  formatted_value: string;
}

/**
 * Deterministically translates raw tCO2e emissions into human-relatable equivalencies
 * based strictly on the verified conversion factors table.
 */
export function calculateEquivalents(tco2e: number): EquivalentResult[] {
  const factors = getConversionFactors();

  return factors.map((factor) => {
    const rawVal = tco2e * factor.factor_per_tco2e;
    const rounded = rawVal >= 100 ? Math.round(rawVal) : Math.round(rawVal * 10) / 10;
    
    return {
      factor,
      calculated_value: rounded,
      formatted_value: rounded.toLocaleString(),
    };
  });
}
