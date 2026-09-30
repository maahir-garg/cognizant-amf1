import Image from "next/image";
import type { CSSProperties } from "react";
import { FactValue } from "@/components/shared/fact-value";
import { sourceShortName } from "@/lib/data/load";
import type { AiResponse } from "@/lib/data/schemas";
import { STORY_IMAGES, type Chapter, type DetailSection, type Step } from "@/lib/story/chapters";
import { cn } from "@/lib/utils";
import { ChapterDepth } from "./chapter-depth";
import { StoryCopy } from "./copy";
import { StoryGraphic } from "./graphics";
import { Scrolly, type StageLayer, type StepMeta } from "./scrolly";
import styles from "./story.module.css";

const RHYTHM = "clamp(64px,10vw,128px)";

/** Carries each photo step's push-in forward through graphic steps, so returning to the photo does not jump. */
function stepMeta(chapter: Chapter): StepMeta[] {
  let zoom = { scale: 1, origin: { x: 50, y: 50 }, mobileOrigin: { x: 50, y: 50 } };
  let highlight: string[] = [];
  return chapter.steps.map((s) => {
    if (s.zoom) zoom = { scale: s.zoom.scale, origin: s.zoom.origin, mobileOrigin: s.zoom.mobileOrigin ?? s.zoom.origin };
    if (s.graphic) highlight = s.graphic.highlight;
    return { layer: s.graphic ? 1 : 0, ...zoom, highlight };
  });
}

function PhotoLayer({ chapter }: { chapter: Chapter }) {
  const img = STORY_IMAGES[chapter.image];
  const vars = {
    "--dpos": `${img.desktop.x}% ${img.desktop.y}%`,
    "--mpos": `${img.mobile.x}% ${img.mobile.y}%`,
  } as CSSProperties;
  return (
    <>
      <div className={styles.imageBox} data-shape={img.shape} style={vars}>
        <div className={styles.zoomer}>
          <Image src={img.src} alt="" fill sizes="(min-width: 1024px) 70vw, 100vw" className={styles.image} />
        </div>
      </div>
      <p className={cn(styles.credit, "kicker text-ink-3")}>Image: Aston Martin Aramco</p>
    </>
  );
}

function StepCard({ step, chapter, first }: { step: Step; chapter: Chapter; first: boolean }) {
  return (
    <article data-tone="paper" className={styles.card}>
      {/* The wrapper carries .prose-body so its sibling spacing never lands on inline figures. */}
      <div className="prose-body max-w-[40ch]">
        <p>
          <StoryCopy copy={step.copy} />
        </p>
      </div>
      {step.quote && (
        <figure className="mt-5 border-l-2 border-highlight pl-4">
          <blockquote className="font-serif text-[clamp(1.375rem,1.2rem+0.6vw,1.75rem)] leading-snug font-medium text-ink italic">
            <p>“{step.quote.text}”</p>
          </blockquote>
          <figcaption className="mt-3 flex flex-col gap-0.5 text-[0.875rem] text-ink-2">
            <span className="font-semibold text-ink">{step.quote.speaker}</span>
            <span>
              {step.quote.role} · {sourceShortName(step.quote.sourceId)}, p. {step.quote.page}
            </span>
          </figcaption>
        </figure>
      )}
      {step.facts?.length ? (
        <div className="mt-5 flex flex-col gap-5 border-t border-line pt-4">
          {step.facts.map((f) => (
            <FactValue key={f.id} id={f.id} size="lg" caption={f.caption} />
          ))}
        </div>
      ) : null}
      {/* Without JavaScript the stage never switches to the graphic, so the first graphic card carries a static copy. */}
      {first && step.graphic && chapter.graphic && (
        <noscript>
          <div className="mt-5 border-t border-line pt-4">
            <StoryGraphic graphic={chapter.graphic} highlight={step.graphic.highlight} />
          </div>
        </noscript>
      )}
    </article>
  );
}

function DetailBody({ sections }: { sections: DetailSection[] }) {
  return (
    <div className="flex flex-col gap-8">
      {sections.map((d, i) => (
        <section key={i} className="flex flex-col gap-4">
          {d.heading && <h3 className="kicker text-ink">{d.heading}</h3>}
          {d.text && (
            <p className="max-w-[65ch] font-serif text-[1.0625rem] leading-[1.5] text-ink-2 sm:text-lg">
              <StoryCopy copy={d.text} />
              {d.cite && (
                <span className="ml-1 font-sans text-[0.8125rem] whitespace-nowrap text-ink-3">
                  ({sourceShortName(d.cite.sourceId)}, p. {d.cite.page})
                </span>
              )}
            </p>
          )}
          {d.facts?.length ? (
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {d.facts.map((id) => (
                <FactValue key={id} id={id} size="md" showMetric />
              ))}
            </div>
          ) : null}
        </section>
      ))}
    </div>
  );
}

export function StoryChapter({
  chapter,
  total,
  preloaded,
}: {
  chapter: Chapter;
  total: number;
  preloaded: Partial<Record<"new" | "die-hard", AiResponse>> | null;
}) {
  const layers: StageLayer[] = [{ kind: "image", node: <PhotoLayer chapter={chapter} /> }];
  if (chapter.graphic) {
    layers.push({
      kind: "graphic",
      node: (
        <div className={styles.graphicBox}>
          <div className={styles.graphicInner}>
            <StoryGraphic graphic={chapter.graphic} />
          </div>
        </div>
      ),
    });
  }
  const firstGraphic = chapter.steps.findIndex((s) => s.graphic);

  return (
    <section id={chapter.id} data-tone={chapter.tone} aria-labelledby={`${chapter.id}-title`} className={styles.chapter}>
      <header className="wrap" style={{ paddingTop: RHYTHM, paddingBottom: "clamp(40px,6vw,72px)" }}>
        <p className="kicker kicker-rule">
          Chapter {chapter.number} of {total} · {chapter.kicker}
        </p>
        <h2 id={`${chapter.id}-title`} className="h2-chapter mt-3 max-w-[20ch]">
          {chapter.title}
        </h2>
        <p className="dek mt-4 max-w-[40ch]">{chapter.dek}</p>
      </header>

      <Scrolly
        layers={layers}
        meta={stepMeta(chapter)}
        steps={chapter.steps.map((s, i) => (
          <StepCard key={i} step={s} chapter={chapter} first={i === firstGraphic} />
        ))}
      />

      <div className="wrap" style={{ paddingBottom: "clamp(48px,6vw,80px)" }}>
        <div className="measure border-t border-line pt-8">
          <ChapterDepth chapterId={chapter.id} preloaded={preloaded}>
            <DetailBody sections={chapter.detail} />
          </ChapterDepth>
        </div>
      </div>
    </section>
  );
}
