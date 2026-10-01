"use client";

import { forwardRef, useEffect, useRef, type ReactNode } from "react";
import { APP_NAME, SITE_URL } from "@/lib/config";
import { getFact } from "@/lib/data/load";
import { QUIZ_BADGE_LABEL } from "@/lib/fan/quiz";
import { shareFactContext, shareFactLabel, shareFactValue, shareSourceLine } from "@/lib/fan/share";
import { cn } from "@/lib/utils";

export const SHARE_CARD_WIDTH = 1080;
export const SHARE_CARD_HEIGHT = 1920;

/**
 * Canvas layout. The top 250 and bottom 340 px stay clear of everything but
 * the wordmark (story apps draw their own controls there). Between them a
 * column holds the title block, the car band and the figures; the band takes
 * whatever height is left, so a longer title or a third figure shrinks the
 * picture instead of colliding with it. The source line sits at y 1520.
 */
const SAFE_TOP = 250;
const SOURCE_TOP = 1520;
const MARGIN = 72;

/** A status badge at card scale: the same shapes as StatusMark, never colour alone. */
function CardStatus({ status }: { status: "verified" | "estimated" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 font-sans font-semibold tracking-[0.06em] uppercase",
        status === "verified" ? "text-verified" : "text-estimated",
      )}
      style={{ fontSize: 24, lineHeight: "28px", fontStretch: "100%" }}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block shrink-0 rounded-[2px]",
          status === "verified" ? "bg-verified" : "border-2 border-estimated bg-[linear-gradient(135deg,var(--estimated)_50%,transparent_50%)]",
        )}
        style={{ width: 22, height: 22 }}
      />
      {status === "verified" ? "Verified" : "Estimated"}
    </span>
  );
}

/**
 * The exported card's numbers are pixel-tuned for a fixed canvas, so they
 * don't use <FactValue>'s responsive sizing, and a click-to-open button is
 * the wrong affordance in a static image. Every number still comes straight
 * from the fact base (shareFactValue) and keeps its status badge.
 */
/**
 * Fades a newly changed row in (160ms, 4px rise) with the Web Animations API.
 * Only the row that changed animates, never the whole card; nothing runs under
 * reduced motion. WAAPI leaves no CSS animation on the node, so a PNG export
 * that clones the card can never catch a row at its starting opacity.
 */
function EnterRow({ enter, className, children }: { enter: boolean; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enter || !ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    ref.current.animate(
      [
        { opacity: 0, transform: "translateY(4px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 160, easing: "cubic-bezier(.4,0,.2,1)" },
    );
    // Runs once, when the row first mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

function CardFigure({ id, primary, enter }: { id: string; primary: boolean; enter: boolean }) {
  const fact = getFact(id);
  return (
    <EnterRow enter={enter} className="flex items-start gap-8">
      <span className={cn("big-num shrink-0", primary ? "text-lime" : "text-ink")} style={{ fontSize: 150, lineHeight: 0.9, width: 340 }}>
        {shareFactValue(id)}
      </span>
      <span className="flex min-w-0 flex-col gap-3 pt-1">
        <span className="font-serif text-ink" style={{ fontSize: 40, lineHeight: 1.15 }}>
          {shareFactLabel(id)}
        </span>
        <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <CardStatus status={fact.status === "estimated" ? "estimated" : "verified"} />
          <span className="font-sans text-ink-2" style={{ fontSize: 24, lineHeight: "28px", fontStretch: "100%" }}>
            {shareFactContext(id)}
          </span>
        </span>
      </span>
    </EnterRow>
  );
}

export type ShareCardProps = {
  /** "Singapore" */
  raceShortName: string;
  factIds: string[];
  planLine: string | null;
  badge: boolean;
  /** The row that just changed in the builder ("plan" or a fact id): only it fades in. */
  enter?: string | null;
  className?: string;
};

/**
 * Forwards its ref to the card's own root, so an export targets this node
 * rather than the preview wrapper that carries a CSS scale transform
 * (html-to-image would otherwise draw the card shrunk into a corner).
 */
export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { raceShortName, factIds, planLine, badge, enter = null, className },
  ref,
) {
  return (
    <div
      ref={ref}
      data-tone="green"
      className={cn("relative overflow-hidden bg-bg text-ink", className)}
      style={{ width: SHARE_CARD_WIDTH, height: SHARE_CARD_HEIGHT }}
    >
      <div className="absolute flex items-center gap-4" style={{ left: MARGIN, top: 76 }}>
        <span aria-hidden className="inline-block bg-lime" style={{ width: 10, height: 36 }} />
        <span className="font-serif font-semibold text-ink" style={{ fontSize: 40, lineHeight: "40px" }}>
          {APP_NAME}
        </span>
      </div>

      <div className="absolute inset-x-0 flex flex-col" style={{ top: SAFE_TOP, height: SOURCE_TOP - SAFE_TOP - 40, gap: 40 }}>
        <div className="flex flex-col" style={{ paddingInline: MARGIN, gap: 24 }}>
          <h2 className="font-serif font-medium text-ink" style={{ fontSize: 112, lineHeight: 1, letterSpacing: "-0.01em" }}>
            {raceShortName} race week, off camera
          </h2>
          {planLine && (
            <EnterRow key={planLine} enter={enter === "plan"}>
              <p className="font-serif text-ink italic" style={{ fontSize: 44, lineHeight: 1.2 }}>
                {planLine}
              </p>
            </EnterRow>
          )}
          {badge && (
            <p
              className="inline-flex w-fit items-center gap-3 rounded-[4px] border-2 border-lime font-sans font-semibold text-ink"
              style={{ fontSize: 26, lineHeight: "32px", padding: "6px 18px 6px 14px", fontStretch: "100%" }}
            >
              <span className="text-lime">✓</span> {QUIZ_BADGE_LABEL}
              <span className="font-medium text-ink-2">· quick check done</span>
            </p>
          )}
        </div>

        {/* A plain img: html-to-image inlines it as-is, with no optimiser URL in between. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/amr26-launch-quarter.jpg"
          alt=""
          className="min-h-0 w-full flex-1 object-cover"
          style={{ objectPosition: "50% 55%", maxHeight: 800 }}
        />

        <div className="flex flex-col" style={{ paddingInline: MARGIN, gap: 28 }}>
          {factIds.slice(0, 3).map((id, i) => (
            <CardFigure key={id} id={id} primary={i === 0} enter={enter === id} />
          ))}
        </div>
      </div>

      <p
        className="absolute font-sans text-ink-2"
        style={{ left: MARGIN, right: MARGIN, top: SOURCE_TOP, fontSize: 26, lineHeight: 1.3, fontStretch: "100%" }}
      >
        Figures: {shareSourceLine(factIds)} · Image: Aston Martin Aramco
      </p>

      {/*
        The link back sits in the top of the bottom well. Story apps may draw their reply bar over
        the lowest part; nothing here is essential (the source line above names every page, and the
        copied caption carries the same address).
      */}
      <div className="absolute flex flex-col" style={{ left: MARGIN, right: MARGIN, top: 1612, gap: 14 }}>
        <span aria-hidden className="block bg-lime" style={{ width: 64, height: 3 }} />
        <span className="font-sans text-ink-2" style={{ fontSize: 26, lineHeight: 1.2, fontStretch: "100%" }}>
          See the page behind every figure at
        </span>
        <span className="font-sans font-semibold text-ink" style={{ fontSize: 48, lineHeight: 1.1, fontStretch: "100%" }}>
          {SITE_URL}
        </span>
      </div>
    </div>
  );
});
