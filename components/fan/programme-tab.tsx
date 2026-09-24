"use client";

import { Check, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { CREDIT_TIERS, nextTier, tierFor } from "@/lib/fan/credits";
import { useCredits } from "@/lib/fan/profile";
import { cn } from "@/lib/utils";

/** A6: simulated impact-credit balance and the tiers it unlocks. */
export function ProgrammeTab() {
  const { total, history, reset } = useCredits();
  const current = tierFor(total);
  const next = nextTier(total);
  const progress = next ? Math.min(100, (total / next.threshold) * 100) : 100;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="label">Impact credits</p>
          <StatusBadge status="simulated" />
        </div>
        <p className="num text-6xl font-semibold text-ink">{total}</p>
        <p className="text-sm text-ink-2">
          Currently <span className="font-medium text-ink">{current.name}</span>
          {next && (
            <>
              {" "}
              · <span className="num">{Math.max(0, next.threshold - total)}</span> to {next.name}
            </>
          )}
        </p>
        <Progress value={progress} />
      </div>

      <div className="flex flex-col gap-2">
        <p className="label">Tiers</p>
        <div className="flex flex-col divide-y divide-line rounded-md border border-line">
          {CREDIT_TIERS.map((t) => {
            const unlocked = total >= t.threshold;
            return (
              <div key={t.id} className={cn("flex items-start gap-3 p-4", !unlocked && "opacity-60")}>
                {unlocked ? <Check className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden /> : <Lock className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden />}
                <div className="flex flex-col gap-0.5">
                  <span className="flex items-baseline gap-2">
                    <span className="font-medium text-ink">{t.name}</span>
                    <span className="label">{t.threshold} credits</span>
                  </span>
                  <span className="text-sm text-ink-2">{t.unlocks}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {history.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="label">Recent activity</p>
          <ul className="flex flex-col gap-1.5 text-sm text-ink-2">
            {history.slice(0, 5).map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-3">
                <span>{h.reason}</span>
                <span className="num shrink-0 text-ink">+{h.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button variant="outline" onClick={reset} className="w-full sm:w-auto">
        Reset credits
      </Button>
    </div>
  );
}
