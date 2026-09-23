"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Flame,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Gauge,
  Compass,
  Cpu,
  Leaf,
  Users,
  Heart,
  GraduationCap,
} from "lucide-react";
import {
  DEFAULT_FAN_PROFILE,
  loadFanProfile,
  saveFanProfile,
  POPULAR_CITIES,
  INTEREST_OPTIONS,
} from "@/lib/data/fan-profile";
import { FanLevel } from "@/lib/data/schemas";

export default function FanOnboardingPage() {
  const router = useRouter();
  const [level, setLevel] = useState<FanLevel>("new");
  const [city, setCity] = useState("Singapore");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["environment", "stem"]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = loadFanProfile();
    setLevel(existing.fan_level);
    setCity(existing.home_city);
    setSelectedInterests(existing.interests);
  }, []);

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter((item) => item !== id));
      }
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    const profile = {
      fan_level: level,
      home_city: city,
      interests: selectedInterests,
      impact_credits: level === "new" ? 100 : level === "casual" ? 150 : 200,
      completed_quizzes: [],
      chosen_actions: [],
    };
    saveFanProfile(profile);
    setSaved(true);
    router.push("/journey");
  };

  const levelConfigs: {
    id: FanLevel;
    title: string;
    tagline: string;
    description: string;
    icon: any;
    depth: string;
  }[] = [
    {
      id: "new",
      title: "New Fan",
      tagline: "Curious Explorer",
      description: "Guided, story-first journey with accessible real-world carbon comparisons and interactive quiz moments.",
      icon: Sparkles,
      depth: "Story-Guided · 3 Quiz Beats",
    },
    {
      id: "casual",
      title: "Casual Fan",
      tagline: "Weekend Enthusiast",
      description: "Balanced experience blending race-weekend atmosphere with fast, engaging impact milestones.",
      icon: Zap,
      depth: "Balanced Flow · 2 Quiz Beats",
    },
    {
      id: "die-hard",
      title: "Die-hard Fan",
      tagline: "Telemetry Obsessed",
      description: "Compact, data-dense cockpit feed showing raw tCO₂e scopes, SAF logistics data, and engineering specs.",
      icon: Gauge,
      depth: "Data Dense · Rapid Audit",
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-amf1-bg">
      <div className="w-full max-w-2xl bg-amf1-surface border border-amf1-border rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amf1-green/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amf1-card border border-amf1-lime/30 text-amf1-lime font-mono text-[11px] mb-3">
            <Flame className="w-3.5 h-3.5" />
            <span>30-SECOND PERSONALISED SETUP</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-mono font-extrabold text-white">
            Customise Your Impact Lap
          </h1>
          <p className="text-xs sm:text-sm text-amf1-silver mt-1.5 font-sans">
            How would you like your F1 sustainability & inclusion telemetry delivered?
          </p>
        </div>

        <form onSubmit={handleComplete} className="space-y-8 relative">
          {/* Section 1: Fan Level */}
          <div>
            <label className="block text-xs font-mono uppercase text-amf1-silver font-bold mb-3 tracking-wider">
              1. Select Your Knowledge Level
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {levelConfigs.map((cfg) => {
                const Icon = cfg.icon;
                const isSelected = level === cfg.id;
                return (
                  <button
                    key={cfg.id}
                    type="button"
                    onClick={() => setLevel(cfg.id)}
                    className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-amf1-card border-amf1-lime shadow-[0_0_15px_rgba(0,255,135,0.25)] ring-1 ring-amf1-lime"
                        : "bg-amf1-bg/80 border-amf1-border hover:border-amf1-border/80 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Icon
                          className={`w-5 h-5 ${
                            isSelected ? "text-amf1-lime" : "text-amf1-muted"
                          }`}
                        />
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSelected ? "bg-amf1-lime shadow-[0_0_8px_#00FF87]" : "bg-transparent"
                          }`}
                        />
                      </div>
                      <h3 className="font-mono text-sm font-bold text-white">{cfg.title}</h3>
                      <p className="text-[11px] text-amf1-muted mt-0.5">{cfg.tagline}</p>
                      <p className="text-[11px] text-amf1-silver/80 mt-2 leading-tight">
                        {cfg.description}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-amf1-border/60">
                      <span className="text-[10px] font-mono text-amf1-lime">{cfg.depth}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Home City */}
          <div>
            <label className="block text-xs font-mono uppercase text-amf1-silver font-bold mb-2 tracking-wider">
              2. Your Home City
            </label>
            <div className="relative">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-amf1-card border border-amf1-border text-white text-sm font-mono focus:border-amf1-lime focus:outline-none focus:ring-1 focus:ring-amf1-lime transition-colors"
              >
                {POPULAR_CITIES.map((c) => (
                  <option key={c} value={c} className="bg-amf1-surface text-white">
                    {c} {c === "Singapore" ? "(Hero Race Host)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-amf1-muted mt-1.5 font-mono">
              Used to match regional community programs and upcoming Grand Prix activations.
            </p>
          </div>

          {/* Section 3: Interests */}
          <div>
            <label className="block text-xs font-mono uppercase text-amf1-silver font-bold mb-2 tracking-wider">
              3. What Matters Most To You?
            </label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((opt) => {
                const isSelected = selectedInterests.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleInterest(opt.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 border ${
                      isSelected
                        ? "bg-amf1-lime text-amf1-bg border-amf1-lime font-bold shadow-sm"
                        : "bg-amf1-card text-amf1-silver border-amf1-border hover:border-amf1-silver/50"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4 border-t border-amf1-border/60 flex items-center justify-between">
            <span className="text-xs font-mono text-amf1-muted">Takes ~30 seconds</span>
            <button
              type="submit"
              disabled={saved}
              className="px-6 py-3 rounded-lg bg-amf1-lime hover:bg-amf1-lime-glow text-amf1-bg font-mono font-bold text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,135,0.3)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <span>{saved ? "Configuring Telemetry..." : "Start Your Lap"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
