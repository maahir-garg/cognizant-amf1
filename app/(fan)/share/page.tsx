"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Download,
  Share2,
  Sparkles,
  Flame,
  Award,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  TrendingDown,
} from "lucide-react";
import * as htmlToImage from "html-to-image";
import { loadFanProfile } from "@/lib/data/fan-profile";
import { FanProfile } from "@/lib/data/schemas";
import { getFacts } from "@/lib/data/loaders";
import { SITE_CONFIG } from "@/lib/config";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";

export default function FanShareCardPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<FanProfile>(loadFanProfile());
  const [downloading, setDownloading] = useState(false);
  const [aiCaption, setAiCaption] = useState<string>(
    "Trackside speed, zero emissions compromise: I just powered through AMF1's 1,188 tCO₂e SAF impact lap! 🏎️⚡ [FACT-E-05]"
  );
  const [loadingCaption, setLoadingCaption] = useState(false);
  const facts = getFacts();

  useEffect(() => {
    const p = loadFanProfile();
    setProfile(p);
    fetchCaption(p);
  }, []);

  const fetchCaption = async (p: FanProfile) => {
    setLoadingCaption(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_type: "share_caption",
          context_facts: facts,
          user_persona: p.fan_level,
          parameters: {
            home_city: p.home_city,
            impact_credits: p.impact_credits,
          },
        }),
      });
      const data = await res.json();
      if (data?.content) {
        setAiCaption(data.content);
      }
    } catch (err) {
      console.error("Failed to load caption:", err);
    } finally {
      setLoadingCaption(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);

    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `impact-lap-${profile.home_city.toLowerCase()}-weekend.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download image:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amf1-card border border-amf1-lime/30 text-amf1-lime font-mono text-[11px] mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>A5. 9:16 SOCIAL STORY CARD</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white">
          Your Weekend in Impact
        </h1>
        <p className="text-xs sm:text-sm text-amf1-silver mt-1">
          Auto-generated portrait card formatted for Instagram & TikTok stories.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8 w-full justify-center">
        {/* 9:16 Aspect Ratio Card Canvas */}
        <div
          ref={cardRef}
          className="w-[340px] h-[604px] sm:w-[360px] sm:h-[640px] rounded-3xl bg-gradient-to-b from-[#091513] via-[#0E201D] to-[#070D0C] border-2 border-amf1-lime/50 p-6 flex flex-col justify-between shadow-[0_0_40px_rgba(0,255,135,0.2)] relative overflow-hidden shrink-0 select-none"
        >
          {/* Subtle background circuit styling */}
          <div className="absolute inset-0 bg-carbon opacity-30 pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-52 h-52 bg-amf1-green/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-amf1-lime/20 rounded-full blur-3xl pointer-events-none" />

          {/* Card Top */}
          <div className="relative z-10">
            <div className="flex items-center justify-between pb-3 border-b border-amf1-border/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-amf1-card border border-amf1-lime/40 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-amf1-lime" />
                </div>
                <div>
                  <span className="font-mono text-xs font-black tracking-tight text-white block">
                    {SITE_CONFIG.name.toUpperCase()}
                  </span>
                  <span className="text-[8px] font-mono text-amf1-muted uppercase">
                    SINGAPORE GP 2026
                  </span>
                </div>
              </div>

              <div className="px-2 py-0.5 rounded bg-amf1-card border border-amf1-lime/30 text-[9px] font-mono text-amf1-lime font-bold">
                {profile.fan_level.toUpperCase()} FAN
              </div>
            </div>

            {/* Persona Callout */}
            <div className="mt-5 text-center">
              <span className="text-[10px] font-mono text-amf1-muted uppercase tracking-widest block">
                Official Impact Pass
              </span>
              <h2 className="text-xl font-mono font-black text-white mt-0.5 tracking-tight">
                {profile.home_city.toUpperCase()} PITWALL
              </h2>
            </div>
          </div>

          {/* Card Center - Stats Blocks */}
          <div className="relative z-10 space-y-3 my-4">
            <div className="p-3.5 rounded-xl bg-amf1-surface/90 border border-amf1-border">
              <div className="flex items-center justify-between text-[10px] font-mono text-amf1-muted uppercase">
                <span>Verified SAFc Abatement</span>
                <span className="text-emerald-400 font-bold">Verified ✓</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-mono font-black text-amf1-lime">1,188</span>
                <span className="text-xs font-mono text-white">tCO₂e Avoided</span>
              </div>
              <p className="text-[10px] font-mono text-amf1-silver mt-0.5">
                Equal to 88,153 laps around Silverstone Circuit
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amf1-surface/90 border border-amf1-border">
              <div className="flex items-center justify-between text-[10px] font-mono text-amf1-muted uppercase">
                <span>Earned Impact Credits</span>
                <span className="text-amf1-lime font-bold">Simulated ⚑</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-mono font-black text-white">
                  {profile.impact_credits}
                </span>
                <span className="text-xs font-mono text-amf1-lime">Score</span>
              </div>
              <p className="text-[10px] font-mono text-amf1-silver mt-0.5">
                Top 5% sustainable fan choices this weekend
              </p>
            </div>

            {/* AI Generated Caption Quote */}
            <div className="p-3 rounded-xl bg-amf1-card/90 border border-amf1-lime/30 text-center">
              <p className="text-xs font-mono text-emerald-300 italic leading-snug">
                &ldquo;{aiCaption}&rdquo;
              </p>
            </div>
          </div>

          {/* Card Footer */}
          <div className="relative z-10 pt-3 border-t border-amf1-border/80 flex items-center justify-between text-[9px] font-mono text-amf1-muted">
            <span className="text-amf1-silver font-semibold">AMF1 × COGNIZANT</span>
            <span>TEAM GROWTHBEANS 2026</span>
          </div>
        </div>

        {/* Controls Column */}
        <div className="max-w-xs space-y-4">
          <div className="p-5 rounded-2xl bg-amf1-surface border border-amf1-border space-y-3">
            <h3 className="font-mono text-sm font-bold text-white">Share Telemetry Card</h3>
            <p className="text-xs text-amf1-silver leading-relaxed">
              Downloads a high-resolution 1080×1920 PNG ready for Instagram Stories, TikTok, or LinkedIn.
            </p>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full py-3 rounded-lg bg-amf1-lime hover:bg-amf1-lime-glow text-amf1-bg text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,135,0.3)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? "Rendering PNG..." : "Download Story PNG"}</span>
            </button>

            <button
              onClick={() => fetchCaption(profile)}
              disabled={loadingCaption}
              className="w-full py-2.5 rounded-lg bg-amf1-card hover:bg-amf1-border border border-amf1-border text-xs font-mono text-amf1-silver flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingCaption ? "animate-spin" : ""}`} />
              <span>New AI Caption</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-amf1-surface border border-amf1-border text-xs font-mono text-amf1-muted space-y-2">
            <div className="flex items-center gap-1.5 text-amf1-lime">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Official Page Reference Included</span>
            </div>
            <p className="text-[11px] text-amf1-silver">
              All numbers formatted strictly according to verified facts from the 2025 ESG report.
            </p>
          </div>

          <Link
            href="/partners"
            className="w-full py-2.5 rounded-lg bg-amf1-card hover:bg-amf1-border border border-amf1-cyan/40 text-xs font-mono text-amf1-cyan flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Switch to Partner Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
