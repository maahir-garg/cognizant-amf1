import Image from "next/image";
import { APP_NAME } from "@/lib/config";
import { getSource } from "@/lib/data/load";
import { STORY_DEK, STORY_IMAGES, STORY_TITLE, WHAT_YOU_GET } from "@/lib/story/chapters";
import { cn } from "@/lib/utils";
import { DepthToggle } from "./chapter-depth";
import styles from "./story.module.css";

/** "2025" from "Make A Mark ESG Report 2025", so the byline follows the source record. */
function reportYear(): string {
  return /\d{4}/.exec(getSource("esg-2025").title)?.[0] ?? "";
}

/**
 * Title page: paper ground, centred serif headline, the car as a full-width
 * band at the bottom. The band's height follows the viewport width so the
 * whole car stays in frame from a phone to a projector.
 */
export function StoryHero() {
  const img = STORY_IMAGES["launch-quarter"];
  return (
    <section data-tone="paper" aria-labelledby="story-title" className="flex min-h-[calc(100svh-56px)] flex-col">
      <div className="wrap flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center sm:gap-5 lg:py-6 [@media(min-width:1024px)_and_(max-height:820px)]:gap-3 [@media(min-width:1024px)_and_(max-height:820px)]:py-4">
        <p className="kicker text-ink-2">
          An {APP_NAME} story · From the team&apos;s {reportYear()} Make A Mark report · every figure sourced
        </p>
        <h1 id="story-title" className="h1-feature mx-auto">
          {STORY_TITLE}
        </h1>
        <p className="dek mx-auto max-w-[44ch]">{STORY_DEK}</p>
        <DepthToggle className="mt-2" />
        <a href="#what-you-get" className="mt-1 flex flex-col items-center gap-2 text-ink-3 hover:text-ink">
          <span className="kicker text-current">Scroll to follow the car</span>
          <span aria-hidden className="block h-6 w-px bg-current" />
        </a>
      </div>
      <figure className={cn("relative w-full", styles.heroBand)}>
        <div className="relative h-[min(45svh,66vw)] w-full overflow-hidden bg-[var(--hero-ground)] lg:h-[max(45svh,28vw)] [@media(min-width:1024px)_and_(max-height:820px)]:h-[max(42svh,26vw)]">
          <Image
            src={img.src}
            alt={img.alt}
            fill
            preload
            sizes="100vw"
            className="object-cover object-[50%_60%]"
          />
        </div>
        <figcaption className="wrap flex justify-end py-2">
          <span className="kicker text-ink-3">Image: Aston Martin Aramco</span>
        </figcaption>
      </figure>
    </section>
  );
}

export function WhatYouGet() {
  return (
    <section id="what-you-get" data-tone="paper" aria-labelledby="what-you-get-title" className="border-t border-line">
      <div className="wrap py-10 lg:py-14">
        <h2 id="what-you-get-title" className="kicker kicker-rule text-ink">
          What you get
        </h2>
        <ul className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHAT_YOU_GET.map((w) => (
            <li key={w.label} className="flex flex-col gap-1.5 border-t border-line pt-4">
              <span className="font-sans text-[0.9375rem] font-semibold text-ink">{w.label}</span>
              <span className="font-serif text-lg leading-snug text-ink-2">{w.line}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
