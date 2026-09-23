import { Fact } from "@/lib/data/schemas";

export interface GuardrailResult {
  passed: boolean;
  verifiedNumbers: number[];
  unverifiedNumbers: number[];
  error?: string;
}

/**
 * Normalizes numbers extracted from text, stripping commas and signs.
 */
export function extractNumbersFromText(text: string): number[] {
  // Matches integers and floats, including those with commas like 87,162 or 5,560.45
  const matches = text.match(/(?:[-+]?[0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]+)?)|(?:[-+]?[0-9]+(?:\.[0-9]+)?)/g);
  if (!matches) return [];

  const numbers: number[] = [];
  for (const m of matches) {
    const clean = m.replace(/,/g, "");
    const parsed = parseFloat(clean);
    if (!isNaN(parsed)) {
      numbers.push(parsed);
    }
  }
  return numbers;
}

/**
 * Standard allowed contextual numbers such as standard calendar years and list indices.
 */
const DEFAULT_ALLOWED_NUMBERS = new Set([
  2021, 2022, 2023, 2024, 2025, 2026, 2030, 2050, // Standard F1 & ESG timeline years
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, // List bullets / ordinals
  100, 0, // Baseline percentages
]);

/**
 * Validates that all quantitative values in generated AI copy match cited facts
 * or approved derived calculations.
 */
export function validateAiNumericGuardrail(
  content: string,
  allowedFacts: Fact[],
  additionalAllowedNumbers: number[] = []
): GuardrailResult {
  const extracted = extractNumbersFromText(content);

  // Build the set of valid numbers from facts
  const validNumbers = new Set<number>(DEFAULT_ALLOWED_NUMBERS);

  for (const f of allowedFacts) {
    validNumbers.add(f.value);
    validNumbers.add(Math.abs(f.value));

    // Extract any additional numbers present in display_value or notes (e.g. "Page 18", "300+ students (14 schools)")
    if (f.display_value) {
      extractNumbersFromText(f.display_value).forEach((n) => validNumbers.add(n));
    }
    if (f.notes) {
      extractNumbersFromText(f.notes).forEach((n) => validNumbers.add(n));
    }
    if (f.page) {
      validNumbers.add(f.page);
    }
  }

  for (const n of additionalAllowedNumbers) {
    validNumbers.add(n);
    validNumbers.add(Math.abs(n));
  }

  const verified: number[] = [];
  const unverified: number[] = [];

  for (const num of extracted) {
    // Check for exact or close floating point match (within 0.05 tolerance for rounding)
    let isMatch = false;
    for (const valid of validNumbers) {
      if (Math.abs(num - valid) < 0.05 || Math.abs(Math.abs(num) - Math.abs(valid)) < 0.05) {
        isMatch = true;
        break;
      }
    }

    if (isMatch) {
      verified.push(num);
    } else {
      unverified.push(num);
    }
  }

  return {
    passed: unverified.length === 0,
    verifiedNumbers: Array.from(new Set(verified)),
    unverifiedNumbers: Array.from(new Set(unverified)),
    error:
      unverified.length > 0
        ? `Output rejected: Contains unverified quantitative values: [${unverified.join(", ")}].`
        : undefined,
  };
}
