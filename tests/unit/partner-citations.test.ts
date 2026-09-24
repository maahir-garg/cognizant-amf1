import { describe, expect, it } from "vitest";
import { getFact } from "@/lib/data/load";
import type { AiResponse } from "@/lib/data/schemas";
import { citationsToFootnotes, footnotedPlainText } from "@/lib/partner/citations";

function makeResponse(text: string, citations: string[]): Pick<AiResponse, "text" | "citations"> {
  return { text, citations };
}

describe("citationsToFootnotes", () => {
  it("numbers citations in the order given by response.citations, not text order", () => {
    const text = "SAF avoided cut air freight [F:e25-saf-airfreight-cut] emissions by [F:e25-saf-avoided] tonnes.";
    const response = makeResponse(text, ["e25-saf-avoided", "e25-saf-airfreight-cut"]);
    const { plainText, footnotes } = citationsToFootnotes(response);
    expect(plainText).toContain("[2]"); // e25-saf-airfreight-cut, listed second
    expect(plainText).toContain("[1]"); // e25-saf-avoided, listed first
    expect(plainText).not.toMatch(/\[F:/);
    expect(footnotes).toHaveLength(2);
    expect(footnotes[0]).toMatchObject({ n: 1, id: "e25-saf-avoided" });
    expect(footnotes[1]).toMatchObject({ n: 2, id: "e25-saf-airfreight-cut" });
  });

  it("cites the fact's source title and page in the footnote", () => {
    const fact = getFact("e25-saf-avoided");
    const response = makeResponse("Text [F:e25-saf-avoided].", ["e25-saf-avoided"]);
    const { footnotes } = citationsToFootnotes(response);
    expect(footnotes[0].text).toContain(String(fact.page));
  });

  it("resolves derived-value citations to their formula", () => {
    const derived = [{ id: "sc-students", label: "Extra students", value: 100, unit: "students", formula: "1 x 100" }];
    const response = makeResponse("Reach grows [D:sc-students].", ["sc-students"]);
    const { footnotes } = citationsToFootnotes(response, derived);
    expect(footnotes[0].text).toContain("1 x 100");
  });

  it("falls back to citation order found in the text when response.citations is empty", () => {
    const response = makeResponse("Cut emissions [F:e25-saf-avoided].", []);
    const { footnotes } = citationsToFootnotes(response);
    expect(footnotes).toHaveLength(1);
    expect(footnotes[0].id).toBe("e25-saf-avoided");
  });
});

describe("footnotedPlainText", () => {
  it("appends a numbered footnote list after the text", () => {
    const response = makeResponse("Cut emissions [F:e25-saf-avoided].", ["e25-saf-avoided"]);
    const out = footnotedPlainText(response);
    expect(out).toContain("[1]");
    expect(out.split("\n\n")).toHaveLength(2);
  });

  it("returns plain text unchanged when there are no citations", () => {
    const response = makeResponse("No citations here.", []);
    expect(footnotedPlainText(response)).toBe("No citations here.");
  });
});
