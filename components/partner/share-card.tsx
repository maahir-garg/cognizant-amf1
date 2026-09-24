import { forwardRef } from "react";
import { StatusMark } from "@/components/shared/status-badge";
import type { Fact } from "@/lib/data/schemas";
import { formatFact } from "@/lib/format";

/**
 * 4:5 (1080x1350) share card. Sized by the parent (an exact-pixel wrapper
 * that is visually scaled down for the on-screen preview); this component
 * itself just fills that box. Racing-green ground, big display type, at
 * most two figures, status marks kept, a source line at the bottom.
 */
export const ShareCard = forwardRef<HTMLDivElement, { initiativeName: string; facts: Fact[]; sourceTitle?: string }>(
  function ShareCard({ initiativeName, facts, sourceTitle }, ref) {
    return (
      <div ref={ref} className="flex h-full w-full flex-col justify-between bg-racing p-16">
        <p className="label text-lime">Impact Lap · Cognizant × Aston Martin Aramco</p>

        <div className="flex flex-col gap-10">
          <h2 className="display text-6xl leading-[1.05] text-ink">{initiativeName}</h2>

          {facts.length > 0 ? (
            <div className="flex flex-col gap-8">
              {facts.map((f) => (
                <div key={f.id} className="flex flex-col gap-2">
                  <span className="num text-5xl font-semibold text-ink">{f.value === null ? f.valueText : formatFact(f)}</span>
                  <span className="flex items-center gap-2 text-xl text-ink-2">
                    <StatusMark status={f.status} className="size-3" /> {f.metric}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="label text-simulated">Data gap</span>
              <p className="text-xl text-ink-2">No individual figure is published for this initiative yet.</p>
            </div>
          )}
        </div>

        <p className="text-lg text-ink-3">{sourceTitle ? `Source: ${sourceTitle}` : "Source: Aston Martin Aramco impact report"}</p>
      </div>
    );
  },
);
