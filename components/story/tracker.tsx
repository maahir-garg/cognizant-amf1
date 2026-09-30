"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

type Item = { id: string; number: number; label: string };

/**
 * 40px strip under the header, sticky for the length of the story. The
 * chapter crossing the middle of the viewport is the current one. Segments
 * are plain anchor links, so it works without JavaScript too.
 */
export function ChapterTracker({ chapters }: { chapters: Item[] }) {
  const [active, setActive] = useState(0);

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

  const go = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  const current = chapters[active];

  return (
    <nav aria-label="Chapters" data-tone="paper" className="sticky top-14 z-30 h-10 border-b border-line">
      <div className="wrap flex h-full items-center">
        {/* Phones: "2/6 · Moving the team" and a segment bar. */}
        <p className="kicker flex-1 truncate text-ink lg:hidden" aria-hidden>
          <span className="num">
            {current.number}/{chapters.length}
          </span>{" "}
          · {current.label}
        </p>
        <ol className="flex h-full items-stretch gap-1 lg:w-full lg:gap-0">
          {chapters.map((c, i) => {
            const on = i === active;
            return (
              <li key={c.id} className="flex lg:flex-1">
                <a
                  href={`#${c.id}`}
                  onClick={(e) => go(e, c.id)}
                  aria-current={on ? "step" : undefined}
                  className={cn(
                    "group relative flex h-full items-center font-sans text-[0.8125rem] whitespace-nowrap transition-colors",
                    "w-6 justify-center lg:w-auto lg:justify-start lg:px-3 lg:first:pl-0",
                    on ? "font-semibold text-ink" : "text-ink-3 hover:text-ink",
                  )}
                >
                  <span className="sr-only lg:not-sr-only lg:whitespace-nowrap">
                    <span className="num mr-1.5">{c.number}</span>
                    {c.label}
                  </span>
                  {/* Segment bar: lime with an ink outline when current. */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute bottom-[-1px] left-0.5 right-0.5 h-0.5 transition-colors lg:left-3 lg:right-3 lg:group-first:left-0",
                      on ? "bg-lime outline outline-1 outline-ink" : "bg-line lg:bg-transparent",
                    )}
                  />
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
