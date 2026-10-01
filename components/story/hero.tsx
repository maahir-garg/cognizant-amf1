import Image from "next/image";
import { APP_NAME } from "@/lib/config";
import { getSource } from "@/lib/data/load";
import { STORY_DEK, STORY_IMAGE_SIZES, STORY_IMAGES, STORY_TITLE, TRUST_LINE } from "@/lib/story/chapters";
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
      {/* Phones read left-aligned (a centred dek over four lines is hard to follow); centred from 640px. */}
      <div className="wrap flex flex-1 flex-col items-start justify-center gap-4 py-8 text-left sm:items-center sm:gap-5 sm:text-center lg:py-6 [@media(min-width:1024px)_and_(max-height:820px)]:gap-3 [@media(min-width:1024px)_and_(max-height:820px)]:py-4">
        <p className="kicker text-ink-2">
          An {APP_NAME} story · From the team&apos;s {reportYear()} Make A Mark report
        </p>
        <h1 id="story-title" className="h1-feature sm:mx-auto">
          {STORY_TITLE}
        </h1>
        <p className="dek max-w-[44ch] sm:mx-auto lg:max-w-[56ch]">{STORY_DEK}</p>
        <p className="flex max-w-[60ch] items-baseline gap-2 font-sans text-[0.9375rem] text-ink-2">
          <span aria-hidden className="text-ink">
            ✓
          </span>
          {TRUST_LINE}
        </p>
        <DepthToggle className="mt-2" />
        <a href="#story" className="mt-1 flex flex-col items-start gap-2 text-ink-3 hover:text-ink sm:items-center">
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
            sizes={STORY_IMAGE_SIZES}
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
