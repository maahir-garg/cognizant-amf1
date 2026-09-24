import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { FactValue } from "@/components/shared/fact-value";
import { StatusLegend } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/config";
import { facts, heroRace } from "@/lib/data/load";
import { formatDate } from "@/lib/format";

export default function Home() {
  const verified = facts.filter((f) => f.status === "verified").length;
  const estimated = facts.filter((f) => f.status === "estimated").length;
  const flagged = facts.filter((f) => f.flags.length > 0).length;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col px-4 sm:px-6">
      <section className="grid gap-10 py-12 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div className="flex flex-col gap-6">
          <p className="label">
            {heroRace.name} · {heroRace.start && heroRace.end && `${formatDate(heroRace.start)} – ${formatDate(heroRace.end)}`}
          </p>
          <h1 className="display text-[clamp(3.5rem,11vw,9rem)]">
            Impact,
            <br />
            lap by lap.
          </h1>
          <p className="max-w-xl text-lg text-ink-2">
            {APP_NAME} turns Aston Martin Aramco&apos;s published sustainability, inclusion and community data into a view fans can
            feel and partners can trust. Every number shows where it came from.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/start">
                Start your lap <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/partners">Partner dashboard</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line">
          <div className="min-w-0 bg-surface p-4 sm:p-5">
            <FactValue id="e25-travel-logistics-cut" size="lg" showMetric label="Cut in travel and logistics emissions, 2025" />
          </div>
          <div className="min-w-0 bg-surface p-4 sm:p-5">
            <FactValue id="e25-saf-avoided" size="lg" showMetric label="Air-freight CO₂e avoided with SAF" />
          </div>
          <div className="min-w-0 bg-surface p-4 sm:p-5">
            <FactValue id="c25-mam-day-students" size="lg" showMetric label="Students at Make A Mark Day 2025" />
          </div>
          <div className="min-w-0 bg-surface p-4 sm:p-5">
            <FactValue id="c25-charity-2025" size="lg" showMetric label="Raised for charity in 2025" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 border-t border-line py-10 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <p className="label">How to read the numbers</p>
          <StatusLegend />
        </div>
        <p className="text-sm text-ink-2 md:col-span-2">
          <span className="num text-ink">{verified}</span> facts are quoted from the team&apos;s reports with page references and checked
          automatically. <span className="num text-ink">{estimated}</span> are calculated from those, with the formula shown.{" "}
          <span className="num text-ink">{flagged}</span> carry data-quality flags where the reports disagree with themselves.{" "}
          <Link href="/sources" className="text-lime underline-offset-4 hover:underline">
            Browse every source
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
