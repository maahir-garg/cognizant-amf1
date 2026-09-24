"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { StatusBadge } from "@/components/shared/status-badge";
import { compareTrips, formatCount } from "@/lib/data/equivalents";
import { CREDIT_RULE_COPY, creditsForSaving } from "@/lib/fan/credits";
import { useCredits } from "@/lib/fan/profile";
import { cn } from "@/lib/utils";

/** A6: pick a way to the circuit; a lower-carbon choice than driving earns simulated impact credits. */
export function GetToCircuitTab() {
  const [km, setKm] = useState(10);
  const [modeId, setModeId] = useState<string | null>(null);
  const { addCredits } = useCredits();
  const trips = compareTrips(km);
  const selected = trips.find((t) => t.mode.id === modeId);

  function logTrip() {
    if (!selected) return;
    const earned = creditsForSaving(selected.savingVsCarKg);
    if (earned > 0) {
      addCredits(earned, `${selected.mode.label}, ${km}km round trip to the circuit`);
      toast.success(`+${earned} impact credit${earned === 1 ? "" : "s"} logged`, { description: "Simulated — see Your programme." });
    } else {
      toast("Logged, but no credits this time.", { description: "Pick something lower-carbon than driving to earn credits." });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <label htmlFor="km-slider" className="label">
            Distance to the circuit
          </label>
          <span className="num text-sm text-ink">{km}km one way</span>
        </div>
        {/* `role="slider"` is a <span>, not a labelable element, so `<label for>` alone
            doesn't give it an accessible name even though the ids match — pass one directly. */}
        <Slider
          id="km-slider"
          aria-label="Distance to the circuit"
          min={1}
          max={40}
          step={1}
          value={[km]}
          onValueChange={([v]) => setKm(v)}
        />
      </div>

      <div className="flex flex-col divide-y divide-line rounded-md border border-line">
        {trips.map((t) => (
          <button
            key={t.mode.id}
            type="button"
            aria-pressed={modeId === t.mode.id}
            onClick={() => setModeId(t.mode.id)}
            className={cn(
              "flex min-h-14 items-center justify-between gap-3 px-4 py-3 text-left transition-colors",
              modeId === t.mode.id ? "bg-surface-2" : "hover:bg-surface",
            )}
          >
            <span className="flex flex-col gap-0.5">
              <span className="font-medium text-ink">{t.mode.label}</span>
              <span className="text-xs text-ink-3">{t.mode.notes}</span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1">
              <span className="num text-sm text-ink">{formatCount(t.kgCO2e)} kg CO₂e</span>
              <StatusBadge status={t.mode.status} compact />
            </span>
          </button>
        ))}
      </div>

      <p className="text-xs text-ink-3">{CREDIT_RULE_COPY}</p>

      <Button size="lg" disabled={!selected} onClick={logTrip} className="w-full sm:w-auto">
        Log this trip
      </Button>
    </div>
  );
}
