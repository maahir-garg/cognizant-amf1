"use client";

import React, { useState, useEffect } from "react";
import { Activity, Radio, CloudRain, Thermometer, Wind } from "lucide-react";

export const TelemetryRibbon: React.FC = () => {
  const [timeStr, setTimeStr] = useState<string>("20:00:00 SGT");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format to SGT (UTC+8)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Singapore",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      setTimeStr(`${now.toLocaleTimeString("en-GB", options)} SGT`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#040807] border-b border-amf1-border/60 py-1 px-4 sm:px-6 lg:px-8 text-[11px] font-mono select-none overflow-x-auto">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 whitespace-nowrap text-amf1-silver/80">
        {/* Left: Circuit telemetry status */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-amf1-lime font-bold">
            <span className="w-2 h-2 rounded-full bg-amf1-lime animate-pulse shadow-[0_0_8px_#00FF87]" />
            <span>PADDOCK LIVE</span>
          </span>
          <span className="text-amf1-border">•</span>
          <span className="text-white font-medium">MARINA BAY STREET CIRCUIT</span>
          <span className="text-amf1-border hidden md:inline">•</span>
          <span className="text-amf1-muted hidden md:inline">ROUND 18 / 24</span>
        </div>

        {/* Center: Track conditions */}
        <div className="hidden lg:flex items-center gap-4 text-amf1-muted">
          <span className="flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-amber-400" />
            <span>AIR 31°C · TRACK 38°C</span>
          </span>
          <span className="text-amf1-border">•</span>
          <span className="flex items-center gap-1">
            <CloudRain className="w-3 h-3 text-amf1-cyan" />
            <span>HUMIDITY 74%</span>
          </span>
          <span className="text-amf1-border">•</span>
          <span className="flex items-center gap-1">
            <Wind className="w-3 h-3 text-emerald-400" />
            <span>WIND 11 KM/H SE</span>
          </span>
        </div>

        {/* Right: Local Singapore Time & Guardrail Status */}
        <div className="flex items-center gap-3">
          <span className="text-amf1-lime font-bold">{timeStr}</span>
          <span className="text-amf1-border">•</span>
          <span className="px-1.5 py-0.2 rounded bg-amf1-green/40 border border-amf1-lime/30 text-amf1-lime text-[10px]">
            GUARDRAIL ACTIVE ✓
          </span>
        </div>
      </div>
    </div>
  );
};
