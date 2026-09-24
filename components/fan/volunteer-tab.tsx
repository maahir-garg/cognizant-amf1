"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { InlineFact } from "@/components/shared/fact-value";
import { StatusBadge } from "@/components/shared/status-badge";
import { initiatives } from "@/lib/data/load";

const RACE_ID = "singapore-2026";

/** A6: race-week volunteering slots (all illustrative) plus real, ongoing programmes to follow. */
export function VolunteerTab() {
  const slots = initiatives.filter((i) => i.raceIds.includes(RACE_ID));
  const programmes = initiatives.filter((i) => i.status === "verified" && i.cityIds.includes("singapore"));
  const [registered, setRegistered] = useState<Record<string, boolean>>({});

  function register(id: string, name: string) {
    setRegistered((r) => ({ ...r, [id]: true }));
    toast.success("Interest registered", { description: `Simulated: nothing was sent for "${name}".` });
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <p className="label">Singapore race-week slots · illustrative</p>
        <div className="flex flex-col divide-y divide-line rounded-md border border-line">
          {slots.map((i) => (
            <div key={i.id} className="flex flex-col gap-3 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                <h3 className="font-semibold text-ink">{i.name}</h3>
                <StatusBadge status="simulated" />
              </div>
              <p className="text-sm text-ink-2">{i.summary}</p>
              <Button
                variant="outline"
                disabled={registered[i.id]}
                onClick={() => register(i.id, i.name)}
                className="w-full sm:w-auto"
              >
                {registered[i.id] ? "Interest registered" : "Register interest"}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {programmes.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="label">Real programmes to follow</p>
          <div className="flex flex-col divide-y divide-line rounded-md border border-line">
            {programmes.map((i) => (
              <div key={i.id} className="flex flex-col gap-3 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                  <h3 className="font-semibold text-ink">{i.name}</h3>
                  <StatusBadge status={i.status} />
                </div>
                <p className="text-sm text-ink-2">{i.summary}</p>
                {i.factIds.length > 0 && (
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {i.factIds.slice(0, 2).map((id) => (
                      <InlineFact key={id} id={id} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
