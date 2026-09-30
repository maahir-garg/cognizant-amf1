import type { Metadata } from "next";
import { PartnerReveal } from "@/components/partner/partner-reveal";
import { ScenarioStudio } from "@/components/partner/scenario-studio";

export const metadata: Metadata = { title: "Scenarios" };

export default function ScenariosPage() {
  return (
    <div className="flex flex-col gap-12 py-10 sm:py-14 lg:gap-16 lg:py-20">
      <header className="grid gap-8 border-b border-line pb-12 lg:grid-cols-[0.9fr_1.1fr] lg:pb-16">
        <div>
          <p className="label">Decision scenarios</p>
          <h1 className="display mt-4 max-w-3xl text-4xl sm:text-6xl lg:text-7xl">Change the inputs. Inspect the reasoning.</h1>
        </div>
        <div className="flex max-w-2xl flex-col justify-end gap-5">
          <p className="text-lg leading-relaxed text-ink-2">
            The projection uses visible arithmetic and published baselines. AI explains the result in plain language while the
            figures, formula and assumptions stay open for inspection.
          </p>
          <p className="label border-l-2 border-l-estimated pl-3 text-ink-2">Scenario outputs are estimates, not forecasts</p>
        </div>
      </header>
      <PartnerReveal>
        <ScenarioStudio />
      </PartnerReveal>
    </div>
  );
}
