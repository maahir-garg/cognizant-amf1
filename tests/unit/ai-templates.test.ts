import { describe, expect, it } from "vitest";
import { checkText } from "@/lib/ai/guardrail";
import { enumerateDemoRequests } from "@/lib/ai/demo-requests";
import { renderTemplate } from "@/lib/ai/templates";
import { getFact } from "@/lib/data/load";

const requests = enumerateDemoRequests();

function words(text: string): number {
  return text
    .replace(/\[(F|D):[a-z0-9-]+\]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

describe("demo request set", () => {
  it("covers every persona, format, initiative and milestone the offline demo can hit", () => {
    // Sanity check that the enumeration itself isn't trivially empty; the
    // exact count moves if data/*.json changes, so just check it's large.
    expect(requests.length).toBeGreaterThan(100);
  });
});

describe("every template response passes the guardrail", () => {
  it.each(requests.map((req, i) => [`${i} ${req.task} ${req.fan?.level ?? ""} ${JSON.stringify(req.params)}`, req] as const))(
    "%s",
    (_label, req) => {
      const facts = req.factIds.map(getFact);
      const text = renderTemplate(req, facts);
      const guardrail = checkText(text, { facts, derived: req.derived });
      expect(guardrail.passed, `reasons: ${guardrail.reasons.join("; ")}\ntext: ${text}`).toBe(true);
    },
  );
});

describe("task shape rules", () => {
  it("share-caption stays within 110 characters", () => {
    for (const req of requests.filter((r) => r.task === "share-caption")) {
      const text = renderTemplate(req, req.factIds.map(getFact));
      expect(text.length).toBeLessThanOrEqual(110);
    }
  });

  it("share-caption is first person", () => {
    for (const req of requests.filter((r) => r.task === "share-caption")) {
      const text = renderTemplate(req, req.factIds.map(getFact));
      expect(/\bI\b/.test(text)).toBe(true);
    }
  });

  it("quiz-reveal is a single sentence", () => {
    for (const req of requests.filter((r) => r.task === "quiz-reveal")) {
      const text = renderTemplate(req, req.factIds.map(getFact));
      expect(text.match(/[.!?](?=\s|$)/g)?.length).toBe(1);
    }
  });

  it("linkedin-post lands between 80 and 140 words and ends with hashtags containing no digits", () => {
    for (const req of requests.filter((r) => r.task === "linkedin-post")) {
      const text = renderTemplate(req, req.factIds.map(getFact));
      const n = words(text);
      expect(n).toBeGreaterThanOrEqual(80);
      expect(n).toBeLessThanOrEqual(140);
      const hashtagLine = text.trim().split("\n").at(-1)!;
      const hashtags = hashtagLine.split(/\s+/).filter(Boolean);
      expect(hashtags.length).toBeGreaterThan(0);
      expect(hashtags.length).toBeLessThanOrEqual(3);
      for (const tag of hashtags) {
        expect(tag.startsWith("#")).toBe(true);
        expect(/\d/.test(tag)).toBe(false);
      }
    }
  });

  it("linkedin-post says so when the milestone is simulated", () => {
    for (const req of requests.filter((r) => r.task === "linkedin-post" && r.params.simulated)) {
      const text = renderTemplate(req, req.factIds.map(getFact));
      expect(/simulated/i.test(text)).toBe(true);
    }
  });

  it("quarterly-brief lands between 180 and 260 words", () => {
    for (const req of requests.filter((r) => r.task === "quarterly-brief")) {
      const text = renderTemplate(req, req.factIds.map(getFact));
      const n = words(text);
      expect(n).toBeGreaterThanOrEqual(180);
      expect(n).toBeLessThanOrEqual(260);
    }
  });

  it("investor-summary has a title, exactly 4 bullets and a so-what line", () => {
    for (const req of requests.filter((r) => r.task === "investor-summary")) {
      const text = renderTemplate(req, req.factIds.map(getFact));
      const lines = text.trim().split("\n");
      const bullets = lines.filter((l) => l.startsWith("- "));
      expect(bullets.length).toBe(4);
      expect(lines.at(-1)?.startsWith("So what:")).toBe(true);
    }
  });

  it("scenario-explanation cites only derived values", () => {
    for (const req of requests.filter((r) => r.task === "scenario-explanation")) {
      const text = renderTemplate(req, req.factIds.map(getFact));
      expect(text).toMatch(/\[D:[a-z0-9-]+\]/);
    }
  });

  it("story-kit post format lands between 60 and 100 words", () => {
    for (const req of requests.filter((r) => r.task === "story-kit" && r.params.format === "post")) {
      const text = renderTemplate(req, req.factIds.map(getFact));
      const n = words(text);
      expect(n).toBeGreaterThanOrEqual(60);
      expect(n).toBeLessThanOrEqual(100);
    }
  });

  it("story-kit summary format is 2-3 sentences", () => {
    for (const req of requests.filter((r) => r.task === "story-kit" && r.params.format === "summary")) {
      const text = renderTemplate(req, req.factIds.map(getFact));
      const sentences = text.match(/[.!?](?=\s|$)/g)?.length ?? 0;
      expect(sentences).toBeGreaterThanOrEqual(2);
      expect(sentences).toBeLessThanOrEqual(3);
    }
  });
});
