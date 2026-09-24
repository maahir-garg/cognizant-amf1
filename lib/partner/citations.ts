/**
 * Converts an AiResponse's inline [F:id] / [D:id] citations into numbered
 * footnotes, for copying grounded partner copy into an email, doc or slide
 * where interactive citation chips don't survive a paste.
 */
import { CITATION_RE, parseCitations } from "@/lib/ai/guardrail";
import { findFact, getSource } from "@/lib/data/load";
import type { AiResponse, DerivedValue } from "@/lib/data/schemas";

export type Footnote = { n: number; id: string; text: string };

function footnoteText(id: string, derived: DerivedValue[]): string {
  const fact = findFact(id);
  if (fact) {
    const source = fact.sourceId ? getSource(fact.sourceId) : undefined;
    if (source) {
      const page = fact.page ? `, p. ${fact.page}` : "";
      return `${source.title}${page} (${source.publisher})`;
    }
    return `${fact.metric} — ${fact.status}`;
  }
  const d = derived.find((x) => x.id === id);
  return d ? `${d.label} — ${d.formula}` : `Unknown reference ${id}`;
}

/**
 * Numbers citations in the order `response.citations` lists them (the same
 * order the citation chips use in <AiText>), replaces each inline marker
 * with `[n]`, and returns a matching footnote for each number.
 */
export function citationsToFootnotes(
  response: Pick<AiResponse, "text" | "citations">,
  derived: DerivedValue[] = [],
): { plainText: string; footnotes: Footnote[] } {
  const order = response.citations.length ? response.citations : parseCitations(response.text);
  const numberOf = new Map(order.map((id, i) => [id, i + 1]));

  const plainText = response.text
    .replace(CITATION_RE, (_match, _kind: string, id: string) => {
      const n = numberOf.get(id);
      return n ? `[${n}]` : "";
    })
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  const footnotes: Footnote[] = order.map((id, i) => ({ n: i + 1, id, text: footnoteText(id, derived) }));

  return { plainText, footnotes };
}

/** Plain text with a numbered footnote list appended, ready to paste outside the app. */
export function footnotedPlainText(response: Pick<AiResponse, "text" | "citations">, derived: DerivedValue[] = []): string {
  const { plainText, footnotes } = citationsToFootnotes(response, derived);
  if (footnotes.length === 0) return plainText;
  const list = footnotes.map((f) => `[${f.n}] ${f.text}`).join("\n");
  return `${plainText}\n\n${list}`;
}
