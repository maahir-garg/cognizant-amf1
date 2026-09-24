import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CarbonLogistics, ChangeVsEarlier } from "@/components/fan/carbon-logistics";
import { DataGapCard, OwnTracksideCard } from "@/components/fan/data-gap-card";
import { LivePanel } from "@/components/fan/live-panel";
import { MatchedInitiatives } from "@/components/fan/matched-initiatives";
import { events, races } from "@/lib/data/load";
import { decodeProfile } from "@/lib/fan/profile-codec";
import { formatDate } from "@/lib/format";

function eligibleRaces() {
  return races.filter((r) => r.hero || r.factIds.length > 0);
}

export function generateStaticParams() {
  return eligibleRaces().map((r) => ({ slug: r.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const race = races.find((r) => r.id === slug);
  return { title: race ? race.name : "Race weekend" };
}

export default async function WeekendPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ p?: string }>;
}) {
  const { slug } = await params;
  const { p } = await searchParams;
  const race = eligibleRaces().find((r) => r.id === slug);
  if (!race) notFound();

  const paramProfile = decodeProfile(p);
  const hasOwnTrackside = race.factIds.some((id) => id.startsWith("e25-trackside-"));
  const hasLiveFeed = events.some((e) => e.raceId === race.id);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14">
      <header className="flex flex-col gap-2">
        <p className="label">
          {race.season} · Round {race.round ?? "—"}
        </p>
        <h1 className="display text-[clamp(2.5rem,9vw,4.5rem)]">{race.name}</h1>
        {race.start && race.end && (
          <p className="text-ink-2">
            {formatDate(race.start)} – {formatDate(race.end)}
            {race.circuit && ` · ${race.circuit}`}
          </p>
        )}
      </header>

      <CarbonLogistics />
      <ChangeVsEarlier />

      {hasOwnTrackside ? <OwnTracksideCard raceId={race.id} raceName={race.name} /> : <DataGapCard raceName={race.name} />}

      <section className="flex flex-col gap-4 border-t border-line pt-6">
        <p className="label">Matched for you</p>
        <MatchedInitiatives paramProfile={paramProfile} />
      </section>

      {hasLiveFeed && <LivePanel raceId={race.id} />}
    </div>
  );
}
