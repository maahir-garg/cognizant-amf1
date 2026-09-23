"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  ChevronRight,
  Leaf,
  Users,
  HeartHandshake,
  Bot,
  RefreshCw,
} from "lucide-react";
import { loadFanProfile, saveFanProfile } from "@/lib/data/fan-profile";
import { FanProfile, Fact } from "@/lib/data/schemas";
import { getFacts, getFactById } from "@/lib/data/loaders";
import { ProvenanceBadge } from "@/components/shared/ProvenanceBadge";
import { SourceDrawer } from "@/components/shared/SourceDrawer";

interface QuizQuestion {
  id: string;
  sector: string;
  pillar: string;
  question: string;
  options: { label: string; value: string; isCorrect: boolean }[];
  factId: string;
  explanation: string;
}

const QUIZ_BEATS: QuizQuestion[] = [
  {
    id: "quiz-saf-laps",
    sector: "Sector 1: Environment",
    pillar: "Environment",
    question: "How many laps around Silverstone Circuit are equal to the emissions avoided via AMF1's Sustainable Aviation Fuel (SAF) certificates?",
    options: [
      { label: "1,500 laps", value: "1500", isCorrect: false },
      { label: "14,200 laps", value: "14200", isCorrect: false },
      { label: "88,153 laps", value: "88153", isCorrect: true },
      { label: "250,000 laps", value: "250000", isCorrect: false },
    ],
    factId: "FACT-E-05",
    explanation: "Through certified SAF certificates, AMF1 abated 1,188 tCO₂e—equivalent to driving 88,153 laps of Silverstone.",
  },
  {
    id: "quiz-female-rep",
    sector: "Sector 2: Belong",
    pillar: "Belong",
    question: "What percentage of workforce representation do women hold in AMF1 business enabling functions?",
    options: [
      { label: "18.5%", value: "18.5", isCorrect: false },
      { label: "32.0%", value: "32.0", isCorrect: false },
      { label: "48.0%", value: "48.0", isCorrect: true },
      { label: "65.0%", value: "65.0", isCorrect: false },
    ],
    factId: "FACT-S-01",
    explanation: "Women represent 48% of colleagues across enabling functions, alongside progressive STEM career pathways.",
  },
  {
    id: "quiz-cognizant-ideathon",
    sector: "Sector 3: Community",
    pillar: "Community",
    question: "For how many consecutive years has Cognizant partnered with AMF1 on the Global Gen-AI Ideathon?",
    options: [
      { label: "Inaugural Year (1st)", value: "1", isCorrect: false },
      { label: "2 Consecutive Years", value: "2", isCorrect: true },
      { label: "4 Consecutive Years", value: "4", isCorrect: false },
    ],
    factId: "FACT-C-02",
    explanation: "Cognizant and AMF1 have delivered the Gen-AI Ideathon for 2 consecutive years, engaging students in AI and race engineering.",
  },
];

export default function FanJourneyPage() {
  const [profile, setProfile] = useState<FanProfile | null>(null);
  const [currentSector, setCurrentSector] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [activeFact, setActiveFact] = useState<Fact | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [aiStory, setAiStory] = useState<string>("");
  const [aiCitedFacts, setAiCitedFacts] = useState<string[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const facts = getFacts();

  useEffect(() => {
    const loaded = loadFanProfile();
    setProfile(loaded);
    fetchStory(loaded);
  }, []);

  const fetchStory = async (p: FanProfile) => {
    setLoadingAi(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_type: "fan_story",
          context_facts: facts,
          user_persona: p.fan_level === "new" ? "New Fan" : p.fan_level === "casual" ? "Casual" : "Die-hard",
          parameters: {
            home_city: p.home_city,
            interests: p.interests,
          },
        }),
      });
      const data = await res.json();
      if (data?.content) {
        setAiStory(data.content);
        setAiCitedFacts(data.cited_fact_ids || []);
      }
    } catch (err) {
      console.error("Failed to load AI story:", err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSelectAnswer = (quizId: string, answerValue: string) => {
    if (quizAnswers[quizId]) return; // already answered

    const quiz = QUIZ_BEATS.find((q) => q.id === quizId);
    const isCorrect = quiz?.options.find((o) => o.value === answerValue)?.isCorrect;

    const newAnswers = { ...quizAnswers, [quizId]: answerValue };
    setQuizAnswers(newAnswers);

    if (profile) {
      const addedCredits = isCorrect ? 50 : 20;
      const updated: FanProfile = {
        ...profile,
        impact_credits: profile.impact_credits + addedCredits,
        completed_quizzes: Array.from(new Set([...profile.completed_quizzes, quizId])),
      };
      setProfile(updated);
      saveFanProfile(updated);
    }
  };

  const openFactDrawer = (factId: string) => {
    const fact = getFactById(factId);
    if (fact) {
      setActiveFact(fact);
      setIsDrawerOpen(true);
    }
  };

  const sectors = [
    {
      title: "Sector 1: Environment & Logistics",
      subtitle: "Decarbonizing Flyaway Racing & Solar Campus",
      icon: Leaf,
      color: "text-amf1-lime border-amf1-lime/40",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-amf1-silver leading-relaxed">
            Formula One logistics span 24 global Grands Prix. In 2024, Aston Martin Aramco&apos;s global freight generated 5,560.45 tCO₂e. Through Sustainable Aviation Fuel (SAF) certificates, the team abated 1,188 tCO₂e on transcontinental flights.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => openFactDrawer("FACT-E-04")}
              className="p-3 rounded-lg bg-amf1-card border border-amf1-border hover:border-amf1-lime/40 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-amf1-muted">FREIGHT FOOTPRINT</span>
                <ProvenanceBadge status="verified" page={19} />
              </div>
              <p className="text-xl font-mono font-bold text-white mt-1">5,560.45 tCO₂e</p>
              <p className="text-[10px] text-amf1-silver mt-0.5">Global air, sea & road transport</p>
            </div>
            <div
              onClick={() => openFactDrawer("FACT-E-05")}
              className="p-3 rounded-lg bg-amf1-card border border-amf1-border hover:border-amf1-lime/40 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-amf1-muted">SAF ABATEMENT</span>
                <ProvenanceBadge status="verified" page={9} />
              </div>
              <p className="text-xl font-mono font-bold text-amf1-lime mt-1">-1,188 tCO₂e</p>
              <p className="text-[10px] text-amf1-silver mt-0.5">High-integrity aviation certificates</p>
            </div>
          </div>
        </div>
      ),
      quiz: QUIZ_BEATS[0],
    },
    {
      title: "Sector 2: Belong & Culture",
      subtitle: "Accelerating Diverse Engineering Talent",
      icon: Users,
      color: "text-amf1-cyan border-amf1-cyan/40",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-amf1-silver leading-relaxed">
            Motorsport thrives when diverse perspectives challenge conventional thinking. AMF1&apos;s Neurodiversity ERG engaged 35 colleagues alongside the ADHD Foundation Umbrella Project, creating practical neuroinclusive pathways.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => openFactDrawer("FACT-S-01")}
              className="p-3 rounded-lg bg-amf1-card border border-amf1-border hover:border-amf1-cyan/40 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-amf1-muted">ENABLING ROLES</span>
                <ProvenanceBadge status="verified" page={84} />
              </div>
              <p className="text-xl font-mono font-bold text-amf1-cyan mt-1">48% Female</p>
              <p className="text-[10px] text-amf1-silver mt-0.5">Business functions representation</p>
            </div>
            <div
              onClick={() => openFactDrawer("FACT-S-02")}
              className="p-3 rounded-lg bg-amf1-card border border-amf1-border hover:border-amf1-cyan/40 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-amf1-muted">NEURODIVERSITY ERG</span>
                <ProvenanceBadge status="verified" page={48} />
              </div>
              <p className="text-xl font-mono font-bold text-white mt-1">35 Colleagues</p>
              <p className="text-[10px] text-amf1-silver mt-0.5">Active community group</p>
            </div>
          </div>
        </div>
      ),
      quiz: QUIZ_BEATS[1],
    },
    {
      title: "Sector 3: Community & Education",
      subtitle: "Hands-on STEM and Partner-Led Mobility",
      icon: HeartHandshake,
      color: "text-amber-400 border-amber-400/40",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-amf1-silver leading-relaxed">
            Through Make A Mark, AMF1 and Cognizant deliver real-world technology education. Over 300 students from 14 schools joined campus immersion, while the joint Gen-AI Ideathon entered its second consecutive year.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => openFactDrawer("FACT-C-01")}
              className="p-3 rounded-lg bg-amf1-card border border-amf1-border hover:border-amber-400/40 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-amf1-muted">STUDENTS IMMERSED</span>
                <ProvenanceBadge status="verified" page={11} />
              </div>
              <p className="text-xl font-mono font-bold text-amber-400 mt-1">300+ Students</p>
              <p className="text-[10px] text-amf1-silver mt-0.5">14 schools across Make A Mark Week</p>
            </div>
            <div
              onClick={() => openFactDrawer("FACT-C-02")}
              className="p-3 rounded-lg bg-amf1-card border border-amf1-border hover:border-amber-400/40 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-amf1-muted">COGNIZANT IDEATHON</span>
                <ProvenanceBadge status="verified" page={62} />
              </div>
              <p className="text-xl font-mono font-bold text-white mt-1">2 Consecutive Years</p>
              <p className="text-[10px] text-amf1-silver mt-0.5">Empowering student AI creators</p>
            </div>
          </div>
        </div>
      ),
      quiz: QUIZ_BEATS[2],
    },
  ];

  return (
    <div className="flex-1 flex flex-col py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
      {/* Top Telemetry Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-amf1-surface border border-amf1-border mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amf1-card border border-amf1-lime/40 flex items-center justify-center">
            <Flame className="w-5 h-5 text-amf1-lime" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-amf1-lime font-bold">
                Fan Cockpit Telemetry
              </span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-amf1-card border border-amf1-border text-amf1-silver">
                {profile?.fan_level?.toUpperCase()} FAN · {profile?.home_city}
              </span>
            </div>
            <h2 className="text-sm font-mono font-bold text-white mt-0.5">
              Interactive Impact Lap · Sector {currentSector + 1} of 3
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] font-mono text-amf1-muted uppercase block">
              Simulated Credits
            </span>
            <span className="text-base font-mono font-bold text-amf1-lime flex items-center gap-1">
              <Award className="w-4 h-4" />
              {profile?.impact_credits || 0} pts
            </span>
          </div>
          <Link
            href="/onboarding"
            className="px-3 py-1.5 rounded bg-amf1-card hover:bg-amf1-border text-xs font-mono text-amf1-silver transition-colors"
          >
            Change Persona
          </Link>
        </div>
      </div>

      {/* AI Grounded Lap Briefing */}
      <div className="p-6 rounded-2xl bg-amf1-surface border border-amf1-lime/30 shadow-[0_0_25px_rgba(0,255,135,0.08)] mb-8">
        <div className="flex items-center justify-between pb-3 border-b border-amf1-border">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-amf1-lime" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-amf1-lime font-bold">
              AI Telemetry Storyteller
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
              Verified ✓ Zero-Hallucination Guardrail
            </span>
          </div>
          <button
            onClick={() => profile && fetchStory(profile)}
            disabled={loadingAi}
            className="text-xs font-mono text-amf1-muted hover:text-white flex items-center gap-1 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loadingAi ? "animate-spin" : ""}`} />
            <span>Regenerate</span>
          </button>
        </div>

        <div className="mt-4 text-sm text-amf1-silver leading-relaxed font-sans">
          {loadingAi ? (
            <div className="py-4 flex items-center justify-center gap-2 text-amf1-muted font-mono text-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-amf1-lime" />
              <span>Synthesizing grounded telemetry narrative for {profile?.fan_level} fan...</span>
            </div>
          ) : (
            <div>
              <p className="whitespace-pre-line">{aiStory}</p>
              {aiCitedFacts.length > 0 && (
                <div className="mt-4 pt-3 border-t border-amf1-border/50 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono text-amf1-muted">Audited Citations:</span>
                  {aiCitedFacts.map((fid) => (
                    <button
                      key={fid}
                      onClick={() => openFactDrawer(fid)}
                      className="px-2 py-0.5 rounded bg-amf1-card hover:bg-amf1-border text-[10px] font-mono text-amf1-lime border border-amf1-lime/30 transition-colors"
                    >
                      {fid} ↗
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sector Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-amf1-border mb-6">
        {sectors.map((sec, idx) => {
          const Icon = sec.icon;
          const isActive = currentSector === idx;
          const isCompleted = !!quizAnswers[sec.quiz.id];

          return (
            <button
              key={idx}
              onClick={() => setCurrentSector(idx)}
              className={`pb-3 px-4 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all ${
                isActive
                  ? "border-amf1-lime text-white"
                  : "border-transparent text-amf1-muted hover:text-amf1-silver"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>Sector {idx + 1}</span>
              {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-amf1-lime" />}
            </button>
          );
        })}
      </div>

      {/* Active Sector Content Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-amf1-surface border border-amf1-border mb-8">
        <div className="mb-6">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amf1-lime font-bold">
            Sector {currentSector + 1} of 3
          </span>
          <h2 className="text-xl font-mono font-bold text-white mt-1">
            {sectors[currentSector].title}
          </h2>
          <p className="text-xs text-amf1-muted font-mono mt-0.5">
            {sectors[currentSector].subtitle}
          </p>
        </div>

        {sectors[currentSector].content}

        {/* Pop-up Quiz Beat */}
        <div className="mt-8 p-5 sm:p-6 rounded-xl bg-amf1-card/90 border border-amf1-border relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amf1-lime" />
              <span className="text-xs font-mono font-bold uppercase text-amf1-lime">
                Pitwall Quiz Challenge · +50 Credits
              </span>
            </div>
            <ProvenanceBadge status="verified" page={getFactById(sectors[currentSector].quiz.factId)?.page} />
          </div>

          <h4 className="text-sm font-semibold text-white mb-4">
            {sectors[currentSector].quiz.question}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sectors[currentSector].quiz.options.map((opt, i) => {
              const quizId = sectors[currentSector].quiz.id;
              const isSelected = quizAnswers[quizId] === opt.value;
              const hasAnswered = !!quizAnswers[quizId];

              let btnStyle = "bg-amf1-bg border-amf1-border hover:border-amf1-lime/40 text-amf1-silver";
              if (hasAnswered) {
                if (opt.isCorrect) {
                  btnStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500";
                } else if (isSelected && !opt.isCorrect) {
                  btnStyle = "bg-rose-950/80 border-rose-500 text-rose-200";
                } else {
                  btnStyle = "bg-amf1-bg/50 border-amf1-border/40 text-amf1-muted opacity-50";
                }
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={hasAnswered}
                  onClick={() => handleSelectAnswer(quizId, opt.value)}
                  className={`p-3.5 rounded-lg border text-left text-xs font-mono transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt.label}</span>
                  {hasAnswered && opt.isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          {/* Reveal feedback */}
          {quizAnswers[sectors[currentSector].quiz.id] && (
            <div className="mt-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amf1-lime shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-300 font-sans">
                <span className="font-bold text-white font-mono">Telemetry Verified: </span>
                {sectors[currentSector].quiz.explanation}
                <button
                  onClick={() => openFactDrawer(sectors[currentSector].quiz.factId)}
                  className="ml-2 underline text-amf1-lime font-mono text-[11px]"
                >
                  Inspect Provenance ↗
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sector Navigation Bottom Buttons */}
        <div className="mt-8 pt-6 border-t border-amf1-border/60 flex items-center justify-between">
          <button
            onClick={() => setCurrentSector((prev) => Math.max(0, prev - 1))}
            disabled={currentSector === 0}
            className="px-4 py-2 rounded bg-amf1-card text-xs font-mono text-amf1-silver disabled:opacity-40"
          >
            ← Previous Sector
          </button>

          {currentSector < sectors.length - 1 ? (
            <button
              onClick={() => setCurrentSector((prev) => Math.min(sectors.length - 1, prev + 1))}
              className="px-5 py-2 rounded bg-amf1-lime hover:bg-amf1-lime-glow text-amf1-bg text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
            >
              <span>Next Sector</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/tracker"
                className="px-4 py-2 rounded bg-amf1-card hover:bg-amf1-border text-xs font-mono text-white border border-amf1-border transition-colors flex items-center gap-1.5"
              >
                <span>Live Carbon Tracker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/share"
                className="px-5 py-2 rounded bg-amf1-lime hover:bg-amf1-lime-glow text-amf1-bg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,255,135,0.3)]"
              >
                <span>Generate Share Card</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Provenance Audit Drawer */}
      <SourceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        data={activeFact}
      />
    </div>
  );
}
