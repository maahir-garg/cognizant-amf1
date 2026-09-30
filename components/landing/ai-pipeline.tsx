"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BookOpenText, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const transformations = [
  {
    id: "evidence",
    marker: "A",
    tab: "Published evidence",
    title: "Start with what the team has reported.",
    body: "The system can only work with facts in the checked evidence base. Each item keeps its source page, publication and trust status.",
    detail: "No source means no claim.",
    icon: BookOpenText,
  },
  {
    id: "interpretation",
    marker: "B",
    tab: "AI interpretation",
    title: "Turn the right facts into a clear explanation.",
    body: "AI selects evidence for the current part of the car’s route, adjusts the language to the fan and can bring forward a relevant regional example.",
    detail: "The model receives only the facts chosen for that explanation.",
    icon: Sparkles,
  },
  {
    id: "experience",
    marker: "C",
    tab: "Interactive story",
    title: "Keep the evidence attached to the experience.",
    body: "The explanation appears beside the car, the source status and a route back to the report. Fans can explore every theme and inspect any claim.",
    detail: "Every generated figure is checked against its citation before display.",
    icon: ShieldCheck,
  },
] as const;

export function AiPipeline() {
  const [active, setActive] = useState<(typeof transformations)[number]["id"]>("evidence");
  const reduceMotion = useReducedMotion();
  const selected = transformations.find((step) => step.id === active) ?? transformations[0];
  const SelectedIcon = selected.icon;

  return (
    <section className="border-b border-line bg-bg">
      <div className="mx-auto grid w-full max-w-[1600px] lg:grid-cols-[minmax(0,0.82fr)_minmax(32rem,1.18fr)]">
        <div className="border-b border-line px-4 py-14 sm:px-6 sm:py-20 lg:border-r lg:border-b-0 lg:px-10 lg:py-24">
          <p className="label text-lime">How AI helps</p>
          <h2 className="display mt-4 max-w-[9ch] text-[clamp(3.7rem,8vw,8rem)]">From report to race story.</h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
            AI makes published ESG evidence relevant to a fan in the moment. It chooses, explains and personalises. The source
            stays visible.
          </p>
          <div className="mt-10 flex items-start gap-3 border-l-2 border-lime pl-4">
            <MapPin className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden />
            <p className="max-w-md text-sm leading-relaxed text-ink-2">
              Region can change which local example appears first. It never removes environment, inclusion, community or governance.
            </p>
          </div>
        </div>

        <div className="flex min-h-[38rem] flex-col p-4 sm:p-6 lg:p-10">
          <div role="tablist" aria-label="How AI transforms the evidence" className="grid border border-line sm:grid-cols-3">
            {transformations.map((step) => {
              const activeStep = step.id === active;
              return (
                <button
                  key={step.id}
                  type="button"
                  role="tab"
                  aria-selected={activeStep}
                  aria-controls="ai-transformation-panel"
                  onClick={() => setActive(step.id)}
                  className={cn(
                    "flex min-h-16 items-center gap-3 border-t border-line px-4 py-3 text-left transition-colors first:border-t-0 sm:border-t-0 sm:border-l sm:first:border-l-0",
                    activeStep ? "bg-lime text-lime-ink" : "bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink",
                  )}
                >
                  <span className="label text-current">{step.marker}</span>
                  <span className="text-sm font-semibold">{step.tab}</span>
                </button>
              );
            })}
          </div>

          <div id="ai-transformation-panel" role="tabpanel" className="relative flex flex-1 items-center overflow-hidden border-x border-b border-line bg-surface">
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <div className="absolute inset-y-0 left-1/3 w-px bg-line/60" />
              <div className="absolute inset-y-0 right-1/3 w-px bg-line/60" />
              <div className="absolute inset-x-0 top-1/2 h-px bg-line/60" />
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selected.id}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="relative z-10 max-w-2xl p-6 sm:p-10 lg:p-14"
              >
                <span className="flex size-14 items-center justify-center bg-lime text-lime-ink">
                  <SelectedIcon className="size-6" aria-hidden />
                </span>
                <p className="label mt-8">{selected.tab}</p>
                <h3 className="display mt-3 text-[clamp(2.7rem,5vw,5rem)]">{selected.title}</h3>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-2 sm:text-lg">{selected.body}</p>
                <p className="mt-8 border-t border-line pt-4 text-sm font-semibold text-ink">{selected.detail}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
