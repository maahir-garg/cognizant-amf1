/**
 * Server-sent events stream of the simulated race-weekend feed.
 *   GET /api/events/stream?race=singapore-2026&speed=4&from=0
 * Each message is a JSON FeedEvent. Everything it sends is simulated demo
 * data; see docs/architecture.md for how a production feed would plug in.
 */
import { raceEvents } from "@/lib/live/replay";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const race = url.searchParams.get("race") ?? "singapore-2026";
  const speed = Math.min(20, Math.max(0.5, Number(url.searchParams.get("speed") ?? 1)));
  const from = Math.max(0, Number(url.searchParams.get("from") ?? 0));
  const list = raceEvents(race).filter((e) => e.at >= from);
  const encoder = new TextEncoder();
  const timers: ReturnType<typeof setTimeout>[] = [];

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`event: open\ndata: ${JSON.stringify({ race, speed, from, simulated: true })}\n\n`));
      list.forEach((e, i) => {
        timers.push(
          setTimeout(() => {
            controller.enqueue(encoder.encode(`id: ${e.id}\ndata: ${JSON.stringify(e)}\n\n`));
            if (i === list.length - 1) {
              controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
              controller.close();
            }
          }, ((e.at - from) * 1000) / speed),
        );
      });
      if (list.length === 0) controller.close();
    },
    cancel() {
      timers.forEach(clearTimeout);
    },
  });

  request.signal.addEventListener("abort", () => timers.forEach(clearTimeout));

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
