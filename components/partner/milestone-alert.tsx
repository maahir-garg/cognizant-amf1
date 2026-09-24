"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { AiText } from "@/components/shared/ai-text";
import { Button } from "@/components/ui/button";
import { useAiText } from "@/lib/ai/client";
import { stripCitations } from "@/lib/ai/guardrail";
import { milestonePostRequest } from "@/lib/ai/requests";
import type { Milestone } from "@/lib/live/replay";

/** Facts the suggested campaign post is grounded in when a live milestone fires. */
const MILESTONE_POST_FACT_IDS = ["c25-mam-day-students", "c25-ai-skills-gap"];

export function MilestoneAlert({ milestone }: { milestone: Milestone }) {
  const request = milestonePostRequest(
    { counterId: milestone.counterId, label: milestone.label, threshold: milestone.threshold, unit: milestone.unit },
    MILESTONE_POST_FACT_IDS,
  );
  const { data, error, loading } = useAiText(request);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(stripCitations(data.text));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-3 rounded-md border border-line bg-surface p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-ink">
          {milestone.label} passed {milestone.threshold.toLocaleString("en-GB")} {milestone.unit}
        </p>
        <span className="label text-simulated">Simulated milestone</span>
      </div>
      {loading && <p className="text-xs text-ink-3">Drafting a suggested campaign post…</p>}
      {error && <p className="text-xs text-conflict">Could not draft a post: {error}</p>}
      {data && (
        <>
          <div className="rounded-md border border-line-strong bg-surface-2 p-3">
            <AiText response={data} derived={request.derived} />
          </div>
          <Button size="sm" variant="outline" className="self-start" onClick={copy}>
            {copied ? (
              <>
                <Check /> Copied
              </>
            ) : (
              <>
                <Copy /> Copy post
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
}
