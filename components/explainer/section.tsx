import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * An explainer section: the kicker sits in a left rail on wide screens (like
 * a newspaper sidehead) and the heading and body take the reading column.
 */
export function ExplainerSection({
  id,
  kicker,
  title,
  dek,
  tone,
  wide = false,
  children,
  className,
}: {
  id: string;
  kicker: string;
  title: ReactNode;
  dek?: ReactNode;
  tone?: "green";
  /** Let the body run the full content width (tables, sequences) instead of the reading column. */
  wide?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      data-tone={tone}
      className={cn("scroll-mt-14", !tone && "border-t border-line", className)}
    >
      <div className="wrap grid gap-x-6 gap-y-6 py-[clamp(64px,10vw,128px)] lg:grid-cols-12">
        <p className="kicker kicker-rule lg:col-span-3 lg:pt-3">{kicker}</p>
        <div className="flex flex-col gap-6 lg:col-span-9">
          <h2 id={`${id}-heading`} className="h2-chapter max-w-[24ch]">
            {title}
          </h2>
          {dek && <p className="dek">{dek}</p>}
          <div className={cn("flex flex-col gap-8", !wide && "measure")}>{children}</div>
        </div>
      </div>
    </section>
  );
}

/** Small print under a plan item or section: everything in it is an assumption for discussion. */
export function Assumption({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[0.8125rem] leading-snug text-ink-3", className)}>
      <span className="kicker rounded-sm border border-dashed border-line-strong px-1.5 py-px text-ink-2">Assumption</span>
      {children && <span>{children}</span>}
    </p>
  );
}
