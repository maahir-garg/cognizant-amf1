"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { cities, getCity, sourceShortName, travelModes } from "@/lib/data/load";
import type { Race } from "@/lib/data/schemas";
import { useTripPlan } from "@/lib/fan/storage";
import { clampKm, destinationName, formatKg, modeLabel, TRIP_KM_MAX, TRIP_KM_MIN, tripResult, type TripInput } from "@/lib/fan/trip";
import { cn } from "@/lib/utils";

const FIELD = "h-12 w-full rounded-md border border-line-strong bg-card px-3 font-sans text-base text-ink";

/**
 * Home city, distance and mode in; a comparison with a taxi and with driving
 * alone out. A plain GET form, so the server renders the same result
 * without JavaScript; with it, the result follows every change.
 */
export function TripPlanner({ race, initial }: { race: Race; initial: TripInput }) {
  const [input, setInput] = useState<TripInput>(initial);
  const [kmText, setKmText] = useState(String(initial.km));
  const [, setPlan] = useTripPlan();
  const result = tripResult(input, race);
  const dest = destinationName(race);
  const home = getCity(input.cityId);
  const visiting = input.cityId !== race.cityId;
  const action = `/weekend/${race.id}#getting-there`;

  // The share card reads the plan from here.
  useEffect(() => {
    setPlan({ raceId: race.id, cityId: input.cityId, modeId: input.modeId, km: input.km });
  }, [race.id, input, setPlan]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new URLSearchParams({ city: input.cityId, km: String(input.km), mode: input.modeId });
    window.history.replaceState(null, "", `/weekend/${race.id}?${q.toString()}#getting-there`);
  }

  return (
    <div data-tone="paper" className="flex flex-col rounded-md border border-line-strong bg-card text-ink">
      <form method="get" action={action} onSubmit={onSubmit} className="flex flex-col gap-6 p-5 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="trip-city" className="font-sans text-[0.9375rem] font-semibold text-ink">
              Where you&apos;re coming from
            </label>
            <select
              id="trip-city"
              name="city"
              value={input.cityId}
              onChange={(e) => setInput((s) => ({ ...s, cityId: e.target.value }))}
              className={FIELD}
            >
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.name !== c.country ? `, ${c.country}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="trip-km" className="font-sans text-[0.9375rem] font-semibold text-ink">
              Distance to {dest}, one way (km)
            </label>
            <input
              id="trip-km"
              name="km"
              type="number"
              inputMode="numeric"
              min={TRIP_KM_MIN}
              max={TRIP_KM_MAX}
              step={1}
              value={kmText}
              onChange={(e) => {
                setKmText(e.target.value);
                const n = Number(e.target.value);
                if (Number.isFinite(n) && n > 0) setInput((s) => ({ ...s, km: clampKm(n) }));
              }}
              onBlur={() => setKmText(String(input.km))}
              className={cn(FIELD, "num")}
            />
          </div>
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 font-sans text-[0.9375rem] font-semibold text-ink">How you&apos;ll get there</legend>
          <div className="flex flex-wrap gap-2">
            {travelModes.map((m) => (
              // Selected styling comes from :checked, so it also works before (or without) JavaScript.
              <label
                key={m.id}
                className="group relative flex min-h-12 cursor-pointer items-center rounded-md border border-line-strong px-3 py-2 font-sans text-base font-medium text-ink transition-colors hover:bg-paper-2 has-[:checked]:border-2 has-[:checked]:border-ink has-[:checked]:bg-lime-tint has-[:checked]:px-[11px] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus"
              >
                <input
                  type="radio"
                  name="mode"
                  value={m.id}
                  checked={m.id === input.modeId}
                  onChange={() => setInput((s) => ({ ...s, modeId: m.id }))}
                  className="sr-only"
                />
                <span>
                  <span aria-hidden className="hidden group-has-[:checked]:inline">
                    ✓{" "}
                  </span>
                  {modeLabel(m, race)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <Button type="submit" variant="outline" size="lg">
            Compare
          </Button>
        </div>
      </form>

      <div aria-live="polite" className="flex flex-col gap-4 border-t border-line p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="kicker">Your trip, compared</p>
          <StatusBadge status="estimated" />
        </div>
        <p className="font-serif text-[clamp(1.625rem,1.3rem+1.2vw,2.25rem)] leading-[1.12] font-medium text-ink">{result.lead}</p>
        {result.secondary && <p className="font-serif text-xl leading-snug text-ink-2">{result.secondary}</p>}
        <p className="font-sans text-[0.9375rem] text-ink-2">
          {result.label}, per passenger, for the same distance.
          {result.kg > 0 && (
            <>
              {" "}
              <span className="num text-ink">About {formatKg(result.kg)} kg CO₂e</span> for the return trip.
            </>
          )}
        </p>
        {visiting && home && (
          <p className="font-sans text-[0.9375rem] text-ink-2">
            Coming from {home.name}? The journey to {race.country} isn&apos;t included: this compares the ride from where you stay to{" "}
            {dest}.
          </p>
        )}
        <details className="group">
          <summary className="w-fit cursor-pointer font-sans text-[0.8125rem] text-ink-3 underline decoration-1 underline-offset-[3px] hover:text-ink">
            How this is worked out
          </summary>
          <div className="mt-3 flex flex-col gap-3 font-sans text-[0.8125rem] leading-snug text-ink-2">
            <p>
              Estimated with {sourceShortName("defra-2025")} UK conversion factors per passenger-km, used as proxies for travel in{" "}
              {race.country}. The comparison doesn&apos;t depend on distance; the kilograms do.
            </p>
            <ul className="flex flex-col gap-1.5">
              {travelModes.map((m) => (
                <li key={m.id}>
                  <span className="font-semibold text-ink">{modeLabel(m, race)}:</span>{" "}
                  <span className="num">{m.kgCO2ePerPassengerKm} kg CO₂e per passenger-km</span>. {m.notes}
                </li>
              ))}
            </ul>
          </div>
        </details>
        <div className="border-t border-line pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={`/share?mode=${input.modeId}`}>Put this plan on your card →</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
