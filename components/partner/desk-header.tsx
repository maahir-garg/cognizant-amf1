import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A tab's title block: kicker, serif title, one plain line, and an optional
 * aside (dates, legend, source note) that sits right on wide screens.
 * Deliberately short so the work starts above the fold on a projector.
 */
export function DeskHeader({
  kicker,
  title,
  dek,
  aside,
  className,
}: {
  kicker: string;
  title: ReactNode;
  dek?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-5 border-b border-line pt-8 pb-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12 lg:pt-10", className)}>
      <div className="flex min-w-0 flex-col gap-3">
        <p className="kicker text-ink-3">{kicker}</p>
        <h1 className="font-serif text-[2rem] leading-[1.1] font-medium tracking-[-0.01em] text-balance lg:text-[2.5rem]">{title}</h1>
        {dek && <p className="max-w-[70ch] text-ink-2">{dek}</p>}
      </div>
      {aside && <div className="flex shrink-0 flex-col gap-2 lg:items-end lg:text-right">{aside}</div>}
    </header>
  );
}

/** A section label with a hairline, used to divide a tab into its parts. */
export function DeskSection({
  title,
  note,
  id,
  className,
  children,
}: {
  title: string;
  note?: ReactNode;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className={cn("flex min-w-0 flex-col gap-4", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t-2 border-ink pt-3">
        <h2 id={headingId} className="text-[1.0625rem] font-semibold text-ink">
          {title}
        </h2>
        {note && <p className="text-[0.875em] text-ink-3">{note}</p>}
      </div>
      {children}
    </section>
  );
}
