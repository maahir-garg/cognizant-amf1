"use client";

import Link from "next/link";
import { AiText } from "@/components/shared/ai-text";
import { useAiText } from "@/lib/ai/client";
import { narrativeRequest } from "@/lib/ai/requests";
import { PARTNER_ID } from "@/lib/config";

/** This week's suggested LinkedIn post, from the same request the Narratives tab uses, so its approval trail carries over. */
export function SuggestedPost() {
  const { data, error, loading } = useAiText(narrativeRequest("linkedin-post", { partnerId: PARTNER_ID, pillars: ["community"] }));
  return (
    <div className="flex flex-col gap-4 rounded-[4px] border border-line bg-surface p-5">
      <p className="kicker">Suggested post · LinkedIn</p>
      {loading && <p className="text-ink-3">Drafting from the fact base…</p>}
      {error && <p className="text-conflict">Could not draft this post: {error}</p>}
      {data && <AiText response={data} className="text-[1.0625rem]" />}
      <Link href="/partners/narratives?format=linkedin-post&focus=community" className="link self-start font-medium">
        Review and approve in Narratives
      </Link>
    </div>
  );
}
