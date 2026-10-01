import { describe, expect, it } from "vitest";
import { checkDraft } from "@/lib/ai/check-draft";

/** The figures a sentence produces, without years and ordinals. */
const figures = (text: string) => checkDraft(text).findings.filter((f) => f.status !== "context");
const only = (text: string) => {
  const found = figures(text);
  expect(found, text).toHaveLength(1);
  return found[0];
};

describe("checkDraft round 2: the judge's stress tests never pass", () => {
  it("holds back a measured figure given a counted noun (panels for tCO2e)", () => {
    const f = only("The factory roof carries 1,188 solar panels.");
    expect(f.status).toBe("held");
    expect(f.nearest).toBe("e25-saf-avoided");
    expect(f.reason).toMatch(/published in tCO₂e, not panels/);
  });

  it("holds back the right figure in the wrong unit symbol", () => {
    expect(only("The team's first SAF purchase avoided 1,188 kg of air-freight emissions.").reason).toMatch(/published in tCO₂e, not kg/);
    expect(only("The campus has 3,434 MW of solar panels.").reason).toMatch(/count of panels, not MW/);
    expect(only("The team recycled 1.3 kg of carbon fibre.").status).toBe("held");
  });

  it("holds back a fall written as a rise, and a rise written as a fall", () => {
    const rose = only("Travel and logistics emissions rose 14% on the previous year.");
    expect(rose.status).toBe("held");
    expect(rose.reason).toMatch(/as a fall; the sentence says it rose/);
    expect(only("Scope 1 and 2 emissions are up 74% on the baseline year.").status).toBe("held");
    expect(only("Interactions per ESG post fell 33% on 2023.").reason).toMatch(/as a rise; the sentence says it fell/);
  });

  it("needs wording when a target is written as reached", () => {
    const f = only("The team has already hit its 76,162 tCO2e target.");
    expect(f.status).toBe("wording");
    expect(f.needs.join(" ")).toMatch(/working towards, not one it has reached/);
    expect(only("The team reached its net zero target in 2050.").status).toBe("wording");
  });

  it("holds back quantities written in words", () => {
    for (const t of [
      "The campus roof carries three thousand four hundred solar panels.",
      "Ninety per cent of mentees grew their confidence.",
      "Nine interns joined from Aramco.",
    ]) {
      const f = only(t);
      expect(f.status, t).toBe("held");
      expect(f.reason).toMatch(/Write figures as digits/);
    }
  });

  it("leaves small counting words and names alone", () => {
    expect(figures("Across two days, Make A Mark Day reached 257 students.").map((f) => f.status)).toEqual(["matched"]);
    expect(checkDraft("Formula One teams travel a lot, and one of them is Aston Martin Aramco.").findings).toHaveLength(0);
  });

  it("needs wording when a partner or event the report doesn't name is credited", () => {
    const f = only("Cognizant helped 600+ students at the Singapore Grand Prix.");
    expect(f.status).toBe("wording");
    expect(f.needs.join(" ")).toMatch(/does not tie this figure to Cognizant/);
    const event = only("The team raised £140,000 for charity at the British Grand Prix.");
    expect(event.status).toBe("wording");
    expect(event.needs.join(" ")).toMatch(/British Grand Prix/);
  });

  it("marks a rounded figure so the desk can show the exact one", () => {
    const f = only("About 70,000 tCO2e of the footprint comes from the supply chain.");
    expect(f).toMatchObject({ status: "matched", factId: "e25-supply-chain", rounded: true });
    expect(only("The footprint was 87,162 tCO2e.").rounded).toBe(false);
  });
});

describe("checkDraft round 2: the same figures pass when written as the report does", () => {
  it.each([
    "The team's first SAF purchase avoided 1,188 tCO2e of air-freight emissions.",
    "The campus roof carries 3,434 solar panels.",
    "Travel and logistics emissions fell 14% on the previous year.",
    "The team's 2030 target is a footprint of 76,162 tCO2e.",
    "At the STEM Racing World Finals in Singapore, the team reached more than 600 students.",
    "Make A Mark Day brought 257 students to the factory with partners including Cognizant.",
    "Arm and the team ran Make A Mark Day for 257 students.",
    "The team recycled 1.3 tonnes of carbon fibre.",
  ])("%s", (t) => {
    expect(checkDraft(t).ok, JSON.stringify(checkDraft(t).findings.map((f) => [f.raw, f.status, f.reason, f.needs]))).toBe(true);
  });

  it("checks each clause's direction separately", () => {
    const check = checkDraft("Aleto mentees: 93% grew their professional network, and the team cut travel and logistics emissions 14%.");
    expect(check.ok).toBe(true);
  });
});
