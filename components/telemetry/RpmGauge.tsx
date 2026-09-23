"use client";

import React from "react";

interface RpmGaugeProps {
  value: number; // 0 to 100
  totalSegments?: number;
  label: string;
  unit?: string;
  colorScheme?: "lime" | "cyan" | "racing";
}

export const RpmGauge: React.FC<RpmGaugeProps> = ({
  value,
  totalSegments = 16,
  label,
  unit = "%",
  colorScheme = "lime",
}) => {
  const activeCount = Math.round((Math.min(100, Math.max(0, value)) / 100) * totalSegments);

  const getSegmentColor = (index: number) => {
    const ratio = index / totalSegments;
    if (colorScheme === "racing") {
      if (ratio < 0.6) return "bg-emerald-400 shadow-[0_0_8px_#34d399]";
      if (ratio < 0.85) return "bg-amber-400 shadow-[0_0_8px_#fbbf24]";
      return "bg-rose-500 shadow-[0_0_8px_#f43f5e]";
    }
    if (colorScheme === "cyan") {
      return "bg-amf1-cyan shadow-[0_0_8px_#00E5FF]";
    }
    return "bg-amf1-lime shadow-[0_0_8px_#00FF87]";
  };

  return (
    <div className="p-3.5 rounded-xl bg-amf1-card border border-amf1-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono uppercase text-amf1-muted tracking-wider">
          {label}
        </span>
        <span className="text-xs font-mono font-black text-white">
          {value}
          <span className="text-[10px] text-amf1-silver ml-0.5">{unit}</span>
        </span>
      </div>

      {/* LED Bar Array */}
      <div className="grid grid-cols-16 gap-1 h-2.5 p-1 rounded bg-[#070D0C] border border-amf1-border/80 items-center">
        {Array.from({ length: totalSegments }).map((_, idx) => {
          const isActive = idx < activeCount;
          return (
            <div
              key={idx}
              className={`h-full rounded-[1px] transition-all duration-150 ${
                isActive ? getSegmentColor(idx) : "bg-amf1-border/30"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
