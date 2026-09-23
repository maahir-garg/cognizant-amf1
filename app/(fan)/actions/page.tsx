"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  Train,
  Car,
  Bus,
  Droplet,
  Trash2,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  Users,
  Compass,
} from "lucide-react";
import { loadFanProfile, saveFanProfile } from "@/lib/data/fan-profile";
import { FanProfile } from "@/lib/data/schemas";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";

interface ActionChoice {
  id: string;
  category: string;
  question: string;
  options: {
    id: string;
    label: string;
    description: string;
    credits: number;
    co2SavedLabel: string;
    recommended?: boolean;
    icon: any;
  }[];
}

const ACTION_CHOICES: ActionChoice[] = [
  {
    id: "action-transport",
    category: "Singapore GP Circuit Travel",
    question: "How are you travelling to the Marina Bay Street Circuit?",
    options: [
      {
        id: "opt-mrt",
        label: "SMRT Mass Rapid Transit (MRT)",
        description: "Direct to City Hall, Promenade, or Bayfront station on Singapore's electric rail network.",
        credits: 60,
        co2SavedLabel: "~3.8 kg CO₂e saved per trip",
        recommended: true,
        icon: Train,
      },
      {
        id: "opt-shuttle",
        label: "Hybrid / EV Paddock Shuttle",
        description: "Organised group transit from circuit park-and-ride hubs.",
        credits: 40,
        co2SavedLabel: "~2.1 kg CO₂e saved per trip",
        icon: Bus,
      },
      {
        id: "opt-taxi",
        label: "Private Petrol Taxi / Ride-hail",
        description: "Standard private ICE combustion vehicle caught in city center congestion.",
        credits: 0,
        co2SavedLabel: "0 kg CO₂e saved (High Congestion)",
        icon: Car,
      },
    ],
  },
  {
    id: "action-waste",
    category: "Circuit Hydration & Waste",
    question: "How do you manage refreshments at the track?",
    options: [
      {
        id: "opt-refill",
        label: "Refillable Bottle at Free Water Stations",
        description: "Zero single-use plastics via circuit-wide hydration points.",
        credits: 30,
        co2SavedLabel: "Avoids 3 single-use PET bottles",
        recommended: true,
        icon: Droplet,
      },
      {
        id: "opt-plastic",
        label: "Single-Use Plastic Water Bottles",
        description: "Purchasing disposable single-use plastic bottles from vendors.",
        credits: 0,
        co2SavedLabel: "Adds to municipal plastic waste",
        icon: Trash2,
      },
    ],
  },
];

const VOLUNTEERING_PROGRAMS = [
  {
    id: "vol-stem",
    title: "Cognizant × AMF1 STEM Lab Mentor",
    location: "Marina Bay Pit Building, Singapore",
    dates: "8–9 Oct 2026",
    role: "Guide secondary school teams coding live race telemetry dashboards",
    credits: 100,
    status: "simulated" as const,
  },
  {
    id: "vol-neurodiversity",
    title: "Neuroinclusive Accessibility Guide",
    location: "Zone 1 & 4 Fan Villages, Singapore GP",
    dates: "9–11 Oct 2026",
    role: "Distribute sensory kits and noise-cancelling headphones to neurodivergent attendees",
    credits: 100,
    status: "simulated" as const,
  },
  {
    id: "vol-coastal",
    title: "East Coast Park Marine Clean-Up",
    location: "Singapore Marine Paddock Initiative",
    dates: "12 Oct 2026 (Post-Race)",
    role: "Post-race waste auditing and shoreline plastic collection with local environmental groups",
    credits: 75,
    status: "simulated" as const,
  },
];

export default function FanActionsPage() {
  const [profile, setProfile] = useState<FanProfile>(loadFanProfile());
  const [chosenOptions, setChosenOptions] = useState<Record<string, string>>({});
  const [signedVolunteering, setSignedVolunteering] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"actions" | "volunteering">("actions");

  useEffect(() => {
    setProfile(loadFanProfile());
  }, []);

  const selectOption = (actionId: string, optionId: string, credits: number) => {
    if (chosenOptions[actionId] === optionId) return;

    const updatedChosen = { ...chosenOptions, [actionId]: optionId };
    setChosenOptions(updatedChosen);

    const updatedProfile: FanProfile = {
      ...profile,
      impact_credits: profile.impact_credits + credits,
      chosen_actions: Array.from(new Set([...profile.chosen_actions, optionId])),
    };
    setProfile(updatedProfile);
    saveFanProfile(updatedProfile);
  };

  const toggleVolunteering = (volId: string, credits: number) => {
    if (signedVolunteering.includes(volId)) return;

    setSignedVolunteering([...signedVolunteering, volId]);
    const updatedProfile: FanProfile = {
      ...profile,
      impact_credits: profile.impact_credits + credits,
    };
    setProfile(updatedProfile);
    saveFanProfile(updatedProfile);
  };

  return (
    <div className="flex-1 flex flex-col py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
      {/* Hero Banner */}
      <div className="p-6 rounded-2xl bg-amf1-surface border border-amf1-border flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amf1-card text-amf1-lime border border-amf1-lime/30 uppercase font-bold">
              Action Hub & Impact Credits
            </span>
            <ProvenanceBadge status="simulated" notes="Demo gamification points for Singapore Ideathon" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white">
            What Can You Do This Weekend?
          </h1>
          <p className="text-xs sm:text-sm text-amf1-silver mt-1 font-sans">
            Every choice you make shapes the race weekend footprint. Earn simulated impact credits toward exclusive digital rewards.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-amf1-card border border-amf1-lime/40 flex items-center gap-3 shrink-0 shadow-[0_0_15px_rgba(0,255,135,0.15)]">
          <Award className="w-8 h-8 text-amf1-lime" />
          <div>
            <span className="text-[10px] font-mono uppercase text-amf1-muted block">
              Your Total Score
            </span>
            <span className="text-2xl font-mono font-black text-amf1-lime">
              {profile.impact_credits} pts
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-amf1-border mb-8">
        <button
          onClick={() => setActiveTab("actions")}
          className={`pb-3 px-4 text-xs font-mono font-bold transition-all border-b-2 ${
            activeTab === "actions"
              ? "border-amf1-lime text-white"
              : "border-transparent text-amf1-muted hover:text-white"
          }`}
        >
          Sustainable Options Quiz
        </button>
        <button
          onClick={() => setActiveTab("volunteering")}
          className={`pb-3 px-4 text-xs font-mono font-bold transition-all border-b-2 ${
            activeTab === "volunteering"
              ? "border-amf1-lime text-white"
              : "border-transparent text-amf1-muted hover:text-white"
          }`}
        >
          Race Weekend Volunteering
        </button>
      </div>

      {/* Actions Tab */}
      {activeTab === "actions" && (
        <div className="space-y-8">
          {ACTION_CHOICES.map((action) => (
            <div key={action.id} className="p-6 rounded-2xl bg-amf1-surface border border-amf1-border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase text-amf1-lime font-bold">
                  {action.category}
                </span>
                <span className="text-[10px] font-mono text-amf1-muted">Select your choice</span>
              </div>
              <h3 className="text-base font-semibold text-white mb-4">{action.question}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {action.options.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = chosenOptions[action.id] === opt.id;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => selectOption(action.id, opt.id, opt.credits)}
                      className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-amf1-card border-amf1-lime ring-1 ring-amf1-lime shadow-[0_0_15px_rgba(0,255,135,0.2)]"
                          : "bg-amf1-card/60 border-amf1-border hover:border-amf1-border/90"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`p-2 rounded-lg ${
                              isSelected ? "bg-amf1-lime text-amf1-bg" : "bg-amf1-surface text-amf1-silver"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          {opt.recommended && (
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                              RECOMMENDED
                            </span>
                          )}
                        </div>

                        <h4 className="font-mono text-xs font-bold text-white mb-1">{opt.label}</h4>
                        <p className="text-[11px] text-amf1-silver/90 leading-tight">
                          {opt.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-amf1-border/60 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                          {opt.co2SavedLabel}
                        </span>
                        <span className="text-xs font-mono font-bold text-amf1-lime">
                          +{opt.credits} pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Volunteering Tab */}
      {activeTab === "volunteering" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VOLUNTEERING_PROGRAMS.map((vol) => {
            const isSigned = signedVolunteering.includes(vol.id);
            return (
              <div
                key={vol.id}
                className="p-6 rounded-2xl bg-amf1-surface border border-amf1-border flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amf1-card text-amf1-cyan border border-amf1-cyan/30">
                      {vol.location}
                    </span>
                    <ProvenanceBadge status={vol.status} />
                  </div>
                  <h3 className="text-base font-mono font-bold text-white mb-1">{vol.title}</h3>
                  <span className="text-xs font-mono text-amf1-lime block mb-3">{vol.dates}</span>
                  <p className="text-xs text-amf1-silver leading-relaxed">{vol.role}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-amf1-border/60 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amf1-lime">+{vol.credits} pts</span>
                  <button
                    onClick={() => toggleVolunteering(vol.id, vol.credits)}
                    disabled={isSigned}
                    className={`px-4 py-2 rounded text-xs font-mono font-bold transition-all ${
                      isSigned
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-500/50"
                        : "bg-amf1-lime hover:bg-amf1-lime-glow text-amf1-bg shadow-sm"
                    }`}
                  >
                    {isSigned ? "Registered ✓" : "Volunteer Now"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Next Flow CTA */}
      <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-amf1-surface via-amf1-card to-amf1-surface border border-amf1-lime/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-mono font-bold text-white">
            Ready to Celebrate Your Impact?
          </h3>
          <p className="text-xs text-amf1-silver mt-0.5">
            Auto-generate your 9:16 story share card with verified telemetry citations and downloadable PNG.
          </p>
        </div>
        <Link
          href="/share"
          className="px-6 py-3 rounded-lg bg-amf1-lime hover:bg-amf1-lime-glow text-amf1-bg text-xs font-mono font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,135,0.3)] transition-all hover:scale-105 active:scale-95"
        >
          <span>Generate Share Card</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
