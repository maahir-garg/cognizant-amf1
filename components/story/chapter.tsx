import Image from "next/image";
import type { CSSProperties } from "react";
import { FactValue } from "@/components/shared/fact-value";
import { getFact, sourceShortName } from "@/lib/data/load";
import { captionAfterUnit } from "@/lib/format";
import type { AiResponse } from "@/lib/data/schemas";
import { STORY_IMAGE_SIZES, STORY_IMAGES, type Chapter, type DetailSection, type ImageKey, type Layer, type Quote, type Step } from "@/lib/story/chapters";
import { cn } from "@/lib/utils";
import { ChapterBrief, ChapterDetail } from "./chapter-depth";
import { StoryCopy } from "./copy";
import { NearestRaceLink } from "./nearest-race";
import { QuoteStage, StoryGraphic, TilesGraphic } from "./graphics";
import { Scrolly, type StageLayer, type StageStep, type StepMeta, type ZoomVars } from "./scrolly";
import styles from "./story.module.css";

const RHYTHM = "clamp(64px,10vw,128px)";

/** Chapters that end with a pointer to the fan's nearest race page, and the section it opens. */
const NEAREST_RACE_SECTION: Partial<Record<Chapter["id"], "published" | "take-part">> = {
  circuit: "published",
  beyond: "take-part",
};

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

function PhotoLayer({ image, eager }: { image: ImageKey; eager: boolean }) {
  const img = STORY_IMAGES[image];
  const vars = {
    "--dpos": `${img.desktop.x}% ${img.desktop.y}%`,
    "--mpos": `${img.mobile.x}% ${img.mobile.y}%`,
  } as CSSProperties;
  return (
    <>
      <div className={styles.imageBox} data-shape={img.shape} data-image={image} style={vars}>
        <div className={styles.zoomer}>
          {/*
            The first two chapters load eagerly at low priority, so a fast scroll on a slow
            connection still finds them there; later ones are lazy and Scrolly warms them early.
          */}
          <Image
            src={img.src}
            alt=""
            fill
            sizes={STORY_IMAGE_SIZES}
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "low" : undefined}
            className={cn(styles.image, img.fit === "contain" && styles.imageContain)}
          />
        </div>
      </div>
      <p className={cn(styles.credit, "kicker text-ink-3")}>Image: Aston Martin Aramco</p>
    </>
  );
}

function GraphicLayer({ layer }: { layer: Exclude<Layer, { kind: "photo" }> }) {
  return (
    <div className={styles.graphicBox} data-kind={layer.kind}>
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
            <FactValue key={f.id} id={f.id} size="lg" caption={captionAfterUnit(f.caption, getFact(f.id).unit)} />
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
  const layers: StageLayer[] = chapter.layers.map((l) =>
    l.kind === "photo"
      ? { kind: "photo", node: <PhotoLayer image={l.image} eager={chapter.number <= 2} /> }
      : { kind: "graphic", node: <GraphicLayer layer={l} /> },
  );
  const firstUse = chapter.layers.map((_, i) => chapter.steps.findIndex((s) => s.layer === i));
  const nearestSection = NEAREST_RACE_SECTION[chapter.id];
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
      {/* From 1024px the brief sits beside the title, so the opener is one screen band rather than two. */}
      <header
        className="wrap grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-x-12"
        style={{ paddingTop: RHYTHM, paddingBottom: "clamp(40px,5vw,64px)" }}
      >
        <div className="lg:col-span-7">
          <p className="kicker kicker-rule">
            Chapter {chapter.number} of {total} · {chapter.name}
          </p>
          <h2 id={`${chapter.id}-title`} className="h2-chapter mt-3 max-w-[20ch]">
            {chapter.title}
          </h2>
          <p className="dek mt-4 max-w-[40ch]">{chapter.dek}</p>
        </div>
        <div className="measure lg:col-span-5">
          <ChapterBrief chapterId={chapter.id} preloaded={preloaded} />
        </div>
      </header>

      <Scrolly layers={layers} meta={stepMeta(chapter)} steps={steps} />

      <div className="wrap" style={{ paddingBottom: "clamp(32px,4vw,56px)" }}>
        {nearestSection && (
          <div className="measure pb-6">
            <NearestRaceLink section={nearestSection} />
          </div>
        )}
        <div className="measure border-t border-line">
          <ChapterDetail>
            <DetailBody sections={chapter.detail} />
          </ChapterDetail>
        </div>
      </div>
    </section>
  );
}
