import Image from "next/image";
import type { CSSProperties } from "react";
import { FactValue } from "@/components/shared/fact-value";
import { sourceShortName } from "@/lib/data/load";
import type { AiResponse } from "@/lib/data/schemas";
import { STORY_IMAGES, type Chapter, type DetailSection, type ImageKey, type Layer, type Quote, type Step } from "@/lib/story/chapters";
import { cn } from "@/lib/utils";
import { ChapterBrief, ChapterDetail } from "./chapter-depth";
import { StoryCopy } from "./copy";
import { QuoteStage, StoryGraphic, TilesGraphic } from "./graphics";
import { Scrolly, type StageLayer, type StageStep, type StepMeta, type ZoomVars } from "./scrolly";
import styles from "./story.module.css";

const RHYTHM = "clamp(64px,10vw,128px)";

/** transform-origin (ox, oy) + scale(s) == translate(ox·(1−s), oy·(1−s)) scale(s) from the corner. */
function zoomVars(z: Step["zoom"] | undefined): ZoomVars {
  const s = z?.scale ?? 1;
  const o = z?.origin ?? { x: 50, y: 50 };
  const mo = z?.mobileOrigin ?? o;
  return { s, tx: o.x * (1 - s), ty: o.y * (1 - s), mtx: mo.x * (1 - s), mty: mo.y * (1 - s) };
}

/**
 * Per step: the active layer, the highlight, and every photo layer's framing.
 * A photo layer holds its last framing while hidden and starts at the framing
 * of the first step that shows it, so it never zooms while fading in.
 */
function stepMeta(chapter: Chapter): StepMeta[] {
  const firstZoom = chapter.layers.map((_, i) => chapter.steps.find((s) => s.layer === i)?.zoom);
  const current: (ZoomVars | null)[] = chapter.layers.map((l, i) => (l.kind === "photo" ? zoomVars(firstZoom[i]) : null));
  let highlight: string[] = [];
  return chapter.steps.map((s) => {
    if (chapter.layers[s.layer]?.kind === "photo") current[s.layer] = zoomVars(s.zoom ?? firstZoom[s.layer]);
    if (s.highlight) highlight = s.highlight;
    return { layer: s.layer, highlight: s.highlight ?? highlight, zooms: [...current] };
  });
}

function maxScale(chapter: Chapter, layer: number): number {
  return Math.max(1, ...chapter.steps.filter((s) => s.layer === layer).map((s) => s.zoom?.scale ?? 1));
}

function PhotoLayer({ image, scale }: { image: ImageKey; scale: number }) {
  const img = STORY_IMAGES[image];
  const vars = {
    "--dpos": `${img.desktop.x}% ${img.desktop.y}%`,
    "--mpos": `${img.mobile.x}% ${img.mobile.y}%`,
  } as CSSProperties;
  // Ask for enough pixels that the deepest push-in stays sharp.
  const sizes = `(min-width: 1024px) ${Math.ceil(70 * scale)}vw, ${Math.ceil(100 * scale)}vw`;
  return (
    <>
      <div className={styles.imageBox} data-shape={img.shape} data-image={image} style={vars}>
        <div className={styles.zoomer}>
          {/* Lazy by default; Scrolly starts the fetch and decode a few screens early. */}
          <Image src={img.src} alt="" fill sizes={sizes} loading="lazy" className={styles.image} />
        </div>
      </div>
      <p className={cn(styles.credit, "kicker text-ink-3")}>Image: Aston Martin Aramco</p>
    </>
  );
}

function GraphicLayer({ layer }: { layer: Exclude<Layer, { kind: "photo" }> }) {
  return (
    <div className={styles.graphicBox}>
      <div className={styles.graphicInner}>
        {layer.kind === "graphic" && <StoryGraphic graphic={layer.graphic} />}
        {layer.kind === "tiles" && <TilesGraphic title={layer.title} tiles={layer.tiles} />}
        {layer.kind === "quote" && <QuoteStage quote={layer.quote} />}
      </div>
    </div>
  );
}

function CardQuote({ quote }: { quote: Quote }) {
  return (
    <figure className="mt-5 border-l-2 border-highlight pl-4">
      <blockquote className="font-serif text-[clamp(1.25rem,1.1rem+0.6vw,1.625rem)] leading-snug font-medium text-ink italic">
        <p>“{quote.text}”</p>
      </blockquote>
      <figcaption className="mt-2 text-[0.875rem] text-ink-2">
        {quote.speaker}, {quote.role} · {sourceShortName(quote.sourceId)}, p. {quote.page}
      </figcaption>
    </figure>
  );
}

function StepCard({ step, layer, fallback }: { step: Step; layer: Layer; fallback: boolean }) {
  return (
    <article data-tone="paper" className={styles.card}>
      {/* The wrapper carries .prose-body so its sibling spacing never lands on inline figures. */}
      <div className="prose-body max-w-[40ch]">
        <p>
          <StoryCopy copy={step.copy} />
        </p>
      </div>
      {step.facts?.length ? (
        <div className="mt-5 flex flex-col gap-5 border-t border-line pt-4">
          {step.facts.map((f) => (
            <FactValue key={f.id} id={f.id} size="lg" caption={f.caption} />
          ))}
        </div>
      ) : null}
      {/* Without JavaScript the stage never leaves layer 0, so the first card on a chart or quote carries a static copy. */}
      {fallback && layer.kind === "graphic" && (
        <noscript>
          <div className="mt-5 border-t border-line pt-4">
            <StoryGraphic graphic={layer.graphic} highlight={step.highlight} />
          </div>
        </noscript>
      )}
      {fallback && layer.kind === "quote" && (
        <noscript>
          <CardQuote quote={layer.quote} />
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
  const layers: StageLayer[] = chapter.layers.map((l, i) =>
    l.kind === "photo"
      ? { kind: "photo", node: <PhotoLayer image={l.image} scale={maxScale(chapter, i)} /> }
      : { kind: "graphic", node: <GraphicLayer layer={l} /> },
  );
  const firstUse = chapter.layers.map((_, i) => chapter.steps.findIndex((s) => s.layer === i));
  const steps: StageStep[] = chapter.steps.map((s, i) => {
    const layer = chapter.layers[s.layer];
    const box = layer.kind !== "photo" ? "graphic" : STORY_IMAGES[layer.image].shape === "landscape" ? "wide" : "tall";
    return {
      box,
      node: <StepCard step={s} layer={layer} fallback={s.layer !== 0 && firstUse[s.layer] === i} />,
    };
  });

  return (
    <section id={chapter.id} data-tone={chapter.tone} aria-labelledby={`${chapter.id}-title`} className={styles.chapter}>
      <header className="wrap" style={{ paddingTop: RHYTHM, paddingBottom: "clamp(40px,6vw,72px)" }}>
        <p className="kicker kicker-rule">
          Chapter {chapter.number} of {total} · {chapter.name}
        </p>
        <h2 id={`${chapter.id}-title`} className="h2-chapter mt-3 max-w-[20ch]">
          {chapter.title}
        </h2>
        <p className="dek mt-4 max-w-[40ch]">{chapter.dek}</p>
        <div className="measure mt-8">
          <ChapterBrief chapterId={chapter.id} preloaded={preloaded} />
        </div>
      </header>

      <Scrolly layers={layers} meta={stepMeta(chapter)} steps={steps} />

      <div className="wrap" style={{ paddingBottom: "clamp(48px,6vw,80px)" }}>
        <div className="measure border-t border-line">
          <ChapterDetail>
            <DetailBody sections={chapter.detail} />
          </ChapterDetail>
        </div>
      </div>
    </section>
  );
}
