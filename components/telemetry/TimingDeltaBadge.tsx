"use client";

import React from "react";

interface TimingDeltaProps {
  delta: string | number;
  type?: "green" | "purple" | "yellow";
  label?: string;
}

export const TimingDeltaBadge: React.FC<TimingDeltaProps> = ({
  delta,
  type = "green",
  label = "DELTA",
}) => {
  const styles = {
    purple: "bg-[#7928CA]/30 text-[#D8B4FE] border-[#A855F7] shadow-[0_0_12px_rgba(168,85,247,0.3)]",
    green: "bg-[#00352F] text-amf1-lime border-amf1-lime/60 shadow-[0_0_12px_rgba(0,255,135,0.25)]",
    yellow: "bg-[#451A03] text-amber-300 border-amber-500/50",
  }[type];

  return (
    <div className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-xs font-black ${styles}`}>
      <span className="text-[9px] uppercase tracking-widest text-white/60 mr-1.5">{label}</span>
      <span className="tracking-tight">{delta}</span>
    </div>
  );
};
