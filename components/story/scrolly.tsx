"use client";

import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./story.module.css";

/** A photo layer's push-in, as a composited translate + scale (transform-origin stays 0 0). */
export type ZoomVars = { s: number; tx: number; ty: number; mtx: number; mty: number };

export type StepMeta = {
  /** Which stage layer this step shows. */
  layer: number;
  /** Parts of the graphic to highlight. */
  highlight: string[];
  /** Each photo layer's zoom at this step (null for non-photo layers), so a layer keeps its framing while hidden. */
  zooms: (ZoomVars | null)[];
};

export type StageLayer = { kind: "photo" | "graphic"; node: ReactNode };

/** On phones a card rests under its layer's box: a landscape photo ("wide"), a square crop ("tall") or a graphic. */
export type StageStep = { node: ReactNode; box: "wide" | "tall" | "graphic" };

const HighlightContext = createContext<string[] | null>(null);

/** The parts of a stage graphic the active step is talking about. */
export function useStageHighlight(): string[] | null {
  return useContext(HighlightContext);
}

function zoomStyle(z: ZoomVars | null): CSSProperties | undefined {
  if (!z) return undefined;
  return {
    "--s": z.s,
    "--tx": `${z.tx}%`,
    "--ty": `${z.ty}%`,
    "--mtx": `${z.mtx}%`,
    "--mty": `${z.mty}%`,
  } as CSSProperties;
}

/**
 * Sticky stage + stepping cards. One IntersectionObserver with a centre-line
 * root margin picks the active step. Layers dip through the chapter ground
 * (the outgoing one fades before the incoming one arrives), so a chart never
 * sits over a photo. Cards never move or fade. The server renders layer 0
 * active and every card, so the story reads without JavaScript.
 *
 * Two more observers keep the stage cheap: `data-near` (about a screen
 * away) is the only time the active photo is promoted with will-change, and
 * a wider margin starts loading and decoding this chapter's photos while
 * the reader is still in the previous one.
 */
export function Scrolly({
  layers,
  steps,
  meta,
  className,
}: {
  layers: StageLayer[];
  steps: StageStep[];
  meta: StepMeta[];
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const [near, setNear] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!list || !root || !stage) return;

    const items = [...list.querySelectorAll<HTMLElement>(":scope > li")];
    const steps = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step ?? 0));
        }
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    items.forEach((el) => steps.observe(el));

    const nearby = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "100% 0px 100% 0px", threshold: 0 });
    nearby.observe(root);

    // Decode before reveal: fetch and decode this chapter's photos a few screens early.
    const warm = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        for (const img of stage.querySelectorAll("img")) {
          if (img.loading === "lazy") img.loading = "eager";
          img.decode?.().catch(() => {});
        }
        warm.disconnect();
      },
      { rootMargin: "300% 0px 300% 0px", threshold: 0 },
    );
    warm.observe(root);

    return () => {
      steps.disconnect();
      nearby.disconnect();
      warm.disconnect();
    };
  }, []);

  const m = meta[active] ?? meta[0];

  return (
    <div ref={rootRef} className={cn(styles.scrolly, className)}>
      <div ref={stageRef} className={styles.stage} data-active-step={active} data-near={near ? "" : undefined}>
        <HighlightContext.Provider value={m.highlight}>
          {layers.map((layer, i) => {
            const on = i === m.layer;
            return (
              <div
                key={i}
                className={styles.layer}
                data-active={on ? "" : undefined}
                data-kind={layer.kind}
                aria-hidden={layer.kind === "photo" || !on ? true : undefined}
                style={zoomStyle(m.zooms[i] ?? null)}
              >
                {layer.node}
              </div>
            );
          })}
        </HighlightContext.Provider>
      </div>
      <ol ref={listRef} className={styles.steps}>
        {steps.map((s, i) => (
          <li key={i} data-step={i} data-box={s.box} className={styles.step} aria-current={i === active ? "step" : undefined}>
            <div className={styles.stepInner}>{s.node}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
