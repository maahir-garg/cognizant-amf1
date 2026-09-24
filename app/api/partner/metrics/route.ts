/**
 * GET /api/partner/metrics
 * Read-only export of the fact base for partner BI tools. See docs/partner-api.md.
 *
 * Query params: pillar, status, tag (e.g. "partner:cognizant"), ids (comma list), format ("json" | "csv").
 * CORS is open (Access-Control-Allow-Origin: *) so a partner's own BI tool can call this directly.
 */
import { PARTNER_ID } from "@/lib/config";
import { metricsToCsv } from "@/lib/partner/csv";
import { partnerMetrics } from "@/lib/partner/metrics";

const CORS_HEADERS = { "Access-Control-Allow-Origin": "*" };

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pillar = url.searchParams.get("pillar");
  const status = url.searchParams.get("status");
  const tag = url.searchParams.get("tag");
  const idsParam = url.searchParams.get("ids");
  const ids = idsParam
    ? idsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : null;
  const format = url.searchParams.get("format");

  const metrics = partnerMetrics({ pillar, status, tag, ids });

  if (format === "csv") {
    return new Response(metricsToCsv(metrics), {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="partner-metrics.csv"',
      },
    });
  }

  return Response.json(
    { generatedAt: new Date().toISOString(), partner: PARTNER_ID, count: metrics.length, metrics },
    { headers: CORS_HEADERS },
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: { ...CORS_HEADERS, "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" },
  });
}
