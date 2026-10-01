"use client";

import { useState } from "react";
import { AiText } from "@/components/shared/ai-text";
import { InlineFact } from "@/components/shared/fact-value";
import { useAiText } from "@/lib/ai/client";
import { NARRATIVE_FORMATS, narrativeRequest, partnerNarrativeFactIds, type NarrativeFormat } from "@/lib/ai/requests";
import { PARTNER_ID, PARTNER_NAME } from "@/lib/config";
import { factCitation, getFact } from "@/lib/data/load";
import { PILLARS, type Pillar } from "@/lib/data/schemas";
import { draftKey } from "@/lib/partner/approvals";
import { footnotedPlainText } from "@/lib/partner/citations";
import { ApprovalPanel } from "./approval-panel";
import { CheckChips, ChoiceChips } from "./choice-chips";

const FORMAT_META: Record<NarrativeFormat, { label: string; hint: string }> = {
  "linkedin-post": { label: "LinkedIn post", hint: "80 to 140 words, co-branded" },
  "quarterly-brief": { label: "Quarterly brief", hint: "Headline and short sections for a partner report" },
  "leadership-update": { label: "Leadership update", hint: "Four points and a so-what line for leadership" },
};

const PILLAR_LABEL: Record<Pillar, string> = {
  environment: "Environment",
  belong: "Belong",
  community: "Community",
  governance: "Governance",
};

export function NarrativeStudio({ initialFormat, initialPillars }: { initialFormat: NarrativeFormat; initialPillars: Pillar[] }) {
  const [format, setFormat] = useState<NarrativeFormat>(initialFormat);
  const [pillars, setPillars] = useState<Pillar[]>(initialPillars);

  const activePillars = pillars.length ? pillars : [...PILLARS];
  const request = narrativeRequest(format, { partnerId: PARTNER_ID, pillars: activePillars });
  const { data, error, loading } = useAiText(request);
  const factIds = partnerNarrativeFactIds(PARTNER_ID, activePillars);
  const cited = new Set(data?.citations ?? []);

  return (
    <div className="grid gap-x-10 gap-y-8 pt-8 lg:grid-cols-12">
      <div className="flex flex-col gap-8 lg:col-span-3">
        <ChoiceChips
          legend="Format"
          layout="column"
          value={format}
          onChange={setFormat}
          options={NARRATIVE_FORMATS.map((f) => ({ value: f, label: FORMAT_META[f].label, hint: FORMAT_META[f].hint }))}
        />
        <CheckChips
          legend="Pillar focus"
          values={pillars}
          onChange={setPillars}
          options={PILLARS.map((p) => ({ value: p, label: PILLAR_LABEL[p] }))}
        />
        <p className="text-[0.875em] text-ink-3">
          None selected means all four. Joint {PARTNER_NAME} facts are always included.
        </p>
      </div>

      <article aria-label={`${FORMAT_META[format].label} draft`} className="flex min-w-0 flex-col gap-4 lg:col-span-6">
        <div className="flex items-baseline justify-between gap-4 border-t-2 border-ink pt-3">
          <h2 className="text-[1.0625rem] font-semibold">{FORMAT_META[format].label}</h2>
          <p className="text-[0.875em] text-ink-3">Draft · every figure cited</p>
        </div>
        <div className="rounded-md border border-line bg-surface px-6 py-6 sm:px-8">
          {loading && <p className="text-ink-3">Drafting from the fact base…</p>}
          {error && <p className="text-conflict">Could not draft this text: {error}</p>}
          {data && <AiText response={data} className="measure text-[1.125rem] min-[1800px]:text-[1.1875rem]" />}
        </div>
        {data && data.guardrail.passed && (
          <ApprovalPanel
            draftKey={draftKey(format, data.text)}
            title={FORMAT_META[format].label}
            text={data.text}
            factIds={data.citations}
            copyText={() => footnotedPlainText(data, request.derived)}
          />
        )}
      </article>

      <aside className="flex min-w-0 flex-col gap-6 lg:col-span-3">
        <section aria-labelledby="facts-heading" className="flex flex-col gap-2">
          <h2 id="facts-heading" className="kicker">
            Facts this draft may use
          </h2>
          <p className="text-[0.875em] text-ink-3">The draft can only use these. ✓ marks the ones it cites.</p>
          <ul className="flex flex-col divide-y divide-line border-y border-line">
            {factIds.map((id) => {
              const fact = getFact(id);
              const used = cited.has(id);
              return (
                <li key={id} className="flex gap-2 py-2.5">
                  <span aria-hidden className="w-4 shrink-0 font-semibold text-ink">
                    {used ? "✓" : ""}
                  </span>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="text-[0.875em] leading-snug text-ink-2">
                      {used && <span className="sr-only">Cited: </span>}
                      {fact.metric}
                    </span>
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <InlineFact id={id} className="font-medium" />
                      <span className="text-[0.8125rem] text-ink-3">{factCitation(fact).label}</span>
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </aside>
    </div>
  );
}
