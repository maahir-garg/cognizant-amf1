"use client";

import { AiText } from "@/components/shared/ai-text";
import { useProvenance } from "@/components/shared/provenance";
import { StatusMark } from "@/components/shared/status-badge";
import { getFact } from "@/lib/data/load";
import type { AiRequest, AiResponse } from "@/lib/data/schemas";

/**
 * One real generated draft laid out against the four steps: the facts the
 * app selected, the text drafted from them, and every number the guardrail
 * read with the fact it matched. The response is produced by the same engine
 * the desk uses (cache, model or template), on the server.
 */
export function LiveDraft({ request, response, title }: { request: AiRequest; response: AiResponse; title: string }) {
  const { openFact } = useProvenance();
  const used = new Set(response.citations);

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-6">
      <section aria-labelledby="live-select" className="flex flex-col gap-3 lg:col-span-3">
        <h4 id="live-select" className="kicker text-ink">
          <span className="num mr-2 text-ink-3">1</span>Select
        </h4>
        <p className="text-[0.9375rem] leading-snug text-ink-2">
          The app sends a short list of facts, and the model sees nothing else. The draft cites these:
        </p>
        <FactList ids={request.factIds.filter((id) => used.has(id))} onOpen={openFact} />
        {request.factIds.some((id) => !used.has(id)) && (
          <details className="group">
            <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 font-sans text-[0.875rem] font-semibold text-ink [&::-webkit-details-marker]:hidden">
              <span aria-hidden className="inline-block transition-transform group-open:rotate-90">
                →
              </span>
              {request.factIds.filter((id) => !used.has(id)).length} more sent, not used in this draft
            </summary>
            <FactList ids={request.factIds.filter((id) => !used.has(id))} onOpen={openFact} />
          </details>
        )}
      </section>

      <section aria-labelledby="live-draft" className="flex flex-col gap-3 lg:col-span-6">
        <h4 id="live-draft" className="kicker text-ink">
          <span className="num mr-2 text-ink-3">2–3</span>Explain and draft
        </h4>
        <p className="text-[0.9375rem] leading-snug text-ink-2">{title}</p>
        <AiText response={response} className="text-lg" />
      </section>

      <section aria-labelledby="live-check" className="flex flex-col gap-3 lg:col-span-3">
        <h4 id="live-check" className="kicker text-ink">
          <span className="num mr-2 text-ink-3">4</span>Check
        </h4>
        <p className="text-[0.9375rem] leading-snug text-ink-2">
          {response.guardrail.passed ? "Every number in the draft, and the cited fact it matched." : "The draft was held back."}
        </p>
        <ul className="flex flex-col border-t border-line">
          {response.guardrail.checked.map((c, i) => (
            <li key={`${c.raw}-${i}`} className="flex flex-col gap-0.5 border-b border-line py-2">
              <span className="num text-[0.9375rem] font-semibold text-ink">{c.raw}</span>
              {c.matchedId ? (
                <code className="font-mono text-xs text-ink-3">
                  <span aria-hidden>✓ </span>
                  {c.matchedId}
                </code>
              ) : (
                <span className="kicker text-ink">No match</span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function FactList({ ids, onOpen }: { ids: string[]; onOpen: (id: string) => void }) {
  return (
    <ul className="flex flex-col border-t border-line">
      {ids.map((id) => {
        const f = getFact(id);
        return (
          <li key={id} className="border-b border-line">
            <button
              type="button"
              onClick={() => onOpen(id)}
              className="flex w-full items-start gap-2 py-2 text-left text-[0.8125rem] leading-snug text-ink hover:bg-surface-2"
            >
              <StatusMark status={f.status} className="mt-1" />
              <span className="flex min-w-0 flex-col">
                <span className="line-clamp-2">{f.metric}</span>
                <code className="truncate font-mono text-xs text-ink-3">{id}</code>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
