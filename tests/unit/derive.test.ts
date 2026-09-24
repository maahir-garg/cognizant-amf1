import { describe, expect, it } from "vitest";
import { evaluate, roundSig } from "@/lib/data/derive";

const lookup = (id: string) => ({ a: 10, b: 4, c: 2 })[id as "a" | "b" | "c"] ?? NaN;

describe("evaluate", () => {
  it("handles precedence, parentheses and references", () => {
    expect(evaluate("{a} + {b} * {c}", lookup)).toBe(18);
    expect(evaluate("({a} + {b}) * {c}", lookup)).toBe(28);
    expect(evaluate("{a} / ({b} / 100)", lookup)).toBe(250);
    expect(evaluate("-{a} + 1", lookup)).toBe(-9);
  });
  it("rejects anything that is not arithmetic", () => {
    expect(() => evaluate("{a}; process.exit()", lookup)).toThrow();
    expect(() => evaluate("({a}", lookup)).toThrow();
  });
  it("rounds to significant figures", () => {
    expect(roundSig(231.6854, 4)).toBe(231.7);
    expect(roundSig(0.97171, 4)).toBe(0.9717);
  });
});
