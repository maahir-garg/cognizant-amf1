import type { Metadata } from "next";
import { ScenarioStudio } from "@/components/partner/scenario-studio";

export const metadata: Metadata = { title: "Scenarios" };

export default function ScenariosPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="label">What-if scenarios</p>
        <h1 className="display text-3xl sm:text-5xl">Model next season, from today&apos;s baselines.</h1>
        <p className="max-w-2xl text-ink-2">
          Every projection is a lever multiplied by a verified per-unit baseline: no elasticities, no invented costs. Move
          the sliders to see the formula, the input facts and the model&apos;s own stated limits.
        </p>
      </header>
      <ScenarioStudio />
    </div>
  );
}
