import { describe, expect, it } from "vitest";
import { checkSentence, transposed } from "@/components/explainer/check";
import { getFact } from "@/lib/data/load";

const students = getFact("c25-mam-day-students");
const sentence = (n: string) => `Make A Mark Day brought ${n} students to the factory for AI, coding and careers sessions with Cognizant.`;

describe("explainer number check", () => {
  it("holds back the transposed figure and points at the published one", () => {
    const r = checkSentence(sentence(transposed(students.value!)));
    expect(r.passed).toBe(false);
    expect(r.numbers).toHaveLength(1);
    expect(r.numbers[0]).toMatchObject({ status: "held", factId: students.id });
    expect(r.guardrail).toBeNull();
  });

  it("passes the published figure and the guardrail agrees on the cited sentence", () => {
    const r = checkSentence(sentence(String(students.value)));
    expect(r.passed).toBe(true);
    expect(r.numbers[0]).toMatchObject({ status: "matched", factId: students.id });
    expect(r.cited).toContain(`[F:${students.id}]`);
    expect(r.guardrail?.passed).toBe(true);
  });

  it("reads years as context", () => {
    const r = checkSentence("In 2025 the supply chain was 81% of the footprint.");
    expect(r.numbers.map((n) => n.status)).toEqual(["context", "matched"]);
    expect(r.passed).toBe(true);
  });

  it("the example's wrong input is not a fact", () => {
    expect(transposed(students.value!)).not.toBe(String(students.value));
  });
});
