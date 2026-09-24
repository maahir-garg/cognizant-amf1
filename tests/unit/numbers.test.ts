import { describe, expect, it } from "vitest";
import { extractNumbers, normaliseForQuote, numbersMatch } from "@/lib/data/numbers";

const values = (t: string, words = false) => extractNumbers(t, { words }).map((n) => n.value);

describe("extractNumbers", () => {
  it("reads commas, decimals, currency, percent and suffixes", () => {
    expect(values("87,162.40 tCO2e")).toEqual([87162.4]);
    expect(values("£140,000 raised")).toEqual([140000]);
    expect(values("a 31% cut")).toEqual([31]);
    expect(values("144.8m impressions and 4.8k conversations")).toEqual([144800000, 4800]);
    expect(values("0.7 million impressions")).toEqual([700000]);
    expect(values("35 per cent")).toEqual([35]);
  });

  it("ignores names that contain digits", () => {
    expect(values("Scope 1 and 2 emissions, CO2, F1, ISO 14064-3, AMR25")).toEqual([]);
    expect(values("tCO₂e")).toEqual([]);
    expect(values("see [F:e25-scope1]")).toEqual([]);
  });

  it("reads number words only when asked", () => {
    expect(values("Eight students")).toEqual([]);
    expect(values("Eight students", true)).toEqual([8]);
  });
});

describe("numbersMatch", () => {
  const n = (t: string) => extractNumbers(t)[0];
  it("accepts exact values and faithful roundings", () => {
    expect(numbersMatch(n("87,162"), 87162.4)).toBe(true);
    expect(numbersMatch(n("87k"), 87162.4)).toBe(true);
    expect(numbersMatch(n("74%"), 73.6)).toBe(true);
    expect(numbersMatch(n("144.8m"), 144800000)).toBe(true);
  });
  it("rejects numbers that are merely close", () => {
    expect(numbersMatch(n("1,200"), 1188)).toBe(false);
    expect(numbersMatch(n("35%"), 31)).toBe(false);
    expect(numbersMatch(n("2,000"), 2124)).toBe(false);
  });
});

describe("normaliseForQuote", () => {
  it("folds typography differences between prose and PDF text", () => {
    expect(normaliseForQuote("Formula One™ Team’s  “SAF”\n– tCO₂e")).toBe(`formula one team's "saf" - tco2e`);
    expect(normaliseForQuote("Formula OneTM Team")).toBe("formula one team");
  });
});
