"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  Plane,
  Home,
  Trees,
  Smartphone,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Radio,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  HelpCircle,
} from "lucide-react";
import { getRaces, getHeroRace, getConversionFactors, getInitiativesByRace, getEvents } from "@/lib/data/loaders";
import { calculateEquivalents } from "@/lib/data/equivalents";
import { loadFanProfile } from "@/lib/data/fan-profile";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import { SourceDrawer, DrawerDetailItem } from "@/components/shared/SourceDrawer";
import { OdometerCounter } from "@/components/telemetry/OdometerCounter";
import { RpmGauge } from "@/components/telemetry/RpmGauge";
import { TimingDeltaBadge } from "@/components/telemetry/TimingDeltaBadge";

export default function CarbonTrackerPage() {
  const races = getRaces();
  const [selectedRaceSlug, setSelectedRaceSlug] = useState("singapore-gp");
  const [viewMode, setViewMode] = useState<"equivalents" | "raw">("equivalents");
  const [fanProfile, setFanProfile] = useState(loadFanProfile());
  const [selectedDrawerItem, setSelectedDrawerItem] = useState<DrawerDetailItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    setFanProfile(loadFanProfile());
  }, []);

  const currentRace = races.find((r) => r.slug === selectedRaceSlug) || races[0];
  const equivalents = calculateEquivalents(currentRace.total_tco2e);
  const localInitiatives = getInitiativesByRace(currentRace.slug);
  const liveEvents = getEvents();

  const openDrawer = (item: DrawerDetailItem) => {
    setSelectedDrawerItem(item);
    setIsDrawerOpen(true);
  };

  const equivalentIcons: Record<string, any> = {
    Trees: Trees,
    Home: Home,
    Plane: Plane,
    Smartphone: Smartphone,
  };

  return (
    <div className="flex-1 flex flex-col py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-amf1-surface border border-amf1-border mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amf1-card text-amf1-lime text-xs font-mono font-bold border border-amf1-lime/30">
              RACE WEEKEND CARBON TELEMETRY
            </span>
            <ProvenanceBadge
              status={currentRace.status}
              formula={currentRace.notes}
              onClick={() =>
                openDrawer({
                  title: `${currentRace.name} Carbon Telemetry`,
                  metric: "Estimated Race Weekend Logistics",
                  value: `${currentRace.total_tco2e} tCO₂e`,
                  status: currentRace.status,
                  period: "2026 Calendar",
                  source_doc: "Make A Mark ESG Report 2025",
                  page: 18,
                  formula: "Seasonal Freight Baseline (5,560.45 tCO₂e / 24) + Flyaway travel allocation",
                  notes: currentRace.notes,
                })
              }
            />
          </div>
          <h1 className="text-2xl sm:text-4xl font-mono font-black text-white tracking-tight">
            {currentRace.name}
          </h1>
          <p className="text-xs sm:text-sm text-amf1-silver mt-1 font-sans flex items-center gap-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amf1-lime" />
              {currentRace.circuit}, {currentRace.city}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amf1-lime" />
              {currentRace.dates}
            </span>
          </p>
        </div>

        {/* Race Selector Dropdown */}
        <div className="relative z-10 flex items-center gap-3">
          <span className="text-xs font-mono text-amf1-muted">Select GP:</span>
          <select
            value={selectedRaceSlug}
            onChange={(e) => setSelectedRaceSlug(e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-amf1-card border border-amf1-border text-white text-xs font-mono focus:border-amf1-lime focus:outline-none"
          >
            {races.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.name} {r.slug === "singapore-gp" ? "(Hero Weekend)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Status & Delta Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="p-5 rounded-xl bg-amf1-surface border border-amf1-border">
          <div className="flex items-center justify-between text-xs font-mono text-amf1-muted uppercase">
            <span>Total Logistics Footprint</span>
            <ProvenanceBadge status="estimated" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-black text-white">
              <OdometerCounter value={currentRace.total_tco2e} decimals={2} />
            </span>
            <span className="text-xs font-mono text-amf1-lime">tCO₂e</span>
          </div>
          <p className="text-[11px] text-amf1-muted mt-1 font-mono">
            Freight: {currentRace.freight_tco2e} tCO₂e | Travel: {currentRace.travel_tco2e} tCO₂e
          </p>
        </div>

        <div className="p-5 rounded-xl bg-amf1-surface border border-emerald-500/30">
          <div className="flex items-center justify-between text-xs font-mono text-emerald-400 uppercase">
            <span>Vs Prior Baseline</span>
            <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              <TrendingDown className="w-3 h-3" />
              SAFc Abated
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-black text-emerald-400">
              <OdometerCounter value={Math.abs(currentRace.delta_percent)} decimals={1} prefix="-" suffix="%" />
            </span>
            <span className="text-xs font-mono text-amf1-muted">net reduction</span>
          </div>
          <p className="text-[11px] text-emerald-300/80 mt-1 font-sans">
            Responsible: {currentRace.responsible_initiatives[0]}
          </p>
        </div>

        <div className="p-5 rounded-xl bg-amf1-surface border border-amf1-border">
          <div className="flex items-center justify-between text-xs font-mono text-amf1-muted uppercase">
            <span>Certified SAF Uptake</span>
            <ProvenanceBadge status="verified" page={9} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-black text-amf1-cyan">
              <OdometerCounter value={currentRace.saf_uptake_percent} decimals={0} suffix="%" />
            </span>
            <span className="text-xs font-mono text-amf1-muted">corridor blend</span>
          </div>
          <p className="text-[11px] text-amf1-muted mt-1 font-sans">
            High-integrity DHL Sustainable Aviation Fuel batch
          </p>
        </div>
      </div>

      {/* Pitwall Telemetry Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <RpmGauge
          value={currentRace.saf_uptake_percent}
          label="Sustainable Aviation Fuel (SAFc) Logistics Corridor Blend"
          unit="%"
          colorScheme="lime"
        />
        <RpmGauge
          value={Math.round((currentRace.total_tco2e / 500) * 100)}
          label="Race Weekend Carbon Budget Allocated (500 tCO₂e Target Cap)"
          unit="%"
          colorScheme="racing"
        />
      </div>

      {/* Relatable Equivalents Switcher */}
      <div className="p-6 sm:p-8 rounded-2xl bg-amf1-surface border border-amf1-border mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-amf1-border gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-mono font-bold text-white">
                Tangible Human-Scale Equivalencies
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amf1-card border border-amf1-lime/30 text-amf1-lime">
                Zero AI Hallucination · DEFRA & EPA Cited
              </span>
            </div>
            <p className="text-xs text-amf1-silver mt-1">
              Transforming abstract tonnes of CO₂ into concrete, relatable real-world benchmarks.
            </p>
          </div>

          {/* Toggle Button */}
          <div className="inline-flex rounded-lg bg-amf1-card p-1 border border-amf1-border">
            <button
              onClick={() => setViewMode("equivalents")}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                viewMode === "equivalents"
                  ? "bg-amf1-lime text-amf1-bg font-bold shadow-sm"
                  : "text-amf1-muted hover:text-white"
              }`}
            >
              Relatable Equivalents
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                viewMode === "raw"
                  ? "bg-amf1-lime text-amf1-bg font-bold shadow-sm"
                  : "text-amf1-muted hover:text-white"
              }`}
            >
              Raw tCO₂e Values
            </button>
          </div>
        </div>

        {/* Equivalents Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {equivalents.map((eq) => {
            const Icon = equivalentIcons[eq.factor.icon] || Flame;
            return (
              <div
                key={eq.factor.id}
                onClick={() =>
                  openDrawer({
                    title: eq.factor.label,
                    metric: "Carbon Conversion Factor",
                    value: `${eq.factor.factor_per_tco2e} ${eq.factor.unit_label} / tCO₂e`,
                    status: eq.factor.status,
                    source_doc: eq.factor.source_name,
                    formula: `Total Race tCO₂e (${currentRace.total_tco2e}) × Factor (${eq.factor.factor_per_tco2e})`,
                    notes: `${eq.factor.description} (Ref: ${eq.factor.source_url})`,
                  })
                }
                className="p-5 rounded-xl bg-amf1-card border border-amf1-border hover:border-amf1-lime/40 cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-amf1-surface border border-amf1-border text-amf1-lime group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <ProvenanceBadge status="verified" />
                  </div>
                  <h3 className="text-xs font-mono text-amf1-silver uppercase tracking-wide">
                    {eq.factor.label}
                  </h3>
                  <div className="mt-2">
                    <span className="text-2xl sm:text-3xl font-mono font-black text-white group-hover:text-amf1-lime transition-colors">
                      {viewMode === "equivalents"
                        ? eq.formatted_value
                        : `${currentRace.total_tco2e} tCO₂e`}
                    </span>
                    <span className="block text-[11px] font-mono text-amf1-muted mt-0.5">
                      {viewMode === "equivalents" ? eq.factor.unit_label : "Logistics footprint"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-amf1-border/60 flex items-center justify-between text-[10px] font-mono text-amf1-muted">
                  <span>Source: {eq.factor.source_name.split(" ")[0]}</span>
                  <span className="text-amf1-lime">Inspect Formula ↗</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audience A4: Personalised Relevance Engine */}
      <div className="p-6 sm:p-8 rounded-2xl bg-amf1-surface border border-amf1-lime/30 mb-8 relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-amf1-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amf1-lime" />
            <h2 className="text-sm font-mono uppercase tracking-wider text-amf1-lime font-bold">
              A4. Personalised Relevance Engine · {fanProfile.home_city} Match
            </h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amf1-card text-amf1-silver border border-amf1-border">
            Matched to your profile: {fanProfile.home_city} + {fanProfile.interests.join(", ")}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {localInitiatives.length > 0 ? (
              localInitiatives.map((init) => (
                <div key={init.id} className="p-5 rounded-xl bg-amf1-card border border-amf1-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amf1-surface text-amf1-lime border border-amf1-lime/30">
                      {init.badge} · {init.partner}
                    </span>
                    <ProvenanceBadge status={init.status} />
                  </div>
                  <h3 className="text-lg font-mono font-bold text-white">{init.title}</h3>
                  <p className="text-xs text-amf1-silver mt-1 leading-relaxed">
                    {init.description}
                  </p>

                  <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-amf1-border/60">
                    {init.metrics.map((m, idx) => (
                      <div key={idx}>
                        <span className="text-[10px] font-mono text-amf1-muted block">{m.label}</span>
                        <span className="text-base font-mono font-bold text-white">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-5 rounded-xl bg-amf1-card text-xs text-amf1-muted font-mono">
                No direct local initiative in {currentRace.name}; showing global Make A Mark outreach.
              </div>
            )}
          </div>

          <div className="p-5 rounded-xl bg-amf1-card border border-amf1-border flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-mono font-bold text-white mb-2">Take Race Weekend Action</h3>
              <p className="text-xs text-amf1-silver leading-relaxed mb-4">
                Pick sustainable trackside travel or join local community STEM workshops to earn simulated Impact Credits.
              </p>
              <div className="p-3 rounded-lg bg-amf1-bg border border-amf1-border/60 text-xs font-mono text-amf1-lime">
                +40 to +60 Credits available for verified low-carbon circuit transit.
              </div>
            </div>

            <Link
              href="/actions"
              className="mt-4 w-full py-2.5 rounded bg-amf1-lime hover:bg-amf1-lime-glow text-amf1-bg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,255,135,0.2)]"
            >
              <span>Choose Sustainable Options</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Simulated Live Event Stream */}
      <div className="p-6 rounded-2xl bg-amf1-surface border border-amf1-border">
        <div className="flex items-center justify-between pb-3 border-b border-amf1-border">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
              Race Week Operations Stream (Simulated Live Feed)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
            SIMULATED ⚑ Event Replay
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {liveEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-3.5 rounded-lg bg-amf1-card border border-amf1-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amf1-lime shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white">{evt.title}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amf1-bg text-amf1-silver border border-amf1-border">
                      {evt.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-amf1-silver mt-0.5">{evt.description}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono text-amf1-muted block">
                  T-{evt.elapsed_min}m ago
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Provenance Drawer */}
      <SourceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        data={selectedDrawerItem}
      />
    </div>
  );
}
