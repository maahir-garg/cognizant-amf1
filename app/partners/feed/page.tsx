"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Radio,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  Share2,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Award,
} from "lucide-react";
import { getEvents, getFacts } from "@/lib/data/loaders";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";

interface MilestoneItem {
  id: string;
  title: string;
  timestamp: string;
  thresholdLabel: string;
  description: string;
  factRef: string;
  suggestedPost: string;
  status: "simulated" | "verified";
}

const MILESTONES: MilestoneItem[] = [
  {
    id: "m-stem-1400",
    title: "Joint STEM Programme Crosses 1,400 Students Milestone",
    timestamp: "2026-10-08 16:45 SGT",
    thresholdLabel: "Threshold: 1,250 → 1,400+ Students",
    description: "With the Singapore GP secondary school telemetry cohort onboarded, the Cognizant × Make A Mark partnership officially surpasses its annual student reach target.",
    factRef: "FACT-C-01",
    suggestedPost: "Exciting milestone ahead of the Singapore GP! The joint Cognizant and Aston Martin Aramco F1 STEM Lab has officially expanded our 2026 outreach past 1,400 students [FACT-C-01]. Empowering diverse minds to code live race telemetry is how we make a lasting mark beyond the track. #Cognizant #AMF1 #STEM #MakeAMark",
    status: "simulated",
  },
  {
    id: "m-saf-batch",
    title: "Changi Flyaway Charter SAFc Batch Verified",
    timestamp: "2026-10-07 14:15 SGT",
    thresholdLabel: "Threshold: 30%+ SAF Blend Target",
    description: "DHL Global Forwarding confirms 34% Sustainable Aviation Fuel certificate allocation, directly saving over 70 tCO₂e on chassis transit flights.",
    factRef: "FACT-E-05",
    suggestedPost: "Proving that transcontinental motorsport logistics can decarbonise: AMF1 and DHL deployed 34% certified Sustainable Aviation Fuel certificates for Singapore GP flyaway freight, building on 1,188 tCO₂e abated across our season calendar [FACT-E-05]. #SustainableMotorsport #Decarbonisation #AMF1",
    status: "simulated",
  },
  {
    id: "m-renewable-campus",
    title: "AMR Technology Campus Maintained 100% Certified Renewable Energy",
    timestamp: "2026-10-06 09:00 SGT",
    thresholdLabel: "Threshold: 100% REGO Supply",
    description: "Continuous zero-fossil electricity monitoring at the Silverstone Technology Campus verified by third-party audit.",
    factRef: "FACT-E-07",
    suggestedPost: "Performance engineered with clean energy: Aston Martin Aramco's state-of-the-art Technology Campus continues to run on 100% certified renewable electricity with on-site solar contributing to a 23% emissions decrease [FACT-E-07]. #CleanTech #MakeAMark",
    status: "verified",
  },
];

export default function PartnerMilestonesFeedPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-amf1-surface border border-amf1-border mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amf1-card text-emerald-400 border border-emerald-500/30 uppercase font-bold">
              Real-Time Milestone Trigger Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white">
            Milestone Alert Feed
          </h1>
          <p className="text-xs sm:text-sm text-amf1-silver mt-1 font-sans">
            Automated alerts triggered when ESG telemetry crosses strategic thresholds, complete with ready-to-publish campaign copy.
          </p>
        </div>

        <Link
          href="/partners"
          className="px-4 py-2 rounded-lg bg-amf1-card hover:bg-amf1-border text-xs font-mono text-amf1-silver border border-amf1-border transition-colors self-start sm:self-auto"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Feed List */}
      <div className="space-y-6">
        {MILESTONES.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-2xl bg-amf1-surface border border-amf1-border hover:border-amf1-cyan/40 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amf1-border/60">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amf1-lime" />
                <span className="text-xs font-mono text-amf1-lime font-bold">
                  {item.thresholdLabel}
                </span>
                <ProvenanceBadge status={item.status} />
              </div>
              <span className="text-[11px] font-mono text-amf1-muted">{item.timestamp}</span>
            </div>

            <h3 className="text-base sm:text-lg font-mono font-bold text-white mt-3">
              {item.title}
            </h3>
            <p className="text-xs text-amf1-silver mt-1 leading-relaxed">{item.description}</p>

            {/* Campaign Post Box */}
            <div className="mt-4 p-4 rounded-xl bg-amf1-card border border-amf1-cyan/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase text-amf1-cyan font-bold">
                  Suggested Sponsor Campaign Post
                </span>
                <button
                  onClick={() => handleCopy(item.id, item.suggestedPost)}
                  className="px-2.5 py-1 rounded bg-amf1-surface hover:bg-amf1-border text-xs font-mono text-amf1-silver flex items-center gap-1 transition-colors"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedId === item.id ? "Copied!" : "Copy Post"}</span>
                </button>
              </div>

              <p className="text-xs font-sans text-slate-200 leading-relaxed italic">
                &ldquo;{item.suggestedPost}&rdquo;
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
