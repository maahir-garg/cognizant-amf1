"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Shield, Users, BarChart3, Radio, Sparkles } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { TelemetryRibbon } from "@/components/telemetry/TelemetryRibbon";

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  const isPartner = pathname?.startsWith("/partners");
  const isFan = pathname === "/" || pathname === "/onboarding" || pathname === "/journey" || pathname === "/tracker" || pathname === "/actions" || pathname === "/share";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amf1-border/70 bg-amf1-bg/95 backdrop-blur-md">
      <TelemetryRibbon />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-amf1-green to-amf1-green-deep border border-amf1-lime/40 flex items-center justify-center shadow-[0_0_12px_rgba(0,255,135,0.25)]">
              <Flame className="w-4 h-4 text-amf1-lime group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <span className="font-mono text-base font-extrabold tracking-tight text-white group-hover:text-amf1-lime transition-colors">
                {SITE_CONFIG.name}
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-amf1-card border border-amf1-border text-amf1-muted uppercase">
                Singapore GP 2026
              </span>
            </div>
          </Link>

          {/* Primary View Switcher Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-amf1-surface/90 p-1 rounded-lg border border-amf1-border">
            <Link
              href="/journey"
              className={`px-3 py-1.5 rounded-md text-xs font-medium font-mono transition-all flex items-center gap-1.5 ${
                isFan
                  ? "bg-amf1-card text-amf1-lime border border-amf1-lime/30 shadow-sm"
                  : "text-amf1-muted hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Fan Lap</span>
            </Link>
            <Link
              href="/partners"
              className={`px-3 py-1.5 rounded-md text-xs font-medium font-mono transition-all flex items-center gap-1.5 ${
                isPartner
                  ? "bg-amf1-card text-amf1-lime border border-amf1-lime/30 shadow-sm"
                  : "text-amf1-muted hover:text-white"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Partner Intel</span>
            </Link>
          </nav>
        </div>

        {/* Right Action & Status Indicator */}
        <div className="flex items-center gap-3">
          {/* Live / Demo Mode Tag */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amf1-card border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline">OFFLINE READY</span>
            <span className="font-semibold text-amf1-lime">DEMO MODE</span>
          </div>

          <Link
            href="/onboarding"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded bg-amf1-lime hover:bg-amf1-lime-glow text-amf1-bg font-bold transition-all shadow-[0_0_15px_rgba(0,255,135,0.3)] hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Lap</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
