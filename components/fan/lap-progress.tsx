import { cn } from "@/lib/utils";
import type { LapStep } from "@/lib/fan/lap";

export function LapProgress({ steps, current }: { steps: LapStep[]; current: number }) {
  return (
    <div className="flex gap-1" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={current + 1}>
      {steps.map((_, i) => (
        <span key={i} aria-hidden className={cn("h-1 flex-1 rounded-full transition-colors", i <= current ? "bg-lime" : "bg-line")} />
      ))}
    </div>
  );
}
