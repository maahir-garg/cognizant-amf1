"use client";

import type { ReactNode } from "react";
import { useProvenance } from "@/components/shared/provenance";
import { cn } from "@/lib/utils";

/** Words in running text that open a fact's provenance drawer, for claims that are not a number (e.g. the restatement). */
export function FactLink({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  const { openFact } = useProvenance();
  return (
    <button type="button" onClick={() => openFact(id)} className={cn("link inline text-left", className)}>
      {children}
    </button>
  );
}
