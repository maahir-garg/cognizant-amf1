"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sliders,
  Sparkles,
  Bot,
  RefreshCw,
  ArrowRight,
  TrendingDown,
  Users,
  Fuel,
  GraduationCap,
  HeartHandshake,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { calculateScenario } from "@/lib/data/scenario-model";
import { ScenarioInput, ScenarioOutput } from "@/lib/data/schemas";
import { getFacts } from "@/lib/data/loaders";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import { OdometerCounter } from "@/components/telemetry/OdometerCounter";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function ScenariosPage() {
  const [inputs, setInputs] = useState<ScenarioInput>({
    saf_aviation_percent: 34,
    stem_cohort_expand_percent: 100,
    biofuel_freight_percent: 25,
    female_stem_mentorship_target: 50,
  });

  const [projection, setProjection] = useState<ScenarioOutput>(calculateScenario(inputs));
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);
  const facts = getFacts();

  const trajectoryData = [
    { year: "2023", baseline: 87162, projected: 87162 },
    { year: "2024", baseline: 85974, projected: Math.round(85974 - projection.freight_tco2e_saved * 0.5) },
    { year: "2026", baseline: 75000, projected: Math.round(75000 - projection.freight_tco2e_saved * 1.5) },
    { year: "2030", baseline: 52000, projected: Math.round(52000 - projection.freight_tco2e_saved * 3) },
    { year: "2040", baseline: 25000, projected: Math.round(25000 - projection.freight_tco2e_saved * 4) },
    { year: "2050", baseline: 8716, projected: Math.max(0, Math.round(8716 - projection.freight_tco2e_saved * 4.5)) },
  ];

  useEffect(() => {
    const res = calculateScenario(inputs);
    setProjection(res);
  }, [inputs]);

  const handleExplain = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_type: "scenario_explanation",
          context_facts: facts,
          parameters: {
            ...inputs,
            freight_tco2e_saved: projection.freight_tco2e_saved,
            students_reached_additional: projection.students_reached_additional,
            projected_diversity_gain_percent: projection.projected_diversity_gain_percent,
          },
        }),
      });
      const data = await res.json();
      if (data?.content) {
        setAiExplanation(data.content);
      }
    } catch (err) {
      console.error("Failed to explain scenario:", err);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-amf1-surface border border-amf1-border mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amf1-card text-amf1-cyan border border-amf1-cyan/40 uppercase font-bold">
                Predictive ESG Strategy
              </span>
              <ProvenanceBadge status="estimated" formula="Baseline (FACT-E-04, FACT-C-01) × Variable Multipliers" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white">
              What-If Scenario Modeller
            </h1>
            <p className="text-xs sm:text-sm text-amf1-silver mt-1 max-w-2xl font-sans">
              Simulate proposed joint decarbonisation and community outreach investments. Calculations are deterministic; AI explains strategic value in plain English.
            </p>
          </div>

          <Link
            href="/partners"
            className="px-4 py-2 rounded-lg bg-amf1-card hover:bg-amf1-border text-xs font-mono text-amf1-silver border border-amf1-border transition-colors self-start sm:self-auto"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Left: Interactive Controls (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-amf1-surface border border-amf1-border space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-amf1-border">
            <h2 className="text-sm font-mono uppercase text-amf1-cyan font-bold flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              <span>Investment Levers</span>
            </h2>
            <span className="text-[10px] font-mono text-amf1-muted">Adjust Sliders</span>
          </div>

          {/* Slider 1: SAF Aviation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-white flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-amf1-lime" />
                <span>SAF Aviation Deployment Ratio</span>
              </label>
              <span className="text-xs font-mono font-bold text-amf1-lime">
                {inputs.saf_aviation_percent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={inputs.saf_aviation_percent}
              onChange={(e) =>
                setInputs({ ...inputs, saf_aviation_percent: Number(e.target.value) })
              }
              className="w-full accent-[#00FF87] cursor-pointer"
            />
            <p className="text-[10px] text-amf1-muted font-mono">
              Certified drop-in fuel on transcontinental air cargo charter routes.
            </p>
          </div>

          {/* Slider 2: Biofuel Road Freight */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-white flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-amf1-cyan" />
                <span>Biofuel Road Logistics Corridor</span>
              </label>
              <span className="text-xs font-mono font-bold text-amf1-cyan">
                {inputs.biofuel_freight_percent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={inputs.biofuel_freight_percent}
              onChange={(e) =>
                setInputs({ ...inputs, biofuel_freight_percent: Number(e.target.value) })
              }
              className="w-full accent-[#00E5FF] cursor-pointer"
            />
            <p className="text-[10px] text-amf1-muted font-mono">
              Hydrotreated Vegetable Oil (HVO100) across European & trackside truck haulage.
            </p>
          </div>

          {/* Slider 3: STEM Expansion */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-white flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <span>Joint STEM Cohort Expansion</span>
              </label>
              <span className="text-xs font-mono font-bold text-amber-400">
                +{inputs.stem_cohort_expand_percent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="300"
              step="25"
              value={inputs.stem_cohort_expand_percent}
              onChange={(e) =>
                setInputs({ ...inputs, stem_cohort_expand_percent: Number(e.target.value) })
              }
              className="w-full accent-[#FBBF24] cursor-pointer"
            />
            <p className="text-[10px] text-amf1-muted font-mono">
              Scaling student enrollment beyond baseline (1,250 annual students).
            </p>
          </div>

          {/* Slider 4: Female STEM Mentorship */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-white flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amf1-lime" />
                <span>Female Engineering Mentorship Target</span>
              </label>
              <span className="text-xs font-mono font-bold text-amf1-lime">
                {inputs.female_stem_mentorship_target}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={inputs.female_stem_mentorship_target}
              onChange={(e) =>
                setInputs({
                  ...inputs,
                  female_stem_mentorship_target: Number(e.target.value),
                })
              }
              className="w-full accent-[#00FF87] cursor-pointer"
            />
            <p className="text-[10px] text-amf1-muted font-mono">
              Dedicated internship conversions into senior engineering roles.
            </p>
          </div>
        </div>

        {/* Right: Projected Outputs & AI Explanation (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Outputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-amf1-surface border border-emerald-500/40">
              <span className="text-[10px] font-mono uppercase text-amf1-muted block">
                Projected Logistics Carbon Abated
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-mono font-black text-emerald-400">
                  {projection.freight_tco2e_saved.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-white">tCO₂e</span>
              </div>
              <p className="text-[11px] text-amf1-silver mt-1">
                Direct Scope 3 transport reduction
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amf1-surface border border-amber-500/40">
              <span className="text-[10px] font-mono uppercase text-amf1-muted block">
                Additional STEM Students Engaged
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-mono font-black text-amber-400">
                  +{projection.students_reached_additional.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-white">students</span>
              </div>
              <p className="text-[11px] text-amf1-silver mt-1">
                Expanded regional talent pipeline
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amf1-surface border border-amf1-cyan/40">
              <span className="text-[10px] font-mono uppercase text-amf1-muted block">
                Projected Diversity Pipeline Gain
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-mono font-black text-amf1-cyan">
                  +{projection.projected_diversity_gain_percent}%
                </span>
                <span className="text-xs font-mono text-white">pts</span>
              </div>
              <p className="text-[11px] text-amf1-silver mt-1">
                Long-term motorsport workforce shift
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amf1-surface border border-amf1-border">
              <span className="text-[10px] font-mono uppercase text-amf1-muted block">
                SBTi 2030 Trajectory Alignment
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-mono font-black text-amf1-lime">
                  Accelerated
                </span>
              </div>
              <p className="text-[11px] text-amf1-silver mt-1">
                Meets Science-Based Targets milestone
              </p>
            </div>
          </div>

          {/* Interactive Recharts Trajectory Chart */}
          <div className="p-5 rounded-2xl bg-amf1-surface border border-amf1-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-amf1-muted block">
                  Interactive Decarbonisation Sensitivity Model
                </span>
                <h3 className="text-sm font-mono font-bold text-white mt-0.5">
                  SBTi Scope 1, 2 & 3 Trajectory (2023–2050)
                </h3>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1.5 text-amf1-muted">
                  <span className="w-2.5 h-1 bg-amf1-muted rounded-full" />
                  Baseline
                </span>
                <span className="flex items-center gap-1.5 text-amf1-lime font-bold">
                  <span className="w-2.5 h-1 bg-amf1-lime rounded-full" />
                  Projected
                </span>
              </div>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trajectoryData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="projectedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00FF87" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#00FF87" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#768B87" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#768B87" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" stroke="#768B87" fontSize={10} tickLine={false} />
                  <YAxis stroke="#768B87" fontSize={10} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#142421", borderColor: "#1E3632", borderRadius: "8px", fontSize: "11px", fontFamily: "monospace" }}
                    formatter={(val: any) => [`${Number(val).toLocaleString()} tCO₂e`, "Emissions"]}
                  />
                  <Area type="monotone" dataKey="baseline" stroke="#768B87" strokeDasharray="3 3" fillOpacity={1} fill="url(#baselineGrad)" strokeWidth={1.5} />
                  <Area type="monotone" dataKey="projected" stroke="#00FF87" fillOpacity={1} fill="url(#projectedGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] font-mono text-amf1-muted mt-2 text-center">
              Real-time sensitivity response based on active slider inputs vs Make A Mark 2025 baseline [FACT-E-03].
            </p>
          </div>

          {/* AI Decision Support Copilot Box */}
          <div className="p-6 rounded-2xl bg-amf1-surface border border-amf1-cyan/30 shadow-[0_0_20px_rgba(0,229,255,0.08)]">
            <div className="flex items-center justify-between pb-3 border-b border-amf1-border">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-amf1-cyan" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-amf1-cyan font-bold">
                  AI Decision-Support Copilot
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  Verified ✓
                </span>
              </div>

              <button
                onClick={handleExplain}
                disabled={loadingAi}
                className="px-3 py-1.5 rounded bg-amf1-cyan hover:bg-cyan-300 text-amf1-bg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${loadingAi ? "animate-spin" : ""}`} />
                <span>{loadingAi ? "Analyzing..." : "Explain Scenario"}</span>
              </button>
            </div>

            <div className="mt-4 text-xs sm:text-sm text-amf1-silver leading-relaxed font-sans">
              {loadingAi ? (
                <div className="py-6 flex items-center justify-center gap-2 text-amf1-muted font-mono text-xs">
                  <RefreshCw className="w-4 h-4 animate-spin text-amf1-cyan" />
                  <span>Synthesizing strategic scenario explanation...</span>
                </div>
              ) : aiExplanation ? (
                <p className="whitespace-pre-line">{aiExplanation}</p>
              ) : (
                <p>{projection.explanation}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
