import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Kicker with its rule, a chapter-sized heading and a one-line dek: the
 * opening of every race-page section. `split` puts the dek beside the
 * heading from 1024 px, for sections whose content runs full width below,
 * so the heading doesn't leave an empty half-page beside it.
 */
export function SectionHead({
  id,
  kicker,
  title,
  dek,
  split = false,
  className,
}: {
  id: string;
  kicker: ReactNode;
  title: ReactNode;
  dek?: ReactNode;
  split?: boolean;
  className?: string;
}) {
  if (split) {
    return (
      <header className={cn("grid gap-4 lg:grid-cols-12 lg:gap-6", className)}>
        <div className="flex flex-col gap-4 lg:col-span-6">
          <p className="kicker kicker-rule">{kicker}</p>
          <h2 id={id} className="h2-chapter max-w-[16ch]">
            {title}
          </h2>
        </div>
        {dek && <p className="dek lg:col-span-5 lg:col-start-8 lg:self-end">{dek}</p>}
      </header>
    );
  }
  return (
    <header className={cn("flex flex-col gap-4", className)}>
      <p className="kicker kicker-rule">{kicker}</p>
      <h2 id={id} className="h2-chapter max-w-[16ch]">
        {title}
      </h2>
      {dek && <p className="dek">{dek}</p>}
    </header>
  );
}
