"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HeartHandshake,
  Bot,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
} from "lucide-react";
import { getInitiatives, getFacts } from "@/lib/data/loaders";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";

export default function PartnerStoryKitPage() {
  const initiatives = getInitiatives();
  const [selectedInitId, setSelectedInitId] = useState(initiatives[0]?.id || "INIT-STEM-SG");
  const [storyCopy, setStoryCopy] = useState<string>(
    "Through the Make A Mark initiative, Aston Martin Aramco is breaking down systemic barriers in STEM. Building on 300+ students from 14 schools welcomed to campus [FACT-C-01] and £300,000 raised for community causes [FACT-C-03], our partner programmes deliver real career opportunities in high-performance technology."
  );
  const [loadingStory, setLoadingStory] = useState(false);
  const [copied, setCopied] = useState(false);
  const facts = getFacts();

  const currentInit = initiatives.find((i) => i.id === selectedInitId) || initiatives[0];

  const handleGenerateStory = async () => {
    setLoadingStory(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_type: "community_story",
          context_facts: facts,
          parameters: {
            initiative_title: currentInit.title,
            partner_name: currentInit.partner,
          },
        }),
      });
      const data = await res.json();
      if (data?.content) {
        setStoryCopy(data.content);
      }
    } catch (err) {
      console.error("Failed to generate community story:", err);
    } finally {
      setLoadingStory(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(storyCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-amf1-surface border border-amf1-border mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <HeartHandshake className="w-4 h-4 text-amf1-lime" />
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amf1-card text-amf1-lime border border-amf1-lime/40 uppercase font-bold">
              B2. Community Partner Story Kit
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white">
            Partner Story Kit
          </h1>
          <p className="text-xs sm:text-sm text-amf1-silver mt-1 font-sans">
            Enabling charities and NGOs in the Make A Mark programme to communicate their verified impact with auto-drafted narrative copy.
          </p>
        </div>

        <Link
          href="/partners"
          className="px-4 py-2 rounded-lg bg-amf1-card hover:bg-amf1-border text-xs font-mono text-amf1-silver border border-amf1-border transition-colors self-start sm:self-auto"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Main Kit Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Select Initiative */}
        <div className="p-5 rounded-2xl bg-amf1-surface border border-amf1-border space-y-4">
          <label className="block text-xs font-mono uppercase text-amf1-silver font-bold">
            Select Partner Initiative
          </label>
          <div className="space-y-2">
            {initiatives.map((init) => {
              const isSelected = selectedInitId === init.id;
              return (
                <button
                  key={init.id}
                  onClick={() => setSelectedInitId(init.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-amf1-card border-amf1-lime ring-1 ring-amf1-lime"
                      : "bg-amf1-card/50 border-amf1-border hover:border-amf1-border/90"
                  }`}
                >
                  <span className="text-[10px] font-mono text-amf1-lime block">
                    {init.partner} · {init.pillar}
                  </span>
                  <span className="text-xs font-mono font-bold text-white block mt-0.5">
                    {init.title}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleGenerateStory}
            disabled={loadingStory}
            className="w-full py-2.5 rounded-lg bg-amf1-lime hover:bg-amf1-lime-glow text-amf1-bg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,255,135,0.2)] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStory ? "animate-spin" : ""}`} />
            <span>{loadingStory ? "Drafting..." : "Auto-Draft Story Copy"}</span>
          </button>
        </div>

        {/* Right Column: Draft Story & Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-amf1-surface border border-amf1-border">
            <div className="flex items-center justify-between pb-3 border-b border-amf1-border/70 mb-4">
              <span className="text-xs font-mono uppercase text-amf1-lime font-bold">
                Auto-Drafted Impact Narrative
              </span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded bg-amf1-card hover:bg-amf1-border text-xs font-mono text-amf1-silver flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Story"}</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm font-sans text-slate-200 leading-relaxed whitespace-pre-line">
              {storyCopy}
            </p>

            <div className="mt-4 pt-3 border-t border-amf1-border/60 flex items-center justify-between text-[11px] font-mono text-amf1-muted">
              <span>UN SDGs Aligned: {currentInit.un_sdgs.map((s) => `Goal ${s}`).join(", ")}</span>
              <span className="text-emerald-400">Verified ✓ Citations Attached</span>
            </div>
          </div>

          {/* Quick Preview Badge */}
          <div className="p-5 rounded-xl bg-amf1-card border border-amf1-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-amf1-surface border border-amf1-lime/30 text-amf1-lime">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-mono font-bold text-white">
                  Co-Branded Social Kit Ready
                </h4>
                <p className="text-[11px] text-amf1-silver">
                  Approved for press releases, charity donor reports, and LinkedIn updates.
                </p>
              </div>
            </div>
            <ProvenanceBadge status="verified" />
          </div>
        </div>
      </div>
    </div>
  );
}
