"use client";

import { AiText } from "@/components/shared/ai-text";
import { useAiText } from "@/lib/ai/client";
import { raceWeekPostRequest } from "@/lib/ai/requests";
import { HERO_RACE_ID, PARTNER_ID } from "@/lib/config";
import { draftKey } from "@/lib/partner/approvals";
import { footnotedPlainText } from "@/lib/partner/citations";
import { ApprovalPanel } from "./approval-panel";

/**
 * This week's suggested LinkedIn post: only what the team has published
 * about the race's city (the STEM Racing World Finals and the trackside STEM
 * programme Cognizant supports online), with its own approval trail here.
 */
export function SuggestedPost() {
  const request = raceWeekPostRequest(PARTNER_ID, HERO_RACE_ID);
  const { data, error, loading } = useAiText(request);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-md border border-line bg-surface p-5">
        <p className="kicker">Suggested post · LinkedIn · Singapore</p>
        {loading && <p className="text-ink-3">Drafting from the fact base…</p>}
        {error && <p className="text-conflict">Could not draft this post: {error}</p>}
        {data && <AiText response={data} className="text-[1.0625rem]" />}
      </div>
      {data && data.guardrail.passed && (
        <ApprovalPanel
          draftKey={draftKey("race-week", data.text)}
          title="Race-week post"
          text={data.text}
          factIds={data.citations}
          copyText={() => footnotedPlainText(data)}
        />
      )}
    </div>
  );
}
