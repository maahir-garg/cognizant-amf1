import { describe, expect, it } from "vitest";
import { getFact } from "@/lib/data/load";
import { csvEscape, metricsToCsv } from "@/lib/partner/csv";
import { factToMetric, partnerMetrics } from "@/lib/partner/metrics";

describe("csvEscape", () => {
  it("leaves plain values untouched", () => {
    expect(csvEscape("plain")).toBe("plain");
    expect(csvEscape(42)).toBe("42");
  });
  it("quotes fields containing a comma", () => {
    expect(csvEscape("a,b")).toBe('"a,b"');
  });
  it("doubles internal quotes and wraps the field", () => {
    expect(csvEscape('say "hi"')).toBe('"say ""hi"""');
  });
  it("quotes fields containing a newline", () => {
    expect(csvEscape("line1\nline2")).toBe('"line1\nline2"');
  });
  it("renders null and undefined as an empty field", () => {
    expect(csvEscape(null)).toBe("");
    expect(csvEscape(undefined)).toBe("");
  });
});

describe("metricsToCsv", () => {
  it("emits a header row and one row per metric, CRLF-terminated", () => {
    const metric = factToMetric(getFact("e25-saf-avoided"));
    const csv = metricsToCsv([metric]);
    expect(csv.endsWith("\r\n")).toBe(true);
    const lines = csv.trim().split("\r\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(
      "id,pillar,topic,metric,value,valueText,unit,period,qualifier,status,sourceId,sourceTitle,publisher,page,url,quote,derivationFormula,flags",
    );
    expect(lines[1]).toContain("e25-saf-avoided");
  });

  it("escapes a comma and quotes embedded in a fact's quote field", () => {
    const metric = factToMetric(getFact("e25-saf-avoided"));
    metric.quote = 'contains, a comma and "quotes"';
    const csv = metricsToCsv([metric]);
    expect(csv).toContain('"contains, a comma and ""quotes"""');
  });

  it("returns just the header for an empty metric list", () => {
    const csv = metricsToCsv([]);
    expect(csv.trim().split("\r\n")).toHaveLength(1);
  });
});

describe("partnerMetrics filters", () => {
  it("filters by pillar", () => {
    const rows = partnerMetrics({ pillar: "governance" });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((m) => m.pillar === "governance")).toBe(true);
  });

  it("filters by tag", () => {
    const rows = partnerMetrics({ tag: "partner:cognizant" });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.map((m) => m.id)).toContain("g-cognizant-role");
  });

  it("filters by an explicit id list", () => {
    const rows = partnerMetrics({ ids: ["e25-saf-avoided", "e25-removals"] });
    expect(rows.map((m) => m.id).sort()).toEqual(["e25-removals", "e25-saf-avoided"]);
  });

  it("filters by status", () => {
    const rows = partnerMetrics({ status: "estimated" });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((m) => m.status === "estimated")).toBe(true);
  });

  it("returns everything with no filter", () => {
    const rows = partnerMetrics({});
    expect(rows.length).toBeGreaterThan(50);
  });
});
