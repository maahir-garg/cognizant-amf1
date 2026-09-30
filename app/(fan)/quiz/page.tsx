import type { Metadata } from "next";
import Link from "next/link";
import { QuickCheck } from "@/components/fan/quick-check";
import { heroRace } from "@/lib/data/load";
import type { Depth } from "@/lib/fan/quiz";
import { raceShortName } from "@/lib/fan/race";

export const metadata: Metadata = {
  title: "Quick check",
  description: "A few questions on the team's published figures, each revealing the exact number and the page it comes from.",
};

export default async function QuizPage({ searchParams }: { searchParams: Promise<{ depth?: string }> }) {
  const { depth } = await searchParams;
  const override: Depth | undefined = depth === "watched" || depth === "new" ? depth : undefined;
  return (
    <div className="wrap grid gap-10 py-10 sm:py-14 lg:grid-cols-12 lg:gap-6 lg:py-20">
      <div className="flex flex-col gap-4 lg:col-span-3">
        <Link href={`/weekend/${heroRace.id}`} className="kicker w-fit text-ink-3 underline decoration-1 underline-offset-[3px] hover:text-ink">
          ← {raceShortName(heroRace)} race page
        </Link>
        <p className="kicker kicker-rule mt-4">{raceShortName(heroRace)} race week</p>
      </div>
      <div className="lg:col-span-8 lg:col-start-5 xl:col-span-7">
        <QuickCheck depthOverride={override} headingLevel="h1" />
      </div>
    </div>
  );
}
