import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CardTeaser } from "@/components/fan/card-teaser";
import { GettingThere } from "@/components/fan/getting-there";
import { OtherRaces } from "@/components/fan/other-races";
import { ProgrammeList } from "@/components/fan/programme-list";
import { QuickCheck } from "@/components/fan/quick-check";
import { RaceHeader, type RaceSection } from "@/components/fan/race-header";
import { RacePublished } from "@/components/fan/race-published";
import { SeasonContext } from "@/components/fan/season-context";
import { heroRace, races } from "@/lib/data/load";
import { isUpcoming, raceTitle } from "@/lib/fan/race";
import { parseTripParams } from "@/lib/fan/trip";

export function generateStaticParams() {
  return races.map((r) => ({ slug: r.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const race = races.find((r) => r.id === slug);
  return {
    title: race ? `${raceTitle(race)} ${race.season}` : "Race weekend",
    description: race ? `What Aston Martin Aramco has published for the ${raceTitle(race)}, with every figure sourced.` : undefined,
  };
}

export default async function WeekendPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const race = races.find((r) => r.id === slug);
  if (!race) notFound();

  const upcoming = isUpcoming(race);
  const trip = parseTripParams(await searchParams);
  const sections: RaceSection[] = [
    { id: "published", label: "Published for this race" },
    { id: "take-part", label: upcoming ? "Take part" : "Programmes" },
    ...(upcoming
      ? [
          { id: "getting-there", label: "Getting there" },
          { id: "quick-check", label: "Quick check" },
        ]
      : []),
    { id: "season", label: "Season context" },
  ];

  return (
    <div className="flex flex-col">
      <RaceHeader race={race} upcoming={upcoming} sections={sections} />
      <RacePublished race={race} />
      <ProgrammeList race={race} upcoming={upcoming} />

      {upcoming ? (
        <>
          <GettingThere race={race} initial={trip} />
          <section aria-label="Quick check" id="quick-check" className="scroll-mt-14">
            <div className="wrap grid gap-10 py-[clamp(64px,10vw,128px)] lg:grid-cols-12 lg:gap-6">
              <p className="kicker kicker-rule lg:col-span-3">Quick check</p>
              <div className="lg:col-span-8 lg:col-start-5 xl:col-span-7 xl:col-start-5">
                <QuickCheck />
              </div>
            </div>
          </section>
          <CardTeaser race={race} modeId={trip.modeId} />
        </>
      ) : (
        <section aria-label="Next race" className="border-t border-line">
          <div className="wrap flex flex-col items-start gap-3 py-12">
            <p className="kicker">Next race weekend</p>
            <Link href={`/weekend/${heroRace.id}`} className="link font-serif text-2xl">
              {raceTitle(heroRace)} {heroRace.season} →
            </Link>
          </div>
        </section>
      )}

      <div className="pt-[clamp(48px,6vw,80px)]">
        <SeasonContext />
      </div>
      <OtherRaces current={race} />
    </div>
  );
}
