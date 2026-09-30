import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CarbonLogistics, ChangeVsEarlier } from "@/components/fan/carbon-logistics";
import { DataGapCard, OwnTracksideCard } from "@/components/fan/data-gap-card";
import { MatchedInitiatives } from "@/components/fan/matched-initiatives";
import { races } from "@/lib/data/load";
import { decodeProfile } from "@/lib/fan/profile-codec";

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
  const raceName = race.name.replace(/\s20\d{2}$/, "");

  return (
    <div className="overflow-x-clip">
      <header className="relative flex min-h-[75vh] flex-col justify-end overflow-hidden border-b border-line bg-surface">
        <Image
          src="/brand/amr26-render-rear.jpg"
          alt="Aston Martin Aramco race car seen from behind"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-bg/45" aria-hidden />
        <div className="relative mx-auto flex w-full max-w-[1440px] flex-col items-start gap-6 px-4 py-12 sm:px-6 sm:py-20">
          <Link href="/" className="label text-ink underline underline-offset-4 hover:text-link">
            ← Back to the car story
          </Link>
          <p className="label text-link">At the circuit</p>
          <h1 className="font-serif font-medium leading-[1.05] tracking-tight max-w-5xl text-[clamp(3.3rem,9vw,8rem)]">{raceName}</h1>
          {race.circuit && <p className="text-lg text-ink">{race.circuit}</p>}
          <p className="max-w-2xl text-ink-2">
            See what the team publishes about moving to a race, what can only be estimated, and where local evidence is missing.
          </p>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-4 py-16 sm:px-6 sm:py-24">
        <CarbonLogistics />
        <ChangeVsEarlier />

        {hasOwnTrackside ? <OwnTracksideCard raceId={race.id} raceName={raceName} /> : <DataGapCard raceName={raceName} />}

        <section className="flex flex-col gap-6 border-t border-line pt-10">
          <p className="label">Beyond the circuit</p>
          <h2 className="font-serif font-medium leading-[1.05] tracking-tight text-[clamp(2.5rem,6vw,5rem)]">The people around the race</h2>
          <MatchedInitiatives paramProfile={paramProfile} />
        </section>
      </div>
    </div>
  );
}
