"use client";

import { toPng } from "html-to-image";
import { Download } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { AiText } from "@/components/shared/ai-text";
import { InlineFact } from "@/components/shared/fact-value";
import { Button } from "@/components/ui/button";
import { useAiText } from "@/lib/ai/client";
import { STORY_KIT_FORMATS, storyKitFactIds, storyKitRequest, type StoryKitFormat } from "@/lib/ai/requests";
import { factCitation, getFact } from "@/lib/data/load";
import { draftKey } from "@/lib/partner/approvals";
import { citationsToFootnotes, footnotedPlainText } from "@/lib/partner/citations";
import { CARD_SIZES, cardFactIds, cardLabel, coBrandLine, coBrandPartners, storyKitInitiatives, type CardSize } from "@/lib/partner/story-kit";
import { ApprovalPanel } from "./approval-panel";
import { ChoiceChips } from "./choice-chips";
import { ShareCard } from "./share-card";

const FORMAT_META: Record<StoryKitFormat, { label: string; hint: string }> = {
  post: { label: "Social post", hint: "In your organisation's voice" },
  funder: { label: "Funder report paragraph", hint: "Formal, with numbered footnotes" },
};

/** Width of the preview box, so the exact-size card can be scaled to fit it. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

function CardPreview({ size, coBrand, title, factIds, fileStem }: { size: CardSize; coBrand: string; title: string; factIds: string[]; fileStem: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [boxRef, boxWidth] = useWidth<HTMLDivElement>();
  const [busy, setBusy] = useState(false);
  // Tall cards are capped by height so a 9:16 preview never runs off a projector screen.
  const maxWidth = size.height > size.width ? Math.round(660 * (size.width / size.height)) : 640;
  const scale = boxWidth ? Math.min(boxWidth, maxWidth) / size.width : 0;

  const download = async () => {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const url = await toPng(cardRef.current, { width: size.width, height: size.height, pixelRatio: 1 });
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileStem}-${size.width}x${size.height}.png`;
      a.click();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div ref={boxRef} className="w-full">
        <div
          className="overflow-hidden border border-line"
          style={{ width: scale ? size.width * scale : "100%", height: scale ? size.height * scale : undefined, aspectRatio: scale ? undefined : `${size.width} / ${size.height}` }}
        >
          <div style={{ width: size.width, height: size.height, transform: `scale(${scale})`, transformOrigin: "top left" }}>
            <ShareCard ref={cardRef} size={size} coBrand={coBrand} title={title} facts={factIds.map(getFact)} />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={download} disabled={busy}>
          <Download /> {busy ? "Preparing…" : `Download PNG · ${size.width} × ${size.height}`}
        </Button>
        <span className="text-[0.875em] text-ink-3">{size.use}</span>
      </div>
    </div>
  );
}

export function StoryKitStudio({ initialId }: { initialId?: string }) {
  const initiatives = storyKitInitiatives();
  const [initiativeId, setInitiativeId] = useState(
    initiatives.some((i) => i.id === initialId) ? initialId! : (initiatives[0]?.id ?? ""),
  );
  const [format, setFormat] = useState<StoryKitFormat>("post");
  const [sizeId, setSizeId] = useState<CardSize["id"]>("story");
  const selectId = useId();

  const initiative = initiatives.find((i) => i.id === initiativeId) ?? initiatives[0];
  const request = initiative ? storyKitRequest(initiative.id, format) : null;
  const { data, error, loading } = useAiText(request);
  if (!initiative || !request) return null;

  const size = CARD_SIZES.find((s) => s.id === sizeId) ?? CARD_SIZES[0];
  const coBrand = coBrandLine(initiative);
  const ownFacts = storyKitFactIds(initiative.id).filter((id) => initiative.factIds.includes(id));
  const left = initiative.factIds.filter((id) => !ownFacts.includes(id));
  const footnotes = data && format === "funder" ? citationsToFootnotes(data).footnotes : [];
  // Initiative summaries are free text; one that carries a figure is left out so every number stays sourced.
  const summary = /\d/.test(initiative.summary) ? null : initiative.summary;

  return (
    <div className="grid gap-x-12 gap-y-10 pt-8 lg:grid-cols-12">
      <div className="flex min-w-0 flex-col gap-8 lg:col-span-5">
        <div className="flex flex-col gap-2">
          <label htmlFor={selectId} className="kicker">
            Community or charity partner
          </label>
          <select
            id={selectId}
            value={initiative.id}
            onChange={(e) => setInitiativeId(e.target.value)}
            className="h-12 w-full rounded-md border border-line-strong bg-surface px-3 text-base text-ink"
          >
            {initiatives.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          <p className="text-ink-2">
            Card and copy co-branded as <span className="font-semibold text-ink">{coBrand}</span>, from the programme&apos;s own partner
            list.
          </p>
          {coBrandPartners(initiative).length > 1 && (
            <p className="border-l-2 border-estimated pl-3 text-[0.875em] text-ink">
              Needs partner approval: the card names {coBrandPartners(initiative).slice(1).join(" and ")} as well. Check with them before
              posting.
            </p>
          )}
          {summary && <p className="text-[0.875em] text-ink-3">{summary}</p>}
        </div>

        <section aria-labelledby="own-heading" className="flex flex-col gap-2">
          <h2 id="own-heading" className="kicker">
            The programme&apos;s own figures, outcomes first
          </h2>
          <ul className="flex flex-col divide-y divide-line border-y border-line">
            {ownFacts.map((id) => (
              <li key={id} className="flex flex-col gap-1 py-2.5">
                {/* Figure first, then the written label that follows it on the card ("93% of mentees said ..."). */}
                <span className="leading-snug text-ink-2">
                  {getFact(id).value !== null && (
                    <>
                      <InlineFact id={id} />{" "}
                    </>
                  )}
                  {cardLabel(id)}
                  {getFact(id).value === null && (
                    <>
                      {": "}
                      <InlineFact id={id} className="font-medium" />
                    </>
                  )}
                </span>
                <span className="text-[0.8125rem] text-ink-3">{factCitation(getFact(id)).label}</span>
              </li>
            ))}
          </ul>
          {left.length > 0 && (
            <p className="text-[0.875em] text-ink-3">
              {left.length === 1 ? "One figure is" : "Some figures are"} left out because the reports print{" "}
              {left.length === 1 ? "it" : "them"} differently in different places. The desk&apos;s Data quality tab has the detail.
            </p>
          )}
        </section>

        <div className="flex flex-col gap-4">
          <ChoiceChips
            legend="Copy"
            value={format}
            onChange={setFormat}
            options={STORY_KIT_FORMATS.map((f) => ({ value: f, label: FORMAT_META[f].label, hint: FORMAT_META[f].hint }))}
          />
          <div className="rounded-md border border-line bg-surface p-5">
            {loading && <p className="text-ink-3">Drafting…</p>}
            {error && <p className="text-conflict">Could not draft this copy: {error}</p>}
            {data && <AiText response={data} className="text-[1.0625rem]" />}
            {footnotes.length > 0 && (
              <ol className="mt-4 flex flex-col gap-1 border-t border-line pt-3 text-[0.8125rem] text-ink-2">
                {footnotes.map((f) => (
                  <li key={f.id}>
                    <span className="num font-semibold">[{f.n}]</span> {f.text}
                  </li>
                ))}
              </ol>
            )}
          </div>
          {data && data.guardrail.passed && (
            <ApprovalPanel
              draftKey={draftKey(`story-kit-${initiative.id}-${format}`, data.text)}
              title={`${FORMAT_META[format].label}: ${initiative.name}`}
              text={data.text}
              factIds={data.citations}
              copyText={() => footnotedPlainText(data)}
            />
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-32 lg:col-span-7 lg:self-start">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-t-2 border-ink pt-3">
          <h2 className="text-[1.0625rem] font-semibold">Share card</h2>
          <p className="text-[0.875em] text-ink-3">Figures carry their status and page. No free text is added.</p>
        </div>
        <ChoiceChips
          legend="Size"
          value={sizeId}
          onChange={setSizeId}
          options={CARD_SIZES.map((s) => ({ value: s.id, label: `${s.ratio} · ${s.label}`, hint: `${s.width} × ${s.height}` }))}
        />
        <CardPreview
          key={`${initiative.id}-${size.id}`}
          size={size}
          coBrand={coBrand}
          title={initiative.name.replace(/\s*\(with [^)]*\)$/, "")}
          factIds={cardFactIds(initiative)}
          fileStem={initiative.id}
        />
      </div>
    </div>
  );
}
