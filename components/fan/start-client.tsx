"use client";

import { ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
import { previewLap } from "@/lib/fan/lap";
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
  const preview = useMemo(() => {
    if (!ready || !level || !cityId) return null;
    return previewLap({ level, cityId, interests });
  }, [ready, level, cityId, interests]);

  function toggleInterest(i: Interest) {
    setInterests((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));
  }

  function start() {
    if (!level || !cityId || interests.length === 0) return;
    setProfile({ level, cityId, interests });
    router.push("/lap");
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-16">
      <div className="flex flex-col gap-3">
        <p className="label">Before lights out</p>
        <h1 className="display text-[clamp(2.75rem,10vw,4.5rem)]">Set up your lap</h1>
        <p className="text-ink-2">Three quick picks. Takes about thirty seconds, and shapes everything that follows.</p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="label">1 · How much F1 do you follow?</h2>
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
        <h2 className="label">2 · Where do you watch from?</h2>
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
        <h2 className="label">3 · What do you want more of? (pick at least one)</h2>
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
          {preview ? (
            <>
              Your lap: <span className="num text-ink">{preview.sectorCount}</span> sectors ·{" "}
              <span className="num text-ink">{preview.quizCount}</span> quiz beats
            </>
          ) : (
            "Pick a level, a city and at least one interest to preview your lap."
          )}
        </p>
        <Button size="lg" disabled={!ready} onClick={start} className="w-full sm:w-auto">
          Start your lap <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
