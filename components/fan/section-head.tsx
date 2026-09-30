import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Kicker with its rule, a chapter-sized heading and a one-line dek: the opening of every race-page section. */
export function SectionHead({
  id,
  kicker,
  title,
  dek,
  className,
}: {
  id: string;
  kicker: ReactNode;
  title: ReactNode;
  dek?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-4", className)}>
      <p className="kicker kicker-rule">{kicker}</p>
      <h2 id={id} className="h2-chapter max-w-[22ch]">
        {title}
      </h2>
      {dek && <p className="dek">{dek}</p>}
    </header>
  );
}
