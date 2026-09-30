"use client";

import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./story.module.css";

export type StepMeta = {
  /** Which stage layer this step shows. */
  layer: number;
  /** Push-in for the photo layer while this step is active. */
  scale: number;
  origin: { x: number; y: number };
  mobileOrigin: { x: number; y: number };
  /** Parts of the graphic to highlight. */
  highlight: string[];
};

export type StageLayer = { kind: "image" | "graphic"; node: ReactNode };

const HighlightContext = createContext<string[] | null>(null);

/** The parts of a stage graphic the active step is talking about. */
export function useStageHighlight(): string[] | null {
  return useContext(HighlightContext);
}

/**
 * Sticky stage + stepping cards. One IntersectionObserver with a centre-line
 * root margin picks the active step; the stage crossfades its layers and
 * pushes the photo in slowly. Cards never move or fade. The server renders
 * layer 0 active and every card, so the story reads without JavaScript.
 */
export function Scrolly({
  layers,
  steps,
  meta,
  className,
}: {
  layers: StageLayer[];
  steps: ReactNode[];
  meta: StepMeta[];
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const items = [...list.querySelectorAll<HTMLElement>(":scope > li")];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step ?? 0));
        }
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const m = meta[active] ?? meta[0];

  return (
    <div className={cn(styles.scrolly, className)}>
      <div className={styles.stage} data-active-step={active}>
        <HighlightContext.Provider value={m.highlight}>
          {layers.map((layer, i) => {
            const on = i === m.layer;
            const zoom =
              layer.kind === "image"
                ? ({
                    "--s": m.scale,
                    "--ox": `${m.origin.x}%`,
                    "--oy": `${m.origin.y}%`,
                    "--mox": `${m.mobileOrigin.x}%`,
                    "--moy": `${m.mobileOrigin.y}%`,
                  } as CSSProperties)
                : undefined;
            return (
              <div
                key={i}
                className={styles.layer}
                data-active={on ? "" : undefined}
                data-kind={layer.kind}
                aria-hidden={layer.kind === "image" || !on ? true : undefined}
                style={zoom}
              >
                {layer.node}
              </div>
            );
          })}
        </HighlightContext.Provider>
      </div>
      <ol ref={listRef} className={styles.steps}>
        {steps.map((node, i) => (
          <li key={i} data-step={i} className={styles.step} aria-current={i === active ? "step" : undefined}>
            {node}
          </li>
        ))}
      </ol>
    </div>
  );
}

export const storyStyles = styles;
