"use client";

import { toPng } from "html-to-image";
import { Download, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { shareCaptionRequest, DEFAULT_SHARE_FACT_IDS } from "@/lib/ai/requests";
import { useAiText } from "@/lib/ai/client";
import { stripCitations } from "@/lib/ai/guardrail";
import { getRace } from "@/lib/data/load";
import type { FanProfile } from "@/lib/data/schemas";
import { useResolvedProfile } from "@/lib/fan/profile";
import { NoProfileCard } from "./no-profile-card";
import { ShareCard, SHARE_CARD_HEIGHT, SHARE_CARD_WIDTH } from "./share-card";

const RACE_ID = "singapore-2026";
const FILENAME = "impact-lap-singapore.png";

export function ShareClient({ paramProfile }: { paramProfile: FanProfile | null }) {
  const profile = useResolvedProfile(paramProfile);
  return profile ? <ShareBuilder profile={profile} /> : <NoProfileCard />;
}

function ShareBuilder({ profile }: { profile: FanProfile }) {
  const race = getRace(RACE_ID);
  const { data } = useAiText(shareCaptionRequest(profile, DEFAULT_SHARE_FACT_IDS, RACE_ID));
  const caption = data ? stripCitations(data.text) : null;

  const cardRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.32);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    function update() {
      if (!wrapperRef.current) return;
      setScale(wrapperRef.current.offsetWidth / SHARE_CARD_WIDTH);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  async function exportPng(): Promise<Blob | null> {
    if (!cardRef.current) return null;
    const dataUrl = await toPng(cardRef.current, {
      width: SHARE_CARD_WIDTH,
      height: SHARE_CARD_HEIGHT,
      canvasWidth: SHARE_CARD_WIDTH,
      canvasHeight: SHARE_CARD_HEIGHT,
      pixelRatio: 1,
      backgroundColor: "#0f5c49",
    });
    const res = await fetch(dataUrl);
    return res.blob();
  }

  async function handleDownload() {
    setBusy(true);
    try {
      const blob = await exportPng();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = FILENAME;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Card downloaded");
    } catch {
      toast.error("Couldn't export the card. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    if (typeof navigator === "undefined" || !navigator.share) return;
    setBusy(true);
    try {
      const blob = await exportPng();
      if (!blob) return;
      const file = new File([blob], FILENAME, { type: "image/png" });
      if (navigator.canShare && !navigator.canShare({ files: [file] })) {
        toast.error("Sharing isn't supported here. Download instead.");
        return;
      }
      await navigator.share({ files: [file], title: "My Impact Lap", text: "My weekend in impact, from Impact Lap." });
    } catch {
      // Cancelled or unsupported; no toast needed.
    } finally {
      setBusy(false);
    }
  }

  const canShare = typeof navigator !== "undefined" && Boolean(navigator.share);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-2">
        <p className="label">Your weekend in impact</p>
        <h1 className="display text-[clamp(2.5rem,9vw,4rem)]">Make your card</h1>
        <p className="text-ink-2">A 9:16 card sized for stories: {race.name}, your headline figures and a personalised caption.</p>
      </div>

      <div ref={wrapperRef} className="mx-auto w-full max-w-[360px]">
        <div style={{ height: SHARE_CARD_HEIGHT * scale, overflow: "hidden" }} className="rounded-md border border-line">
          <div style={{ width: SHARE_CARD_WIDTH, height: SHARE_CARD_HEIGHT, transform: `scale(${scale})`, transformOrigin: "top left" }}>
            <ShareCard ref={cardRef} profile={profile} factIds={[...DEFAULT_SHARE_FACT_IDS]} caption={caption} raceLabel={race.name} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={handleDownload} disabled={busy || !caption} className="w-full sm:w-auto">
          <Download /> Download PNG
        </Button>
        {canShare && (
          <Button size="lg" variant="outline" onClick={handleShare} disabled={busy || !caption} className="w-full sm:w-auto">
            <Share2 /> Share
          </Button>
        )}
      </div>
    </div>
  );
}
