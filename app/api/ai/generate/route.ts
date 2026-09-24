/**
 * POST /api/ai/generate
 * Body: AiRequest (lib/data/schemas.ts). Returns AiResponse.
 * Never throws to the client: invalid requests get 400 with the Zod error.
 */
import { z } from "zod";
import { runGeneration } from "@/lib/ai/engine";
import { findFact } from "@/lib/data/load";
import { AiRequest } from "@/lib/data/schemas";

export async function POST(request: Request) {
  const parsed = AiRequest.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: z.prettifyError(parsed.error) }, { status: 400 });
  }
  const unknown = parsed.data.factIds.filter((id) => !findFact(id));
  if (unknown.length) {
    return Response.json({ error: `Unknown fact ids: ${unknown.join(", ")}` }, { status: 400 });
  }
  return Response.json(await runGeneration(parsed.data));
}
