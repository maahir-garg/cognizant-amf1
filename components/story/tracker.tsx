"use client";

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { DepthToggle } from "./chapter-depth";
import styles from "./story.module.css";

type Item = { id: string; number: number; label: string };

/**
 * 40px strip under the header, sticky for the length of the story. The
 * chapter crossing the middle of the viewport is the current one; one lime
 * indicator slides to it, and a hairline fills as the story is read.
 * Desktop: every chapter is a link, with the depth toggle at the end.
 * Phones: the current chapter is a 44px button that opens the chapter list
 * and the depth toggle. Segments are plain links, so it works without
 * JavaScript too.
 */
export function ChapterTracker({ chapters }: { chapters: Item[] }) {
  const [active, setActive] = useState(0);
  const [bar, setBar] = useState<{ x: number; w: number } | null>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const menuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const els = chapters.map((c) => document.getElementById(c.id)).filter((e): e is HTMLElement => Boolean(e));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Math.max(0, chapters.findIndex((c) => c.id === e.target.id)));
        }
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [chapters]);

  // Measure the active link so the single indicator can translate to it.
  useLayoutEffect(() => {
    const measure = () => {
      const el = linkRefs.current[active];
      if (!el || !el.offsetParent) return setBar(null);
      const text = el.querySelector<HTMLElement>("[data-label]") ?? el;
      setBar({ x: text.offsetLeft, w: text.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  const go = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    if (menuRef.current) menuRef.current.open = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  const current = chapters[active];

  return (
    <nav aria-label="Chapters" data-tone="paper" className="sticky top-14 z-30 h-10 border-b border-line">
      <div className="wrap relative flex h-full items-center">
        {/* Phones and tablets: one button that opens the chapter list and the depth toggle. */}
        <details ref={menuRef} className="group relative h-full flex-1 lg:hidden">
          <summary className="flex h-11 cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
            <span className="kicker truncate text-ink">
              <span className="num">
                {current.number}/{chapters.length}
              </span>{" "}
              · {current.label}
            </span>
            <span className="flex items-center gap-2 font-sans text-[0.8125rem] font-medium text-ink-2">
              Chapters and detail
              <span aria-hidden className="transition-transform group-open:rotate-180">
                ↓
              </span>
            </span>
          </summary>
          <div className="absolute inset-x-[-16px] top-10 border-b border-line-strong bg-bg px-4 pt-2 pb-4 sm:inset-x-[-24px] sm:px-6">
            <ol className="flex flex-col">
              {chapters.map((c, i) => (
                <li key={c.id}>
                  <a
                    href={`#${c.id}`}
                    onClick={(e) => go(e, c.id)}
                    aria-current={i === active ? "step" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-3 border-b border-line font-sans text-base",
                      i === active ? "font-semibold text-ink" : "text-ink-2",
                    )}
                  >
                    <span className="num w-5 text-ink-3">{c.number}</span>
                    {c.label}
                  </a>
                </li>
              ))}
            </ol>
            <DepthToggle compact className="mt-4 justify-start" />
          </div>
        </details>

        {/* Desktop: every chapter as a link, the depth toggle at the end. */}
        <ol className="hidden h-full items-stretch lg:flex">
          {chapters.map((c, i) => {
            const on = i === active;
            return (
              <li key={c.id} className="flex">
                <a
                  ref={(el) => {
                    linkRefs.current[i] = el;
                  }}
                  href={`#${c.id}`}
                  onClick={(e) => go(e, c.id)}
                  aria-current={on ? "step" : undefined}
                  className={cn(
                    "flex h-full items-center px-3 font-sans text-[0.8125rem] whitespace-nowrap transition-colors focus-visible:outline-focus xl:px-4",
                    i === 0 && "pl-0 xl:pl-0",
                    on ? "text-ink" : "text-ink-3 hover:text-ink",
                  )}
                >
                  <span data-label className="flex items-baseline gap-1.5">
                    <span className="num">{c.number}</span>
                    {/* Same weight whether current or not, so labels never shift. */}
                    <span>{c.label}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
        <DepthToggle compact className="ml-auto hidden lg:flex" />

        <span
          aria-hidden
          className={cn(styles.trackerIndicator, "hidden lg:block")}
          style={bar ? { transform: `translateX(${bar.x}px)`, width: `${bar.w}px`, opacity: 1 } : { opacity: 0 }}
        />
        <span aria-hidden className={styles.trackerProgress} />
      </div>
    </nav>
  );
}
