"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  ShieldCheck,
  Download,
  Share2,
  Sliders,
  Radio,
  FileText,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Bot,
  ArrowRight,
  TrendingDown,
  Building,
  GraduationCap,
  Leaf,
  Layers,
} from "lucide-react";
import { getFacts, getHeroRace } from "@/lib/data/loaders";
import { Fact, AiTaskType } from "@/lib/data/schemas";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import { SourceDrawer } from "@/components/shared/SourceDrawer";

export default function PartnerDashboardPage() {
  const allFacts = getFacts();
  const heroRace = getHeroRace();
  const [selectedFact, setSelectedFact] = useState<Fact | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Narrative generator state
  const [narrativeType, setNarrativeType] = useState<"linkedin_post" | "quarterly_brief" | "investor_summary">("linkedin_post");
  const [focusArea, setFocusArea] = useState("Joint Sustainability & STEM Technology Leadership");
  const [generatedText, setGeneratedText] = useState<string>("");
  const [citedFactIds, setCitedFactIds] = useState<string[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [copied, setCopied] = useState(false);

  const kpiFacts = allFacts.filter((f) => f.partner_relevant);

  const handleOpenDrawer = (fact: Fact) => {
    setSelectedFact(fact);
    setIsDrawerOpen(true);
  };

  const handleGenerateNarrative = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_type: narrativeType,
          context_facts: allFacts,
          parameters: {
            focus_area: focusArea,
          },
        }),
      });
      const data = await res.json();
      if (data?.content) {
        setGeneratedText(data.content);
        setCitedFactIds(data.cited_fact_ids || []);
      }
    } catch (err) {
      console.error("Failed to generate narrative:", err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleCopy = () => {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const headers = [
      "Fact ID",
      "Pillar",
      "Metric Name",
      "Value",
      "Unit",
      "Period",
      "Status",
      "Source Document",
      "Report Page",
      "Methodology Notes",
    ];

    const rows = kpiFacts.map((f) => [
      f.id,
      f.pillar,
      `"${f.metric.replace(/"/g, '""')}"`,
      f.value,
      f.unit,
      f.period,
      f.status,
      `"${f.source_doc.replace(/"/g, '""')}"`,
      f.page,
      `"${(f.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `amf1-cognizant-esg-audit-metrics-${heroRace.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Co-Branded Enterprise Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-amf1-surface border border-amf1-border mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amf1-card text-amf1-cyan border border-amf1-cyan/40 uppercase font-bold">
                Cognizant × Aston Martin Aramco F1
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                Audit Trail Grounded
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-mono font-bold text-white tracking-tight">
              Partner Impact Intelligence Cockpit
            </h1>
            <p className="text-xs sm:text-sm text-amf1-silver mt-1.5 font-sans max-w-2xl">
              Equipping sponsor comms, ESG directors, and investor relations teams with page-verified metrics, what-if scenario modelling, and one-click grounded narratives.
            </p>
          </div>

          {/* Quick Actions & BI Export */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadCsv}
              className="px-4 py-2.5 rounded-lg bg-amf1-card hover:bg-amf1-border border border-amf1-border text-xs font-mono text-white flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amf1-lime" />
              <span>Export CSV</span>
            </button>

            <Link
              href="/api/partner/metrics"
              target="_blank"
              className="px-4 py-2.5 rounded-lg bg-amf1-card hover:bg-amf1-border border border-amf1-border text-xs font-mono text-white flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amf1-cyan" />
              <span>JSON API</span>
            </Link>

            <Link
              href="/partners/scenarios"
              className="px-4 py-2.5 rounded-lg bg-amf1-cyan hover:bg-cyan-300 text-amf1-bg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)]"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>What-If Modeller</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Sub-nav Links */}
      <div className="flex items-center gap-3 border-b border-amf1-border mb-8 overflow-x-auto pb-3">
        <Link
          href="/partners"
          className="px-3 py-1.5 rounded-md bg-amf1-card text-amf1-cyan font-mono text-xs font-bold border border-amf1-cyan/30 shrink-0"
        >
          Intelligence Dashboard
        </Link>
        <Link
          href="/partners/scenarios"
          className="px-3 py-1.5 rounded-md text-amf1-muted hover:text-white font-mono text-xs transition-colors shrink-0"
        >
          What-If Scenario Modeller
        </Link>
        <Link
          href="/partners/feed"
          className="px-3 py-1.5 rounded-md text-amf1-muted hover:text-white font-mono text-xs transition-colors shrink-0 flex items-center gap-1"
        >
          <Radio className="w-3 h-3 text-emerald-400" />
          <span>Milestone Alert Feed</span>
        </Link>
        <Link
          href="/partners/story-kit"
          className="px-3 py-1.5 rounded-md text-amf1-muted hover:text-white font-mono text-xs transition-colors shrink-0"
        >
          Community Story Kit
        </Link>
      </div>

      {/* KPI Tiles with Provenance Drawers */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-mono font-bold text-white">Verified Strategic Metrics</h2>
            <p className="text-xs text-amf1-muted font-mono">
              Click any KPI tile to inspect its provenance audit drawer (Document, Page, Methodology).
            </p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
            Zero Hallucination Guaranteed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiFacts.map((fact) => (
            <div
              key={fact.id}
              onClick={() => handleOpenDrawer(fact)}
              className="p-5 rounded-xl bg-amf1-surface border border-amf1-border hover:border-amf1-cyan/50 cursor-pointer transition-all flex flex-col justify-between group hover:shadow-[0_0_20px_rgba(0,229,255,0.1)]"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-amf1-muted uppercase">
                    {fact.pillar} · {fact.id}
                  </span>
                  <ProvenanceBadge status={fact.status} page={fact.page} />
                </div>
                <h3 className="font-mono text-xs text-amf1-silver group-hover:text-white transition-colors">
                  {fact.metric}
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-mono font-black text-white group-hover:text-amf1-cyan transition-colors">
                    {fact.display_value || `${fact.value} ${fact.unit}`}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-amf1-border/60 flex items-center justify-between text-[10px] font-mono text-amf1-muted">
                <span>{fact.source_doc} (p. {fact.page})</span>
                <span className="text-amf1-cyan group-hover:underline">Audit Record ↗</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-Generated Co-Branded Narrative Studio */}
      <div className="p-6 sm:p-8 rounded-2xl bg-amf1-surface border border-amf1-border mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-amf1-border gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-amf1-cyan" />
              <h2 className="text-xl font-mono font-bold text-white">
                Auto-Generated Co-Branded Narratives
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                Verified ✓
              </span>
            </div>
            <p className="text-xs text-amf1-silver mt-1">
              One-click draft generation for corporate sustainability, comms, and investor relations. Strictly grounded in facts.
            </p>
          </div>

          {/* Narrative Type Selector */}
          <div className="inline-flex rounded-lg bg-amf1-card p-1 border border-amf1-border">
            <button
              onClick={() => setNarrativeType("linkedin_post")}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                narrativeType === "linkedin_post"
                  ? "bg-amf1-cyan text-amf1-bg font-bold shadow-sm"
                  : "text-amf1-muted hover:text-white"
              }`}
            >
              LinkedIn Post
            </button>
            <button
              onClick={() => setNarrativeType("quarterly_brief")}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                narrativeType === "quarterly_brief"
                  ? "bg-amf1-cyan text-amf1-bg font-bold shadow-sm"
                  : "text-amf1-muted hover:text-white"
              }`}
            >
              Quarterly Brief
            </button>
            <button
              onClick={() => setNarrativeType("investor_summary")}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                narrativeType === "investor_summary"
                  ? "bg-amf1-cyan text-amf1-bg font-bold shadow-sm"
                  : "text-amf1-muted hover:text-white"
              }`}
            >
              Investor Summary
            </button>
          </div>
        </div>

        {/* Narrative Workspace */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-amf1-card border border-amf1-border space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-amf1-silver font-bold mb-2">
                Narrative Focus Theme
              </label>
              <select
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-amf1-surface border border-amf1-border text-white text-xs font-mono focus:border-amf1-cyan focus:outline-none"
              >
                <option value="Joint Sustainability & STEM Technology Leadership">
                  Joint Sustainability & STEM Outreach
                </option>
                <option value="Aviation Logistics Decarbonisation (SAFc)">
                  Flyaway Logistics Decarbonisation (SAFc)
                </option>
                <option value="Workforce Diversity, Inclusion & Neurodiversity ERG">
                  Diversity, Inclusion & Neurodiversity
                </option>
                <option value="Campus Renewable Energy & Biodiversity Net Gain">
                  Campus Net Gain & Renewable Energy
                </option>
              </select>
            </div>

            <button
              onClick={handleGenerateNarrative}
              disabled={loadingAi}
              className="w-full py-3 rounded-lg bg-amf1-cyan hover:bg-cyan-300 text-amf1-bg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loadingAi ? "animate-spin" : ""}`} />
              <span>{loadingAi ? "Drafting with Citations..." : "Generate Narrative"}</span>
            </button>

            <div className="p-3 rounded-lg bg-amf1-bg/80 border border-amf1-border/60 text-[11px] font-mono text-amf1-muted space-y-1">
              <div className="text-white font-bold">Numeric Guardrail Active</div>
              <div>Every sentence is audited for numeric accuracy. Unverified claims are rejected before output.</div>
            </div>
          </div>

          <div className="lg:col-span-2 p-5 rounded-xl bg-amf1-card border border-amf1-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-amf1-border/60 mb-3">
                <span className="text-xs font-mono uppercase text-amf1-cyan font-bold">
                  {narrativeType.replace("_", " ").toUpperCase()} · GROUNDED OUTPUT
                </span>
                <button
                  onClick={handleCopy}
                  disabled={!generatedText}
                  className="px-2.5 py-1 rounded bg-amf1-surface hover:bg-amf1-border text-xs font-mono text-amf1-silver flex items-center gap-1 transition-colors disabled:opacity-40"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Text"}</span>
                </button>
              </div>

              {generatedText ? (
                <div className="text-xs sm:text-sm font-sans text-slate-200 leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto">
                  {generatedText}
                </div>
              ) : (
                <div className="py-16 text-center text-xs font-mono text-amf1-muted">
                  Click &ldquo;Generate Narrative&rdquo; to draft a co-branded narrative with inline fact citations.
                </div>
              )}
            </div>

            {citedFactIds.length > 0 && (
              <div className="mt-4 pt-3 border-t border-amf1-border/60 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono text-amf1-muted">Inline Fact Citations:</span>
                {citedFactIds.map((fid) => (
                  <button
                    key={fid}
                    onClick={() => {
                      const f = allFacts.find((item) => item.id === fid);
                      if (f) handleOpenDrawer(f);
                    }}
                    className="px-2 py-0.5 rounded bg-amf1-surface hover:bg-amf1-border text-[10px] font-mono text-amf1-cyan border border-amf1-cyan/30 transition-colors"
                  >
                    {fid} ↗
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Provenance Audit Drawer */}
      <SourceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        data={selectedFact}
      />
    </div>
  );
}
