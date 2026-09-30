import { ArrowRight, Check, FileSearch, Globe2, Route } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AiPipeline } from "@/components/landing/ai-pipeline";
import { HeroScene } from "@/components/landing/hero-scene";
import { JourneyPreview } from "@/components/landing/journey-preview";
import { StatusLegend } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";

const trustPoints = [
  "Published facts stay attached to their source page.",
  "Estimates show their formula and assumptions.",
  "Generated wording is checked against its citations.",
  "Missing regional data is shown as a gap.",
];

export default function Home() {
  return (
    <main className="overflow-x-clip">
      <HeroScene />
      <JourneyPreview />
      <AiPipeline />

      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid w-full max-w-[1600px] lg:grid-cols-[minmax(0,1.08fr)_minmax(24rem,0.92fr)]">
          <div className="relative min-h-[30rem] overflow-hidden border-b border-line sm:min-h-[42rem] lg:border-r lg:border-b-0">
            <Image
              src="/brand/amr26-launch-front.jpg"
              alt="Aston Martin Aramco Formula One car viewed from above"
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover object-center"
            />
            <div className="absolute top-0 left-0 bg-bg px-4 py-3 sm:px-6">
              <p className="label text-lime">Trust is part of the interface</p>
            </div>
          </div>

          <div className="flex flex-col justify-center px-4 py-14 sm:px-8 sm:py-20 lg:px-10">
            <p className="label">Scrutineering for every claim</p>
            <h2 className="display mt-4 max-w-[10ch] text-[clamp(3.3rem,6.5vw,6.8rem)]">See why you can trust it.</h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
              Impact data should be as open to inspection as the car. Select any figure to see where it came from and how it was
              treated.
            </p>
            <ul className="mt-9 border-t border-line">
              {trustPoints.map((point) => (
                <li key={point} className="flex gap-3 border-b border-line py-4 text-sm text-ink-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
            <StatusLegend className="mt-8" />
            <Link
              href="/sources"
              className="mt-7 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold underline decoration-line-strong underline-offset-4 hover:decoration-lime"
            >
              Inspect the evidence base <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-bg">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-14 sm:px-6 sm:py-20 lg:px-10 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="label text-lime">Choose your route</p>
              <h2 className="display mt-4 max-w-[9ch] text-[clamp(3.5rem,7vw,7rem)]">Open to every fan.</h2>
            </div>
            <p className="max-w-2xl self-end text-lg leading-relaxed text-ink-2">
              Enter the full story immediately. Personalisation can bring a nearby race and relevant topics forward. The knowledge
              challenge waits until after the learning experience.
            </p>
          </div>

          <div className="mt-12 grid border border-line md:grid-cols-3">
            <Link href="/lap" className="group flex min-h-64 flex-col border-b border-line bg-surface p-5 transition-colors hover:bg-surface-2 md:border-r md:border-b-0 sm:p-7">
              <Route className="size-5 text-lime" aria-hidden />
              <p className="label mt-12">Main experience</p>
              <h3 className="mt-3 text-2xl font-semibold">Follow the car</h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-2">Start at the factory and move through the whole impact story.</p>
              <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-lime">
                Enter the story <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
            <Link href="/start" className="group flex min-h-64 flex-col border-b border-line bg-surface p-5 transition-colors hover:bg-surface-2 md:border-r md:border-b-0 sm:p-7">
              <Globe2 className="size-5 text-lime" aria-hidden />
              <p className="label mt-12">Optional personalisation</p>
              <h3 className="mt-3 text-2xl font-semibold">Make it relevant</h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-2">Choose a home city and interests to change emphasis and explanation depth.</p>
              <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-lime">
                Shape your view <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
            <Link href="/partners" className="group flex min-h-64 flex-col bg-surface p-5 transition-colors hover:bg-surface-2 sm:p-7">
              <FileSearch className="size-5 text-lime" aria-hidden />
              <p className="label mt-12">Partner view</p>
              <h3 className="mt-3 text-2xl font-semibold">Inspect the impact</h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-2">Move from the fan story to metrics, assumptions and the source trail.</p>
              <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-lime">
                Open the dashboard <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-racing">
        <Image
          src="/brand/amr26-render-rear.jpg"
          alt=""
          fill
          sizes="100vw"
          className="-z-10 object-cover object-center opacity-35"
        />
        <div className="mx-auto flex min-h-[60svh] w-full max-w-[1600px] flex-col items-start justify-end px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
          <p className="label text-lime">Your impact lap</p>
          <h2 className="display mt-4 max-w-[10ch] text-[clamp(4rem,10vw,10rem)]">The car is ready. Follow its story.</h2>
          <Button asChild size="lg" className="mt-8">
            <Link href="/lap">
              Start at the factory <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
