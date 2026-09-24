import { Check } from "lucide-react";
import { forwardRef } from "react";
import { StatusMark } from "@/components/shared/status-badge";
import { getCity, getFact, getSource } from "@/lib/data/load";
import type { FanProfile } from "@/lib/data/schemas";
import { factParts } from "@/lib/format";
import { FAN_LEVEL_COPY } from "@/lib/fan/profile-codec";
import { cn } from "@/lib/utils";

export const SHARE_CARD_WIDTH = 1080;
export const SHARE_CARD_HEIGHT = 1920;

/**
 * The exported card's numbers are pixel-tuned for a fixed 1080x1920 canvas,
 * so they don't use <FactValue>'s responsive (viewport-media-query) sizing —
 * an interactive, click-to-open-source button is also the wrong affordance
 * inside a static export. Every number still comes straight from the fact
 * base via factParts(getFact(id)), and every figure keeps its status mark
 * (see docs/DECISIONS.md).
 */
function ShareFact({ id }: { id: string }) {
  const fact = getFact(id);
  const p = factParts(fact);
  const inline = p.unit === "%" || p.unit === "×";
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <span className="num text-[124px] leading-[0.95] font-semibold tracking-tight text-ink">
          {p.prefix}
          {p.value}
          {inline ? p.unit : ""}
          {p.suffix}
        </span>
        {!inline && p.unit && <span className="num text-[34px] text-ink-2">{p.unit}</span>}
      </div>
      <div className="flex items-center gap-3">
        <StatusMark status={fact.status} className="size-4" />
        <span className="text-[30px] leading-snug text-ink-2">{fact.metric}</span>
      </div>
    </div>
  );
}

/**
 * Forwards its ref to the card's own root — deliberately, so an export can
 * target this node directly rather than an ancestor that carries the
 * on-screen preview's CSS `transform: scale(...)`. html-to-image reads each
 * node's own `transform`, so exporting the scaled ancestor would render the
 * card shrunk into a corner of the 1080x1920 canvas instead of filling it.
 */
export const ShareCard = forwardRef<HTMLDivElement, {
  profile: FanProfile;
  factIds: string[];
  /** Citation-stripped caption text, or null while it's still loading. */
  caption: string | null;
  raceLabel: string;
  className?: string;
}>(function ShareCard({ profile, factIds, caption, raceLabel, className }, ref) {
  const city = getCity(profile.cityId);
  const sourcesUsed = new Map<string, number[]>();
  for (const id of factIds) {
    const f = getFact(id);
    if (f.sourceId && f.page) {
      const pages = sourcesUsed.get(f.sourceId) ?? [];
      if (!pages.includes(f.page)) pages.push(f.page);
      sourcesUsed.set(f.sourceId, pages);
    }
  }
  const sourceLine = [...sourcesUsed.entries()]
    .map(([sid, pages]) => `${getSource(sid).title}, p.${pages.sort((a, b) => a - b).join(", ")}`)
    .join(" · ");

  return (
    <div
      ref={ref}
      className={cn("relative flex flex-col justify-between overflow-hidden bg-racing px-20 py-24 text-ink", className)}
      style={{ width: SHARE_CARD_WIDTH, height: SHARE_CARD_HEIGHT }}
    >
      <div className="flex flex-col gap-6">
        <p className="label text-[30px] tracking-[0.12em] text-lime">Impact Lap</p>
        <h1 className="display text-[104px] leading-[0.9]">
          Your weekend
          <br />
          in impact
        </h1>
        <p className="label text-[26px] text-ink-2">{raceLabel}</p>
      </div>

      <div className="flex flex-col gap-14">
        {factIds.map((id) => (
          <ShareFact key={id} id={id} />
        ))}
      </div>

      <div className="flex flex-col gap-8 border-t border-ink/20 pt-10">
        <div className="flex min-h-[120px] flex-col gap-4">
          {caption && <p className="max-w-[820px] text-[32px] leading-snug text-ink">{caption}</p>}
          <span className="label inline-flex items-center gap-2 text-verified">
            <Check className="size-5" strokeWidth={3} /> Verified
          </span>
        </div>
        <div className="flex items-center justify-between text-[24px] text-ink-3">
          <span>
            {FAN_LEVEL_COPY[profile.level].label} · {city?.name ?? profile.cityId}
          </span>
          {sourceLine && <span className="text-right">{sourceLine}</span>}
        </div>
      </div>
    </div>
  );
});
