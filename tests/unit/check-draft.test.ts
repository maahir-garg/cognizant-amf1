import { describe, expect, it } from "vitest";
import { checkDraft, draftWithCitations } from "@/lib/ai/check-draft";
import { checkText } from "@/lib/ai/guardrail";
import { getFact } from "@/lib/data/load";
import { footnotedPlainText } from "@/lib/partner/citations";

const only = (text: string) => {
  const check = checkDraft(text);
  expect(check.findings).toHaveLength(1);
  return check.findings[0];
};

describe("checkDraft: the demo case", () => {
  it("matches 257 students to Make A Mark Day", () => {
    const f = only("Make A Mark Day reached 257 students");
    expect(f.status).toBe("matched");
    expect(f.factId).toBe("c25-mam-day-students");
    expect(f.reason).toContain("2025 report, p. 59");
  });

  it("holds back 275 students and points at the published figure", () => {
    const check = checkDraft("Make A Mark Day reached 275 students");
    expect(check.ok).toBe(false);
    expect(check.held).toBe(1);
    const f = check.findings[0];
    expect(f.status).toBe("held");
    expect(f.factId).toBeNull();
    expect(f.reason).toMatch(/No published figure matches 275/);
    expect(f.nearest).toBe("c25-mam-day-students");
    expect(f.reason).toMatch(/same digits/);
  });

  it("is deterministic", () => {
    const text = "Make A Mark Day reached 257 students, and 93% of Aleto mentees grew their network.";
    expect(checkDraft(text)).toEqual(checkDraft(text));
  });
});

describe("checkDraft: matching", () => {
  it("reads percentages, money and abbreviated counts", () => {
    const check = checkDraft(
      "93% of Aleto mentees grew their professional network. The team raised £140,000 for charities. ESG posts earned 144.8m impressions.",
    );
    expect(check.findings.map((f) => [f.status, f.factId])).toEqual([
      ["matched", "b25-aleto-network"],
      ["matched", "c25-charity-2025"],
      ["matched", "c24-esg-impressions"],
    ]);
    expect(check.ok).toBe(true);
  });

  it("prefers the published progress figure over the matching estimate", () => {
    const f = only("Scope 1 and 2 emissions are down 74% on the baseline, according to the progress against target chart.");
    expect(f.factId).toBe("e25-progress-scope12");
    expect(f.alternatives).toContain("est-scope12-change-vs-2023");
  });

  it("uses the unit after the number to pick between facts with the same value", () => {
    expect(only("Students came from 14 schools and community groups.").factId).toBe("c25-mam-day-schools");
  });

  it("holds back a value that exists but has no context in the sentence", () => {
    const f = only("We opened 14 new offices.");
    expect(f.status).toBe("held");
    expect(f.alternatives.length).toBeGreaterThan(0);
    expect(f.reason).toMatch(/nothing in this sentence says which figure/);
  });

  it("holds back an unsourced number with no near match", () => {
    const f = only("Our volunteers gave 4,321 hours.");
    expect(f.status).toBe("held");
    expect(f.nearest).toBeNull();
  });

  it("does not treat a percentage as a count or a count as a percentage", () => {
    expect(only("Make A Mark Day reached 257% of students.").status).toBe("held");
    expect(only("93 of Aleto mentees grew their professional network.").status).not.toBe("matched");
  });

  it("reads years and ordinals as context, not claims", () => {
    const check = checkDraft("In 2025, the fourth Make A Mark Day was its 4th edition.");
    expect(check.findings.map((f) => f.status)).toEqual(["context", "context"]);
    expect(check.held).toBe(0);
  });

  it("matches a year that is itself the figure", () => {
    expect(only("The team targets net zero across the value chain by 2050.").factId).toBe("e25-target-netzero-year");
  });

  it("ignores names with digits such as Scope 3 and AMR26", () => {
    expect(checkDraft("Scope 3 and the AMR26 in Formula 1.").findings).toHaveLength(0);
  });

  it("is not ok when there is nothing to check", () => {
    expect(checkDraft("A draft with no figures.").ok).toBe(false);
  });
});

describe("checkDraft: cautions and wording", () => {
  it("flags estimates and disputed figures even when matched", () => {
    const est = only("Each round's freight is about 231.7 tCO2e.");
    expect(est.factId).toBe("est-freight-per-round");
    expect(est.cautions.join(" ")).toMatch(/estimate/);
    expect(est.cautions.join(" ")).toMatch(/divided evenly/);

    const conflict = only("The Aleto programme's third cohort had 14 students.");
    expect(conflict.factId).toBe("b25-aleto-cohort");
    expect(conflict.cautions.join(" ")).toMatch(/different values/);
  });

  it("notes wording the stakeholders ruled out", () => {
    const check = checkDraft("The team is carbon neutral, with real-time data and cutting-edge tools.");
    expect(check.wording.map((w) => w.phrase.toLowerCase())).toEqual(["carbon neutral", "real-time", "cutting-edge"]);
  });
});

describe("draftWithCitations", () => {
  it("inserts a citation after each matched number and passes the numeric guardrail", () => {
    const check = checkDraft("Make A Mark Day reached 257 students. 93% of Aleto mentees grew their professional network.");
    const cited = draftWithCitations(check);
    expect(cited.text).toBe(
      "Make A Mark Day reached 257 [F:c25-mam-day-students] students. 93% [F:b25-aleto-network] of Aleto mentees grew their professional network.",
    );
    const guard = checkText(cited.text, { facts: cited.citations.map(getFact), derived: [] });
    expect(guard.passed).toBe(true);
    expect(footnotedPlainText(cited)).toMatch(/\[1\].*\n\[2\]/);
  });
});

describe("checkDraft: the stakeholder audit cases never pass green", () => {
  const figures = (text: string) => checkDraft(text).findings.filter((f) => f.status !== "context");

  it("holds back a right number attached to the wrong noun", () => {
    const [f] = figures("Cognizant brought 257 schools to Make A Mark Day.");
    expect(f.status).toBe("held");
    expect(f.nearest).toBe("c25-mam-day-students");
    expect(f.reason).toMatch(/count of students, not schools/);
  });

  it("needs wording when a Scope 1 and 2 figure is called total emissions", () => {
    const [f] = figures("The team cut its total emissions 74%.");
    expect(f.status).toBe("wording");
    expect(f.factId).toBe("e25-progress-scope12");
    expect(f.needs.join(" ")).toMatch(/Scope 1 and 2/);
  });

  it("needs wording when the European paddock cut is placed at Singapore", () => {
    for (const t of ["Paddock energy emissions fell 90% at the Singapore Grand Prix.", "The team cut emissions 90% at the Singapore Grand Prix."]) {
      const [f] = figures(t);
      expect(f.status, t).toBe("wording");
      expect(f.needs.join(" ")).toMatch(/European races only/);
    }
  });

  it("needs wording for a comparison of restated yearly totals", () => {
    const check = checkDraft("The footprint fell from 88,183 (2024) to 87,162 (2025).");
    const found = check.findings.filter((f) => f.status !== "context");
    expect(found.map((f) => f.status)).toEqual(["wording", "wording"]);
    expect(found[1].needs.join(" ")).toMatch(/Don't compare yearly totals/);
    expect(check.ok).toBe(false);
  });

  it("needs wording for a pay gap without the report's explanation", () => {
    const [f] = figures("The team's pay gap is 20.6%.");
    expect(f.status).toBe("wording");
    expect(f.needs.join(" ")).toMatch(/not unequal pay/);
  });

  it("passes the same figures once the sentence frames them as the report does", () => {
    for (const t of [
      "Scope 1 and 2 emissions are down 74% on the baseline year.",
      "At European races, low-carbon paddock energy cut event energy emissions by 90%.",
      "The team's median pay gap is 20.6%, which the report says reflects representation, not unequal pay.",
      "The team's footprint was 87,162 tCO2e in 2025.",
    ]) {
      expect(checkDraft(t).ok, t).toBe(true);
    }
  });

  it("needs wording for a target stated as a result, and for removals called an offset", () => {
    expect(figures("Emissions were cut by 42% across Scope 1 and 2.")[0].status).toBe("wording");
    expect(figures("The team offset its footprint by removing 2,124 tCO2e.")[0].status).toBe("wording");
  });

  it("counts figures that need wording separately and keeps them out of ok", () => {
    const check = checkDraft("Make A Mark Day reached 257 students. The team's pay gap is 20.6%.");
    expect(check).toMatchObject({ matched: 1, needsWording: 1, held: 0, ok: false });
  });
});
