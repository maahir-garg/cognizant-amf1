import { validateAiNumericGuardrail, extractNumbersFromText } from "./guardrail";
import { Fact } from "@/lib/data/schemas";

const sampleFacts: Fact[] = [
  {
    id: "FACT-E-04",
    pillar: "Environment",
    metric: "Freight & Logistics Emissions",
    value: 5560.45,
    unit: "tCO2e",
    display_value: "5,560.45 tCO₂e",
    period: "2024",
    source_doc: "Make A Mark ESG Report 2025",
    page: 19,
    status: "verified",
    notes: "Freight accounting for 6% of total footprint across 24 Grands Prix.",
    partner_relevant: true,
  },
  {
    id: "FACT-E-05",
    pillar: "Environment",
    metric: "Emissions Avoided via SAF Certificates",
    value: 1188,
    unit: "tCO2e",
    display_value: "1,188 tCO₂e avoided",
    period: "2024",
    source_doc: "Make A Mark ESG Report 2025",
    page: 9,
    status: "verified",
    notes: "Equivalent to 88,153 laps around Silverstone.",
    partner_relevant: true,
  },
];

function runGuardrailTests() {
  console.log("Running Numeric Guardrail Unit Tests...\n");

  // Test 1: Number extractor
  const text1 = "In 2024, freight reached 5,560.45 tCO2e, while SAF saved 1,188 tCO2e across 24 races.";
  const nums1 = extractNumbersFromText(text1);
  console.assert(nums1.includes(2024), "Should extract 2024");
  console.assert(nums1.includes(5560.45), "Should extract 5560.45");
  console.assert(nums1.includes(1188), "Should extract 1188");
  console.assert(nums1.includes(24), "Should extract 24");
  console.log("[PASS] Test 1: Number extraction correctly handles floats and commas.");

  // Test 2: Valid text passes guardrail
  const validText = "Across 2024, Aston Martin Aramco avoided 1,188 tCO2e via SAF certificates, while total freight was 5,560.45 tCO2e.";
  const res2 = validateAiNumericGuardrail(validText, sampleFacts);
  console.assert(res2.passed === true, "Valid text should pass guardrail");
  console.assert(res2.unverifiedNumbers.length === 0, "No unverified numbers");
  console.log("[PASS] Test 2: Verified text with cited facts passes guardrail.");

  // Test 3: Hallucinated number fails guardrail
  const hallucinatedText = "In 2024, our freight emissions were cut by 4,321 tCO2e, yielding a 99% reduction.";
  const res3 = validateAiNumericGuardrail(hallucinatedText, sampleFacts);
  console.assert(res3.passed === false, "Hallucinated numbers must be rejected");
  console.assert(res3.unverifiedNumbers.includes(4321), "Should catch 4321 as unverified");
  console.assert(res3.unverifiedNumbers.includes(99), "Should catch 99 as unverified");
  console.log("[PASS] Test 3: Hallucinated numbers (4321, 99%) are strictly rejected.");

  console.log("\nAll Guardrail Tests Passed Successfully!");
}

runGuardrailTests();
