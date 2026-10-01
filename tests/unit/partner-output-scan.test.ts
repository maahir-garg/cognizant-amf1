import { describe, expect, it } from "vitest";
import { enumerateDemoRequests } from "@/lib/ai/demo-requests";
import { checkText } from "@/lib/ai/guardrail";
import { renderTemplate } from "@/lib/ai/templates";
import { getFact } from "@/lib/data/load";

/**
 * Scans every partner output the offline demo can show (narratives in every
 * format and pillar, the race-week post, every story kit) for the round-2
 * audit's orphan subjects: a line that only makes sense after a sentence it
 * no longer follows.
 */
const PARTNER_TASKS = ["linkedin-post", "quarterly-brief", "leadership-update", "story-kit"];
const outputs = enumerateDemoRequests()
  .filter((r) => PARTNER_TASKS.includes(r.task))
  .map((r) => ({ req: r, text: renderTemplate(r, r.factIds.map(getFact)).replace(/ \[[FD]:[a-z0-9-]+\]/g, "") }));
const label = (o: (typeof outputs)[number]) => `${o.req.task} ${JSON.stringify(o.req.params)}`;

describe("partner output scan", () => {
  it("covers a real set of outputs", () => {
    expect(outputs.length).toBeGreaterThan(25);
  });

  it.each(outputs.map((o) => [label(o), o] as const))("every output passes the guardrail: %s", (_l, o) => {
    const facts = o.req.factIds.map(getFact);
    const guard = checkText(renderTemplate(o.req, facts), { facts, derived: o.req.derived });
    expect(guard.passed, guard.reasons.join("; ")).toBe(true);
  });

  it("no bullet opens on a pronoun or a bare figure with no subject", () => {
    for (const o of outputs) {
      for (const line of o.text.split("\n").filter((l) => l.startsWith("- "))) {
        expect(line, label(o)).not.toMatch(/^- (They|Those|These|It|Its|That)\b/);
        expect(line, label(o)).not.toMatch(/^- [\d.,]+%? (said|came away|of attendees|of mentees)/);
        expect(line, label(o)).not.toMatch(/^- (Online reaction|External auditors checked it)/);
      }
    }
  });

  it("a programme's figures say which programme they are about", () => {
    for (const o of outputs.filter((x) => x.req.task !== "story-kit")) {
      // "93% of mentees said the programme ..." must come after Aleto is named in the same line or sentence before it.
      for (const line of o.text.split("\n")) {
        if (/of mentees said the programme grew/.test(line)) expect(line, label(o)).toMatch(/Aleto/);
        if (/of attendees found it helpful/.test(line)) expect(line, label(o)).toMatch(/Transition Event/);
        if (/impressions on social media/.test(line) && /Arm|mentoring/i.test(line)) expect(line, label(o)).toMatch(/Accelerate Women/);
      }
    }
  });

  it("no output starts a sentence with an unexplained 'Its' or 'It'", () => {
    for (const o of outputs) {
      const sentences = o.text.split(/(?<=[.!?])\s+|\n/);
      sentences.forEach((s, i) => {
        if (/^(Its|It)\b/.test(s)) expect(i, `${label(o)}: ${s}`).toBeGreaterThan(0);
      });
      expect(o.text, label(o)).not.toMatch(/(^|\n|- )Its environmental management system/);
    }
  });

  it("keeps HR and health and safety figures out of partner copy", () => {
    for (const o of outputs) {
      for (const id of o.req.factIds) expect(["health-safety", "workforce"], `${label(o)} ${id}`).not.toContain(getFact(id).topic);
      expect(o.text).not.toMatch(/fatalities|turnover|new hires|safety committee/i);
    }
  });

  it("story kits never repeat their opening place or event back to back", () => {
    for (const o of outputs.filter((x) => x.req.task === "story-kit")) {
      const [first, second] = o.text.split(/(?<=\.)\s+/);
      if (/World Finals in Singapore/.test(first)) expect(second, label(o)).not.toMatch(/World Finals were held in Singapore/);
      expect(o.text, label(o)).not.toMatch(/Our Transition Event[^.]*\. [^.]*The AFBE-UK Transition Event/);
    }
  });
});
