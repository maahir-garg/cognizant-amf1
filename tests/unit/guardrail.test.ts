import { describe, expect, it } from "vitest";
import { checkText, parseCitations, stripCitations } from "@/lib/ai/guardrail";
import { getFact } from "@/lib/data/load";

const facts = ["e25-saf-avoided", "e25-saf-airfreight-cut", "e25-travel-logistics-cut"].map(getFact);
const derived = [{ id: "sc-students", label: "Extra students", value: 617, unit: "students", formula: "3 editions x 257 x 80%" }];

describe("guardrail", () => {
  it("passes text whose numbers all match cited facts", () => {
    const text = "SAF avoided 1,188 tCO₂e of air freight [F:e25-saf-avoided], a 31% cut [F:e25-saf-airfreight-cut] in 2025.";
    const r = checkText(text, { facts, derived: [] });
    expect(r.passed).toBe(true);
    expect(r.checked.map((c) => c.matchedId)).toEqual(["e25-saf-avoided", "e25-saf-airfreight-cut", "e25-saf-avoided"]);
  });

  it("rejects an invented number", () => {
    const r = checkText("SAF avoided 1,500 tonnes [F:e25-saf-avoided].", { facts, derived: [] });
    expect(r.passed).toBe(false);
    expect(r.reasons[0]).toContain("1,500");
  });

  it("rejects a real number whose fact is not cited", () => {
    const r = checkText("Emissions fell 14% [F:e25-saf-avoided].", { facts, derived: [] });
    expect(r.passed).toBe(false);
    expect(r.reasons[0]).toContain("e25-travel-logistics-cut");
  });

  it("rejects citations to ids that were not supplied", () => {
    const r = checkText("Something [F:e25-scope1].", { facts, derived: [] });
    expect(r.passed).toBe(false);
    expect(r.unknownCitations).toEqual(["e25-scope1"]);
  });

  it("rejects uncited text", () => {
    expect(checkText("No sources here.", { facts, derived: [] }).passed).toBe(false);
  });

  it("accepts documented derived values", () => {
    const r = checkText("That reaches 617 more students [D:sc-students].", { facts: [], derived });
    expect(r.passed).toBe(true);
  });

  it("parses and strips citations", () => {
    const t = "A [F:e25-saf-avoided] and B [D:sc-students].";
    expect(parseCitations(t)).toEqual(["e25-saf-avoided", "sc-students"]);
    expect(stripCitations(t)).toBe("A and B.");
  });
});
