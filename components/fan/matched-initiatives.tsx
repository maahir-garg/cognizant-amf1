"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InlineFact } from "@/components/shared/fact-value";
import { StatusBadge } from "@/components/shared/status-badge";
import { matchInitiatives } from "@/lib/data/relevance";
import type { FanProfile } from "@/lib/data/schemas";
import { useResolvedProfile } from "@/lib/fan/profile";

/** A4: initiatives ranked for the fan's profile, with why they matched. */
export function MatchedInitiatives({ paramProfile }: { paramProfile: FanProfile | null }) {
  const profile = useResolvedProfile(paramProfile);

  if (!profile) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-md border border-line p-5">
        <p className="text-sm text-ink-2">Set up your lap to see initiatives matched to you.</p>
        <Button asChild variant="outline">
          <Link href="/start">
            Start your lap <ArrowRight />
          </Link>
        </Button>
      </div>
    );
  }

  const matches = matchInitiatives(profile);
  if (!matches.length) return <p className="text-sm text-ink-2">Nothing matched your interests yet.</p>;

  return (
    <div className="flex flex-col divide-y divide-line rounded-md border border-line">
      {matches.map(({ initiative, reasons }) => (
        <article key={initiative.id} className="flex flex-col gap-3 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <h3 className="font-semibold text-ink">{initiative.name}</h3>
            <div className="flex items-center gap-2">
              <StatusBadge status={initiative.status} />
              {initiative.status === "simulated" && <span className="label text-simulated">Illustrative</span>}
            </div>
          </div>
          <p className="text-sm text-ink-2">{initiative.summary}</p>
          {initiative.status === "simulated" && initiative.notes && <p className="text-xs text-ink-3">{initiative.notes}</p>}
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-3">
            {reasons.map((r) => (
              <li key={r} className="label">
                {r}
              </li>
            ))}
          </ul>
          {initiative.partners.length > 0 && <p className="text-xs text-ink-3">With {initiative.partners.join(", ")}</p>}
          {initiative.factIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {initiative.factIds.slice(0, 3).map((id) => (
                <InlineFact key={id} id={id} />
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
