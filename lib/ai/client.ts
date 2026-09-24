"use client";

/**
 * Browser-side helper for AI text. Components call `useAiText(request)` and
 * render the result with <AiText response=... />.
 */
import { useEffect, useState } from "react";
import type { z } from "zod";
import { AiRequest, type AiResponse } from "@/lib/data/schemas";

export type AiRequestInput = z.input<typeof AiRequest>;

export async function generate(input: AiRequestInput, signal?: AbortSignal): Promise<AiResponse> {
  const res = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(AiRequest.parse(input)),
    signal,
  });
  if (!res.ok) throw new Error(`AI request failed (${res.status}): ${await res.text()}`);
  return (await res.json()) as AiResponse;
}

/** Fetches AI text for a request; re-runs when the request changes (compared by JSON). */
export function useAiText(input: AiRequestInput | null) {
  const key = input ? JSON.stringify(input) : null;
  const [state, setState] = useState<{ key: string | null; data: AiResponse | null; error: string | null }>({
    key: null,
    data: null,
    error: null,
  });

  useEffect(() => {
    if (!key) return;
    const ctrl = new AbortController();
    generate(JSON.parse(key) as AiRequestInput, ctrl.signal)
      .then((data) => setState({ key, data, error: null }))
      .catch((e: Error) => {
        if (e.name !== "AbortError") setState({ key, data: null, error: e.message });
      });
    return () => ctrl.abort();
  }, [key]);

  const current = state.key === key ? state : { data: null, error: null };
  return { data: current.data, error: current.error, loading: Boolean(key) && !current.data && !current.error };
}
