"use client";

import { toPng } from "html-to-image";
import { Download } from "lucide-react";
import { useRef, useState } from "react";
import { AiText } from "@/components/shared/ai-text";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAiText } from "@/lib/ai/client";
import { storyKitRequest } from "@/lib/ai/requests";
import { findFact, getSource } from "@/lib/data/load";
import { storyKitInitiatives } from "@/lib/partner/story-kit";
import { ShareCard } from "./share-card";

const CARD_W = 1080;
const CARD_H = 1350;
const PREVIEW_W = 280;

export function StoryKitStudio() {
  const initiatives = storyKitInitiatives();
  const [initiativeId, setInitiativeId] = useState(initiatives[0]?.id ?? "");
  const initiative = initiatives.find((i) => i.id === initiativeId) ?? initiatives[0];
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const postReq = initiative ? storyKitRequest(initiative.id, "post") : null;
  const summaryReq = initiative ? storyKitRequest(initiative.id, "summary") : null;
  const post = useAiText(postReq);
  const summary = useAiText(summaryReq);

  const cardFacts = (initiative?.factIds ?? [])
    .slice(0, 2)
    .map((id) => findFact(id))
    .filter((f): f is NonNullable<typeof f> => Boolean(f));
  const source = cardFacts[0]?.sourceId ? getSource(cardFacts[0].sourceId) : undefined;

  const download = async () => {
    if (!cardRef.current || !initiative) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { width: CARD_W, height: CARD_H, pixelRatio: 1 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${initiative.id}-share-card.png`;
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  if (!initiative) return null;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_auto]">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <p className="label">Community or charity partner</p>
          <Select value={initiative.id} onValueChange={setInitiativeId}>
            <SelectTrigger className="w-full sm:w-80" aria-label="Community or charity partner">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {initiatives.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-ink-2">{initiative.summary}</p>
          {initiative.partners.length > 0 && <p className="label">With {initiative.partners.join(", ")}</p>}
        </div>

        <div className="flex flex-col gap-3 rounded-md border border-line bg-surface p-5">
          <p className="label">Social post</p>
          {post.loading && <p className="text-sm text-ink-3">Drafting…</p>}
          {post.error && <p className="text-sm text-conflict">{post.error}</p>}
          {post.data && <AiText response={post.data} />}
        </div>

        <div className="flex flex-col gap-3 rounded-md border border-line bg-surface p-5">
          <p className="label">Partner summary</p>
          {summary.loading && <p className="text-sm text-ink-3">Drafting…</p>}
          {summary.error && <p className="text-sm text-conflict">{summary.error}</p>}
          {summary.data && <AiText response={summary.data} />}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <p className="label self-start lg:self-center">Share card · 1080 × 1350</p>
        <div style={{ width: PREVIEW_W, height: (PREVIEW_W * CARD_H) / CARD_W }} className="overflow-hidden rounded-md border border-line">
          <div style={{ width: CARD_W, height: CARD_H, transform: `scale(${PREVIEW_W / CARD_W})`, transformOrigin: "top left" }}>
            <ShareCard ref={cardRef} initiativeName={initiative.name} facts={cardFacts} sourceTitle={source?.title} />
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={download} disabled={downloading}>
          <Download /> {downloading ? "Preparing…" : "Download PNG"}
        </Button>
      </div>
    </div>
  );
}
