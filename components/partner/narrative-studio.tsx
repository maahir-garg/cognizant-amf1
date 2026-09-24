"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { AiText } from "@/components/shared/ai-text";
import { InlineFact } from "@/components/shared/fact-value";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAiText } from "@/lib/ai/client";
import {
  NARRATIVE_FORMATS,
  NARRATIVE_TONES,
  narrativeRequest,
  partnerNarrativeFactIds,
  type NarrativeFormat,
  type NarrativeTone,
} from "@/lib/ai/requests";
import { PARTNER_ID } from "@/lib/config";
import { getFact } from "@/lib/data/load";
import { PILLARS, type Pillar } from "@/lib/data/schemas";
import { footnotedPlainText } from "@/lib/partner/citations";

const FORMAT_LABEL: Record<NarrativeFormat, string> = {
  "linkedin-post": "LinkedIn post",
  "quarterly-brief": "Quarterly impact brief",
  "investor-summary": "Investor slide summary",
};

const PILLAR_LABEL: Record<Pillar, string> = {
  environment: "Environment",
  belong: "Belong",
  community: "Community",
  governance: "Governance",
};

export function NarrativeStudio() {
  const [format, setFormat] = useState<NarrativeFormat>("linkedin-post");
  const [pillars, setPillars] = useState<Pillar[]>(["community", "environment"]);
  const [tone, setTone] = useState<NarrativeTone>("confident");
  const [copied, setCopied] = useState(false);

  const activePillars = pillars.length ? pillars : [...PILLARS];
  const request = narrativeRequest(format, { partnerId: PARTNER_ID, pillars: activePillars, tone });
  const { data, error, loading } = useAiText(request);
  const factIds = partnerNarrativeFactIds(PARTNER_ID, activePillars);

  const copy = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(footnotedPlainText(data, request.derived));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 border-b border-line pb-6">
          <div className="flex flex-col gap-2">
            <p className="label">Format</p>
            <ToggleGroup
              type="single"
              variant="outline"
              value={format}
              onValueChange={(v) => v && setFormat(v as NarrativeFormat)}
              className="flex-wrap"
            >
              {NARRATIVE_FORMATS.map((f) => (
                <ToggleGroupItem key={f} value={f} className="text-xs">
                  {FORMAT_LABEL[f]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="flex flex-col gap-2">
            <p className="label">Pillar focus</p>
            <ToggleGroup
              type="multiple"
              variant="outline"
              value={pillars}
              onValueChange={(v) => setPillars(v as Pillar[])}
              className="flex-wrap"
            >
              {PILLARS.map((p) => (
                <ToggleGroupItem key={p} value={p} className="text-xs">
                  {PILLAR_LABEL[p]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="flex flex-col gap-2">
            <p className="label">Tone</p>
            <ToggleGroup type="single" variant="outline" value={tone} onValueChange={(v) => v && setTone(v as NarrativeTone)}>
              {NARRATIVE_TONES.map((t) => (
                <ToggleGroupItem key={t} value={t} className="text-xs capitalize">
                  {t}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-md border border-line bg-surface p-6">
          <p className="label">{FORMAT_LABEL[format]} draft</p>
          {loading && <p className="text-sm text-ink-3">Drafting…</p>}
          {error && <p className="text-sm text-conflict">Could not draft this text: {error}</p>}
          {data && <AiText response={data} />}
          {data && (
            <Button size="sm" variant="outline" className="self-start" onClick={copy}>
              {copied ? (
                <>
                  <Check /> Copied with footnotes
                </>
              ) : (
                <>
                  <Copy /> Copy as plain text
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <aside className="flex flex-col gap-3">
        <p className="label">Facts this draft may use</p>
        <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
          {factIds.map((id) => {
            const fact = getFact(id);
            return (
              <li key={id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="min-w-0 text-xs text-ink-2">{fact.metric}</span>
                <span className="shrink-0 sm:max-w-[45%] sm:text-right">
                  <InlineFact id={id} />
                </span>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-ink-3">
          The model only ever receives these facts, plus any calculations shown, and must cite them inline. The numeric
          guardrail rejects any figure that isn&apos;t cited.
        </p>
      </aside>
    </div>
  );
}
