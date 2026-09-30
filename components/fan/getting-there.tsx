import Link from "next/link";
import type { Race } from "@/lib/data/schemas";
import { destinationName, type TripInput } from "@/lib/fan/trip";
import { SectionHead } from "./section-head";
import { SourceButton } from "./source-button";
import { TripPlanner } from "./trip-planner";

/** "#getting-there": a green chapter with the honest context on the left and the planner on the right. */
export function GettingThere({ race, initial }: { race: Race; initial: TripInput }) {
  return (
    <section aria-labelledby="getting-there-title" id="getting-there" data-tone="green" className="scroll-mt-14">
      <div className="wrap grid gap-10 py-[clamp(64px,10vw,128px)] lg:grid-cols-12 lg:gap-6">
        <div className="flex flex-col gap-8 lg:col-span-4">
          <SectionHead
            id="getting-there-title"
            kicker="Getting there"
            title={`The easy way to ${destinationName(race)}`}
            dek="Pick how you'll travel and see how it compares with a taxi or driving alone."
          />
          <div className="flex flex-col gap-5 border-t border-line pt-6 font-serif text-[1.0625rem] leading-[1.45] text-ink sm:text-lg">
            <p>
              Your trip isn&apos;t part of the team&apos;s reported footprint. Its carbon inventory counts the team&apos;s own suppliers,
              freight, waste, business travel and staff commuting.{" "}
              <SourceButton id="g25-scope3-boundary" className="font-sans" />
            </p>
            <p>
              The bigger story is the team&apos;s own freight: cars, parts and garage kit flown and shipped between rounds.{" "}
              <Link href="/#moving" className="link font-sans text-[0.9375rem]">
                Read how the team moves →
              </Link>
            </p>
          </div>
        </div>
        <div className="lg:col-span-8 lg:col-start-5 xl:col-span-7 xl:col-start-6">
          <TripPlanner race={race} initial={initial} />
        </div>
      </div>
    </section>
  );
}
