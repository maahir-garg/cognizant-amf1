"use client";

import { getFontEmbedCSS, toPng } from "html-to-image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { AiText } from "@/components/shared/ai-text";
import { StatusMark } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useAiText } from "@/lib/ai/client";
import { stripCitations } from "@/lib/ai/guardrail";
import { SITE_URL } from "@/lib/config";
import { DEFAULT_SHARE_FACT_IDS, shareCaptionRequest } from "@/lib/ai/requests";
import { getFact, getRace, travelModes } from "@/lib/data/load";
import { formatFact } from "@/lib/format";
import { useFanProfile } from "@/lib/fan/profile";
import { DEFAULT_FAN, QUIZ_BADGE_LABEL } from "@/lib/fan/quiz";
import { raceShortName } from "@/lib/fan/race";
import { SHARE_FACTS, SHARE_MAX_FACTS, sanitiseShareFacts, shareFactValue } from "@/lib/fan/share";
import { useQuizBadge, useTripPlan } from "@/lib/fan/storage";
import { isTravelMode, modeLabel, planLine } from "@/lib/fan/trip";
import { cn } from "@/lib/utils";
import { SHARE_CARD_HEIGHT, SHARE_CARD_WIDTH, ShareCard } from "./share-card";

const CHIP =
  "group flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-line-strong px-3 py-2 font-sans text-base font-medium text-ink transition-colors hover:bg-paper-2 has-[:checked]:border-2 has-[:checked]:border-ink has-[:checked]:bg-lime-tint has-[:checked]:px-[11px] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus";

const NO_PLAN = "none";
const THUMB_WIDTH = 44;

/** Waits for web fonts and the car image so the export never catches a fallback face or an empty band. */
async function ready(node: HTMLElement) {
  await document.fonts.ready;
  await Promise.all(
    [...node.querySelectorAll("img")].map((img) => (img.complete ? img.decode().catch(() => undefined) : new Promise((r) => (img.onload = r)))),
  );
}

const noopSubscribe = () => () => {};

/** Web Share with files: phones mostly, some desktop browsers. Hidden where it isn't supported. */
function canShareFiles(): boolean {
  if (typeof navigator.canShare !== "function") return false;
  try {
    return navigator.canShare({ files: [new File([new Blob()], "card.png", { type: "image/png" })] });
  } catch {
    return false;
  }
}

export function ShareBuilder({ raceId, initialMode }: { raceId: string; initialMode: string | null }) {
  const race = getRace(raceId);
  const [plan] = useTripPlan();
  const [badge] = useQuizBadge();
  const { profile } = useFanProfile();

  const [factIds, setFactIds] = useState<string[]>([...DEFAULT_SHARE_FACT_IDS]);
  const [modeChoice, setModeChoice] = useState<string | null>(null);
  const [group, setGroup] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const [busy, setBusy] = useState(false);
  const canShare = useSyncExternalStore(noopSubscribe, canShareFiles, () => false);

  // A choice made on this page wins; then the plan the trip planner saved (always the fan's latest
  // pick, so it beats a stale ?mode= link); then ?mode= for a fresh visit; then the MRT.
  const saved = plan?.raceId === raceId && isTravelMode(plan.modeId) ? plan.modeId : null;
  const modeId = modeChoice ?? saved ?? initialMode ?? "mrt";
  const line = modeId === NO_PLAN ? null : planLine(modeId, race, group);
  const hasBadge = Boolean(badge) && showBadge;

  const fan = profile ?? DEFAULT_FAN;
  const { data: caption } = useAiText(shareCaptionRequest(fan, factIds, raceId));

  const cardRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fontCss = useRef<Promise<string> | null>(null);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => setScale(el.offsetWidth / SHARE_CARD_WIDTH);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);


  function toggleFact(id: string) {
    setFactIds((current) => {
      if (current.includes(id)) return current.length > 1 ? current.filter((x) => x !== id) : current;
      if (current.length >= SHARE_MAX_FACTS) return current;
      return sanitiseShareFacts([...current, id], current);
    });
  }

  async function exportPng(): Promise<Blob | null> {
    const node = cardRef.current;
    if (!node) return null;
    await ready(node);
    fontCss.current ??= getFontEmbedCSS(node);
    const options = {
      width: SHARE_CARD_WIDTH,
      height: SHARE_CARD_HEIGHT,
      canvasWidth: SHARE_CARD_WIDTH,
      canvasHeight: SHARE_CARD_HEIGHT,
      pixelRatio: 1,
      cacheBust: false,
      fontEmbedCSS: await fontCss.current,
    };
    // The first pass can miss a freshly inlined image in some browsers; the second is the one we keep.
    await toPng(node, options);
    const dataUrl = await toPng(node, options);
    return (await fetch(dataUrl)).blob();
  }

  const filename = `${raceShortName(race).toLowerCase()}-race-week-card.png`;

  async function handleDownload() {
    setBusy(true);
    try {
      const blob = await exportPng();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Card saved as an image");
    } catch {
      toast.error("Couldn't make the image. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function copyCaption() {
    if (!caption) return;
    // Plain text for any app: citation markers out, the link back in.
    const text = `${stripCitations(caption.text)} ${SITE_URL}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Caption copied");
    } catch {
      toast.error("Couldn't copy. Select the caption and copy it instead.");
    }
  }

  async function handleShare() {
    setBusy(true);
    try {
      const blob = await exportPng();
      if (!blob) return;
      const file = new File([blob], filename, { type: "image/png" });
      const text = caption ? `${stripCitations(caption.text)} ${SITE_URL}` : SITE_URL;
      await navigator.share({ files: [file], title: `${raceShortName(race)} race week`, text });
    } catch {
      // Cancelled by the fan, or the share sheet isn't available: nothing to report.
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap grid gap-10 pt-10 pb-36 sm:pt-14 lg:grid-cols-12 lg:gap-6 lg:py-16">
      <div className="flex flex-col gap-4 lg:col-span-6">
        <Link href={`/weekend/${raceId}`} className="kicker w-fit text-ink-3 underline decoration-1 underline-offset-[3px] hover:text-ink">
          ← {raceShortName(race)} race page
        </Link>
        <p className="kicker kicker-rule mt-4">Something worth posting</p>
        <h1 className="h1-feature">Make your race&#8209;week card</h1>
        <p className="dek">Your plan, a team figure you choose and your badge, sized for stories. No name unless you add one yourself.</p>
      </div>

      {/* Preview first on phones, beside the controls from 1024 px. */}
      <div className="flex flex-col gap-6 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
        <div className="flex flex-col lg:sticky lg:top-20">
          {/* From 1024 px the preview is sized to the viewport height, so the save bar under it is always on screen. */}
          <div ref={wrapperRef} className="mx-auto w-full max-w-[360px] lg:max-w-[min(400px,calc((100svh-260px)*0.5625))]">
            <div
              className="overflow-hidden rounded-md border border-line-strong"
              style={{ height: SHARE_CARD_HEIGHT * scale }}
              role="img"
              aria-label={`Card preview: ${[line, ...factIds.map((id) => `${formatFact(getFact(id))}`)].filter(Boolean).join(", ")}`}
            >
              <div style={{ width: SHARE_CARD_WIDTH, height: SHARE_CARD_HEIGHT, transform: `scale(${scale})`, transformOrigin: "top left" }}>
                <ShareCard ref={cardRef} raceShortName={raceShortName(race)} factIds={factIds} planLine={line} badge={hasBadge} />
              </div>
            </div>
          </div>
          <div className="mx-auto mt-6 flex w-full max-w-[400px] flex-col gap-3 lg:order-3">
            <p className="kicker">Suggested caption</p>
            {caption ? <AiText response={caption} className="text-lg" /> : <p className="font-serif text-lg text-ink-3">Writing a caption from your figures…</p>}
            <Button variant="outline" size="lg" className="w-fit" onClick={copyCaption} disabled={!caption}>
              Copy caption
            </Button>
          </div>

          {/*
            One action bar: pinned to the bottom of the screen on phones (with a thumbnail that jumps
            back to the preview), and in the sticky preview column from 1024 px.
          */}
          <div
            data-tone="paper"
            className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line-strong bg-bg px-4 py-3 lg:static lg:z-auto lg:order-2 lg:mx-auto lg:mt-4 lg:w-full lg:max-w-[400px] lg:flex-col lg:items-start lg:border-t-0 lg:bg-transparent lg:p-0"
          >
            <button
              type="button"
              onClick={() => wrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="shrink-0 overflow-hidden rounded-sm border border-line-strong lg:hidden"
              style={{ width: THUMB_WIDTH, height: SHARE_CARD_HEIGHT * (THUMB_WIDTH / SHARE_CARD_WIDTH) }}
              aria-label="Back to the card preview"
            >
              <div aria-hidden style={{ width: SHARE_CARD_WIDTH, height: SHARE_CARD_HEIGHT, transform: `scale(${THUMB_WIDTH / SHARE_CARD_WIDTH})`, transformOrigin: "top left" }}>
                <ShareCard raceShortName={raceShortName(race)} factIds={factIds} planLine={line} badge={hasBadge} />
              </div>
            </button>
            <div className="flex flex-1 flex-wrap gap-2 lg:flex-none">
              <Button size="lg" onClick={handleDownload} disabled={busy} className="flex-1 lg:flex-none">
                {busy ? "Making the image…" : "Save the card"}
              </Button>
              {canShare && (
                <Button size="lg" variant="outline" onClick={handleShare} disabled={busy} className="flex-1 lg:flex-none">
                  Share
                </Button>
              )}
            </div>
            <p className="hidden font-sans text-sm text-ink-3 lg:block">
              A {SHARE_CARD_WIDTH} × {SHARE_CARD_HEIGHT} PNG, made on your device. Nothing is uploaded.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-10 lg:col-span-6">
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 flex flex-col gap-1">
            <span className="h3">Team figures</span>
            <span className="font-sans text-[0.9375rem] text-ink-2">
              Every one is printed in the team&apos;s report, and the card names the pages.
            </span>
          </legend>
          <p aria-live="polite" className="font-sans text-[0.9375rem] text-ink-2">
            {factIds.length >= SHARE_MAX_FACTS
              ? "That's three, the most the card fits at a size you can read on a phone. Untick one to swap it for another."
              : `Pick up to three: the card has room for three figures at a size you can read on a phone. ${factIds.length} chosen.`}
          </p>
          <div className="grid gap-2">
            {SHARE_FACTS.map((f) => {
              const fact = getFact(f.id);
              const checked = factIds.includes(f.id);
              const full = !checked && factIds.length >= SHARE_MAX_FACTS;
              return (
                <label key={f.id} className={cn(CHIP, full && "cursor-not-allowed opacity-60")}>
                  <input type="checkbox" checked={checked} disabled={full} onChange={() => toggleFact(f.id)} className="sr-only" />
                  <span aria-hidden className="w-4 shrink-0 text-center group-has-[:checked]:visible invisible">
                    ✓
                  </span>
                  <span className="num w-14 shrink-0 font-semibold">{shareFactValue(f.id)}</span>
                  <span className="flex-1 leading-snug">{f.label}</span>
                  <StatusMark status={fact.status} />
                  <span className="sr-only">{fact.status}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 flex flex-col gap-1">
            <span className="h3">Your plan</span>
            <span className="font-sans text-[0.9375rem] text-ink-2">
              How you&apos;re getting to the circuit.{" "}
              <Link href={`/weekend/${raceId}#getting-there`} className="link">
                Compare the options
              </Link>
            </span>
          </legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[...travelModes.map((m) => ({ id: m.id, label: modeLabel(m, race) })), { id: NO_PLAN, label: "Leave it off" }].map((m) => (
              <label key={m.id} className={CHIP}>
                <input type="radio" name="plan" value={m.id} checked={modeId === m.id} onChange={() => setModeChoice(m.id)} className="sr-only" />
                <span>
                  <span aria-hidden className="hidden group-has-[:checked]:inline">
                    ✓{" "}
                  </span>
                  {m.label}
                </span>
              </label>
            ))}
          </div>
          <label className={cn(CHIP, "w-fit")}>
            <input type="checkbox" checked={group} onChange={(e) => setGroup(e.target.checked)} className="sr-only" />
            <span aria-hidden className="w-4 text-center group-has-[:checked]:visible invisible">
              ✓
            </span>
            Going with friends: write it as &ldquo;our squad&rdquo;
          </label>
        </fieldset>

        <div className="flex flex-col gap-3">
          <h2 className="h3">Badge</h2>
          {badge ? (
            <label className={cn(CHIP, "w-fit")}>
              <input type="checkbox" checked={showBadge} onChange={(e) => setShowBadge(e.target.checked)} className="sr-only" />
              <span aria-hidden className="w-4 text-center group-has-[:checked]:visible invisible">
                ✓
              </span>
              Show &ldquo;{QUIZ_BADGE_LABEL}&rdquo;
            </label>
          ) : (
            <p className="font-sans text-[0.9375rem] text-ink-2">
              Answer the quick check to add the &ldquo;{QUIZ_BADGE_LABEL}&rdquo; badge.{" "}
              <Link href="/quiz" className="link">
                Take the quick check
              </Link>
            </p>
          )}
        </div>

        <p className="font-sans text-sm text-ink-3 lg:hidden">
          A {SHARE_CARD_WIDTH} × {SHARE_CARD_HEIGHT} PNG, made on your device. Nothing is uploaded.
        </p>
      </div>
    </div>
  );
}
