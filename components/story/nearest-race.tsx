"use client";

/**
 * The optional "Nearest race" choice and the few places it shows. The story
 * itself is the same for everyone; the choice only changes which race page
 * the circuit and community chapters and the ending point to. It never
 * reaches generated copy (lib/ai/requests.ts pins the city).
 */
import Link from "next/link";
import { useId } from "react";
import { heroRace } from "@/lib/data/load";
import type { Race } from "@/lib/data/schemas";
import { nearestRaceLabel, nearestRaceOptions } from "@/lib/fan/nearest-race";
import { isUpcoming, raceProgrammes, raceTitle } from "@/lib/fan/race";
import { useNearestRace } from "@/lib/fan/use-nearest-race";
import { cn } from "@/lib/utils";

const OPTIONS = nearestRaceOptions();
const COMING_UP = OPTIONS.filter((r) => isUpcoming(r));
// Past rounds alphabetically, so a fan can find the race nearest them by name.
const PAST = OPTIONS.filter((r) => !isUpcoming(r)).sort((a, b) => raceTitle(a).localeCompare(raceTitle(b)));

/** A native select beside the depth toggle on the title page. Optional: it defaults to Singapore and never blocks the story. */
export function NearestRacePicker({ className }: { className?: string }) {
  const { race, setRace } = useNearestRace();
  const id = useId();
  const chosen = race.id !== heroRace.id;
  return (
    <div className={cn("flex flex-col items-start gap-2 sm:items-center", className)}>
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
        <label htmlFor={id} className="kicker text-ink-3">
          Nearest race
        </label>
        <select
          id={id}
          value={race.id}
          onChange={(e) => setRace(e.target.value)}
          aria-describedby={`${id}-hint`}
          className="h-12 max-w-full rounded-md border border-line-strong bg-card px-3 font-sans text-[0.9375rem] font-medium text-ink focus-visible:border-ink"
        >
          <optgroup label="This season">
            {COMING_UP.map((r) => (
              <option key={r.id} value={r.id}>
                {nearestRaceLabel(r)}
              </option>
            ))}
          </optgroup>
          <optgroup label="Past races: what the team published">
            {PAST.map((r) => (
              <option key={r.id} value={r.id}>
                {nearestRaceLabel(r)}
              </option>
            ))}
          </optgroup>
        </select>
        <span id={`${id}-hint`} className="sr-only">
          Optional. Marks that race in the story and links to its page.
        </span>
      </div>
      {/* Answer the choice where it was made, so it never looks as if nothing happened. */}
      <p aria-live="polite" className="font-sans text-[0.9375rem] text-ink-2">
        {chosen && (
          <>
            Your race is marked as you scroll.{" "}
            <Link href={`/weekend/${race.id}`} className="link font-semibold text-ink">
              What the team published for the {raceTitle(race)} →
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function nearestKicker(race: Race): string {
  return isUpcoming(race) ? "Your nearest race" : `Your nearest race · past race, ${race.season}`;
}

/**
 * One line at the end of a chapter pointing to the chosen race page: what
 * was published there (circuit chapter) or the programmes linked to it
 * (community chapter, only when the reports link any).
 */
export function NearestRaceLink({ section }: { section: "published" | "take-part" }) {
  const { race } = useNearestRace();
  if (section === "take-part" && !raceProgrammes(race).some((p) => p.where !== "online")) return null;
  const text =
    section === "published"
      ? `What the team published for the ${raceTitle(race)}`
      : `Programmes linked to the ${raceTitle(race)}`;
  return (
    <p className="flex flex-col gap-1">
      <span className="kicker text-ink-3">{nearestKicker(race)}</span>
      <Link href={`/weekend/${race.id}#${section}`} className="link font-sans text-base font-semibold">
        {text} →
      </Link>
    </p>
  );
}

/** The ending's heading: "your" race weekend unless the fan chose another race. */
export function RaceWeekendHeading({ heroId, mine, next }: { heroId: string; mine: string; next: string }) {
  const { race } = useNearestRace();
  return <>{race.id === heroId ? mine : next}</>;
}

/** In the ending, a pointer to the fan's chosen race when it isn't the race weekend shown. */
export function NearestRaceNote({ heroId }: { heroId: string }) {
  const { race } = useNearestRace();
  if (race.id === heroId) return null;
  return (
    <div className="mt-8 flex max-w-[60ch] flex-col gap-1 border-l-2 border-highlight pl-4">
      <p className="kicker text-ink-3">{nearestKicker(race)}</p>
      <Link href={`/weekend/${race.id}`} className="link font-serif text-xl leading-snug">
        What the team published for the {raceTitle(race)} →
      </Link>
    </div>
  );
}
