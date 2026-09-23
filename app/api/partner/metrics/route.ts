import { NextResponse } from "next/server";
import { getFacts, getHeroRace } from "@/lib/data/loaders";

/**
 * Read-only JSON API for partner BI ingestion (Cognizant, sponsors, ESG auditors).
 * Plugs directly into external dashboards, ERP systems, and reporting tools.
 */
export async function GET() {
  const allFacts = getFacts();
  const heroRace = getHeroRace();

  const partnerMetrics = allFacts.filter((f) => f.partner_relevant);

  return NextResponse.json(
    {
      platform: "Impact Lap Partner BI API",
      version: "1.0.0",
      organization: "Aston Martin Aramco Formula One Team",
      partner: "Cognizant",
      extraction_audit_date: "2026-09-24",
      reporting_cycle: "2024–2025",
      hero_grand_prix: {
        name: heroRace.name,
        slug: heroRace.slug,
        dates: heroRace.dates,
        circuit: heroRace.circuit,
        estimated_freight_tco2e: heroRace.freight_tco2e,
        estimated_travel_tco2e: heroRace.travel_tco2e,
        saf_uptake_percent: heroRace.saf_uptake_percent,
        delta_percent_vs_prior: heroRace.delta_percent,
        status: heroRace.status,
      },
      audit_integrity: {
        total_facts: partnerMetrics.length,
        verified_count: partnerMetrics.filter((f) => f.status === "verified").length,
        estimated_count: partnerMetrics.filter((f) => f.status === "estimated").length,
        simulated_count: partnerMetrics.filter((f) => f.status === "simulated").length,
        assurance_standard: "GRI Content Index Standards Referenced / Science Based Targets Initiative",
      },
      metrics: partnerMetrics.map((fact) => ({
        id: fact.id,
        pillar: fact.pillar,
        metric: fact.metric,
        value: fact.value,
        unit: fact.unit,
        display_value: fact.display_value,
        period: fact.period,
        provenance: {
          source_document: fact.source_doc,
          report_page: fact.page,
          status: fact.status,
          formula: fact.formula || null,
          methodology_notes: fact.notes || null,
        },
      })),
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
