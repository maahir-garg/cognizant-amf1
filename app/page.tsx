"use client";

import React from "react";
import Link from "next/link";
import {
  Flame,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingDown,
  BarChart3,
  Users,
  Compass,
  CheckCircle2,
  Share2,
  Sliders,
  Cpu,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import { getFacts, getHeroRace } from "@/lib/data/loaders";

export default function HomePage() {
  const heroRace = getHeroRace();
  const facts = getFacts();

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-amf1-border/50 bg-gradient-to-b from-amf1-surface/60 via-amf1-bg to-amf1-bg">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-carbon opacity-40 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amf1-green/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          {/* Header pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amf1-card border border-amf1-lime/40 text-amf1-lime text-xs font-mono mb-6 shadow-[0_0_15px_rgba(0,255,135,0.15)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gen-AI Ideathon 2026 · Singapore GP Weekend</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amf1-lime" />
            <span className="text-white">Cognizant × Aston Martin Aramco F1</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-mono font-black tracking-tight text-white max-w-4xl">
            EVERY TENTH OF A SECOND. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amf1-lime via-emerald-300 to-amf1-cyan text-glow-lime">
              EVERY TONNE OF IMPACT.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-amf1-silver max-w-2xl font-sans leading-relaxed">
            AI-driven sustainability and inclusion telemetry. Turning official ESG reports into interactive fan journeys and auditable partner intelligence.
          </p>

          {/* Quick Dual CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-amf1-lime hover:bg-amf1-lime-glow text-amf1-bg font-mono font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,135,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              <Users className="w-4 h-4" />
              <span>Launch Fan Experience</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/partners"
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-amf1-card hover:bg-amf1-hover border border-amf1-border text-white font-mono font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:border-amf1-lime/50"
            >
              <BarChart3 className="w-4 h-4 text-amf1-cyan" />
              <span>Open Partner Intelligence</span>
            </Link>
          </div>

          {/* Golden Path Highlights / Trust Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-amf1-muted">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              100% Page-Referenced Official ESG Data
            </span>
            <span className="text-amf1-border">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amf1-cyan" />
              AI Output Guardrail (Numeric Zero-Hallucination)
            </span>
            <span className="text-amf1-border">•</span>
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-amf1-lime" />
              Offline Demo Mode Ready
            </span>
          </div>
        </div>
      </section>

      {/* Hero Race Weekend Snapshot Banner */}
      <section className="border-b border-amf1-border/40 bg-amf1-surface/40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-amf1-card/60 border border-amf1-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amf1-green/40 border border-amf1-lime/30 flex items-center justify-center">
                <Flame className="w-5 h-5 text-amf1-lime" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase text-amf1-lime font-bold">Upcoming Grand Prix</span>
                  <ProvenanceBadge status={heroRace.status} formula="Seasonal avg + flyaway routing" />
                </div>
                <h3 className="text-base font-mono font-bold text-white">
                  {heroRace.name} · {heroRace.circuit} ({heroRace.dates})
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-xs font-mono text-amf1-muted uppercase block">Estimated Logistics tCO₂e</span>
                <span className="text-lg font-mono font-bold text-amf1-lime">
                  {heroRace.freight_tco2e} tCO₂e
                </span>
              </div>
              <div className="h-8 w-px bg-amf1-border hidden sm:block" />
              <div className="text-right">
                <span className="text-xs font-mono text-amf1-muted uppercase block">SAFc Decarbonisation</span>
                <span className="text-lg font-mono font-bold text-emerald-400">
                  {heroRace.delta_percent}% vs 2023
                </span>
              </div>
              <Link
                href="/tracker"
                className="px-4 py-2 rounded bg-amf1-surface hover:bg-amf1-border text-xs font-mono text-white font-medium border border-amf1-border transition-colors"
              >
                Track Live →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Audience Product Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-amf1-lime font-bold">
            Tailored Experiences
          </span>
          <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white mt-1">
            Built for Fans. Engineered for Partners.
          </h2>
          <p className="text-sm text-amf1-silver max-w-xl mx-auto mt-2">
            Targeting the two key audiences identified in the ideathon brief with personalized, grounded value.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Audience A: Fan Experience */}
          <div className="p-8 rounded-2xl bg-amf1-surface border border-amf1-border hover:border-amf1-lime/40 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded bg-amf1-card border border-amf1-lime/30 text-amf1-lime">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-mono font-bold text-white group-hover:text-amf1-lime transition-colors">
                      Audience A: F1 Fans
                    </h3>
                    <p className="text-xs text-amf1-muted font-mono">Personalised, tangible, action-oriented</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amf1-card text-amf1-lime border border-amf1-lime/30">
                  Interactive Story
                </span>
              </div>

              <p className="text-sm text-amf1-silver leading-relaxed mb-6">
                Most ESG reporting targets auditors. Impact Lap puts fans in the cockpit with a fast 30-second onboarding, interactive quiz beats, real-time carbon equivalents, and downloadable 9:16 social share cards.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2.5 text-xs text-amf1-silver">
                  <CheckCircle2 className="w-4 h-4 text-amf1-lime shrink-0 mt-0.5" />
                  <span><strong>A1. Personalised Onboarding:</strong> Tailored depth for New, Casual, or Die-hard fans.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-amf1-silver">
                  <CheckCircle2 className="w-4 h-4 text-amf1-lime shrink-0 mt-0.5" />
                  <span><strong>A2. Interactive Story Lap:</strong> ESG pillars with pop-up quiz moments & reveal badges.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-amf1-silver">
                  <CheckCircle2 className="w-4 h-4 text-amf1-lime shrink-0 mt-0.5" />
                  <span><strong>A3. Live Carbon Equivalents:</strong> Freight emissions in homes powered & flights avoided.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-amf1-silver">
                  <CheckCircle2 className="w-4 h-4 text-amf1-lime shrink-0 mt-0.5" />
                  <span><strong>A5. 9:16 Story Share Card:</strong> Instantly downloadable PNG for Instagram/TikTok.</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-amf1-border/60 flex items-center justify-between">
              <Link
                href="/onboarding"
                className="px-5 py-2.5 rounded bg-amf1-lime text-amf1-bg font-mono font-bold text-xs hover:bg-amf1-lime-glow transition-all flex items-center gap-1.5"
              >
                <span>Start Fan Onboarding (30s)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/journey" className="text-xs font-mono text-amf1-muted hover:text-white transition-colors">
                Skip to Story Lap →
              </Link>
            </div>
          </div>

          {/* Audience B: Partner Intelligence */}
          <div className="p-8 rounded-2xl bg-amf1-surface border border-amf1-border hover:border-amf1-cyan/40 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded bg-amf1-card border border-amf1-cyan/30 text-amf1-cyan">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-mono font-bold text-white group-hover:text-amf1-cyan transition-colors">
                      Audience B: Cognizant & Partners
                    </h3>
                    <p className="text-xs text-amf1-muted font-mono">Auditable, co-branded, decision-ready</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amf1-card text-amf1-cyan border border-amf1-cyan/30">
                  Enterprise Intelligence
                </span>
              </div>

              <p className="text-sm text-amf1-silver leading-relaxed mb-6">
                Sponsors need to justify spend internally and prove ESG alignment to stakeholders. Impact Lap provides an auditable KPI dashboard, one-click grounded narratives, what-if scenario modelling, and BI exports.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2.5 text-xs text-amf1-silver">
                  <CheckCircle2 className="w-4 h-4 text-amf1-cyan shrink-0 mt-0.5" />
                  <span><strong>B1. Auditable Provenance:</strong> Every KPI opens an official report & page drawer.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-amf1-silver">
                  <CheckCircle2 className="w-4 h-4 text-amf1-cyan shrink-0 mt-0.5" />
                  <span><strong>B1. Grounded Narratives:</strong> One-click LinkedIn, brief, & investor summaries.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-amf1-silver">
                  <CheckCircle2 className="w-4 h-4 text-amf1-cyan shrink-0 mt-0.5" />
                  <span><strong>B1. What-If Scenario Modeller:</strong> Sliders for SAF & STEM expansion projections.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-amf1-silver">
                  <CheckCircle2 className="w-4 h-4 text-amf1-cyan shrink-0 mt-0.5" />
                  <span><strong>B1. Live Milestone Stream & API:</strong> Real-time race week event trigger engine.</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-amf1-border/60 flex items-center justify-between">
              <Link
                href="/partners"
                className="px-5 py-2.5 rounded bg-amf1-cyan text-amf1-bg font-mono font-bold text-xs hover:bg-cyan-300 transition-all flex items-center gap-1.5"
              >
                <span>Open Partner Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/partners/scenarios" className="text-xs font-mono text-amf1-muted hover:text-white transition-colors">
                Explore What-If Modeller →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
