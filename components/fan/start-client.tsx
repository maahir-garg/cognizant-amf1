"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cities } from "@/lib/data/load";
import { FAN_LEVELS, type FanLevel, type FanProfile, type Interest } from "@/lib/data/schemas";
import { ALL_INTERESTS, FAN_LEVEL_COPY, INTEREST_COPY } from "@/lib/fan/profile-codec";
import { useFanProfile } from "@/lib/fan/profile";
import { cn } from "@/lib/utils";

export function StartClient({ paramProfile }: { paramProfile: FanProfile | null }) {
  const router = useRouter();
  const { profile: savedProfile, setProfile } = useFanProfile();
  const initial = paramProfile ?? savedProfile;

  // A demo link (?p=) is available on first render (a server-rendered prop),
  // so a lazy initial value is enough to prefill the form — no effect needed.
  const [level, setLevel] = useState<FanLevel | null>(initial?.level ?? null);
  const [cityId, setCityId] = useState<string | null>(initial?.cityId ?? null);
  const [interests, setInterests] = useState<Interest[]>(initial?.interests ?? []);

  const ready = Boolean(level && cityId && interests.length > 0);
  function toggleInterest(i: Interest) {
    setInterests((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));
  }

  function start() {
    if (!level || !cityId || interests.length === 0) return;
    setProfile({ level, cityId, interests });
    router.push("/lap");
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-12 px-4 py-10 sm:px-6 sm:py-16">
      <div className="flex flex-col items-start gap-4 border-b border-line pb-10">
        <p className="label">Your view</p>
        <h1 className="display text-[clamp(2.75rem,10vw,5rem)]">Explore first. Personalise if useful.</h1>
        <p className="max-w-xl text-lg leading-relaxed text-ink-2">
          The full car journey is open now. You can add a few preferences to change the level of detail and local emphasis; every ESG topic remains visible.
        </p>
        <Button asChild size="lg">
          <Link href="/lap">
            Explore the car journey <ArrowRight />
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <p className="label">Optional personalisation</p>
        <h2 className="display text-3xl sm:text-4xl">Tune the commentary</h2>
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="label">How closely do you follow Formula One?</h3>
        <div className="flex flex-col gap-2">
          {FAN_LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={level === l}
              onClick={() => setLevel(l)}
              className={cn(
                "flex min-h-11 items-start justify-between gap-3 rounded-md border px-4 py-3 text-left transition-colors",
                level === l ? "border-lime bg-surface-2" : "border-line hover:border-line-strong",
              )}
            >
              <span className="flex flex-col gap-0.5">
                <span className="font-semibold text-ink">{FAN_LEVEL_COPY[l].label}</span>
                <span className="text-sm text-ink-2">{FAN_LEVEL_COPY[l].description}</span>
              </span>
              {level === l && <Check className="mt-1 size-4 shrink-0 text-lime" aria-hidden />}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="label">Where do you watch from?</h3>
        <Select value={cityId ?? undefined} onValueChange={setCityId}>
          <SelectTrigger className="h-11 w-full text-base" aria-label="Home city">
            <SelectValue placeholder="Choose your city" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}, {c.country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="label">What would you like emphasised?</h3>
        <div className="flex flex-wrap gap-2">
          {ALL_INTERESTS.map((i) => (
            <button
              key={i}
              type="button"
              aria-pressed={interests.includes(i)}
              onClick={() => toggleInterest(i)}
              className={cn(
                "min-h-11 rounded-full border px-4 text-sm font-medium transition-colors",
                interests.includes(i) ? "border-lime bg-lime text-lime-ink" : "border-line text-ink-2 hover:border-line-strong hover:text-ink",
              )}
            >
              {INTEREST_COPY[i]}
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-4 border-t border-line pt-6">
        <p className="min-h-4 text-sm text-ink-2" aria-live="polite">
          {ready ? "Your preferences are ready." : "Choose each preference to save a personalised view."}
        </p>
        <Button size="lg" disabled={!ready} onClick={start} className="w-full sm:w-auto">
          Save and explore <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
