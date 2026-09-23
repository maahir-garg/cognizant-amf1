"use client";

import React from "react";
import { CheckCircle2, Calculator, FlaskConical, HelpCircle } from "lucide-react";
import { StatusType } from "@/lib/data/schemas";

interface ProvenanceBadgeProps {
  status: StatusType;
  sourceDoc?: string;
  page?: number;
  formula?: string;
  notes?: string;
  onClick?: () => void;
  className?: string;
  showDetailsTooltip?: boolean;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  status,
  sourceDoc,
  page,
  formula,
  notes,
  onClick,
  className = "",
  showDetailsTooltip = true,
}) => {
  const config = {
    verified: {
      label: "VERIFIED",
      icon: CheckCircle2,
      bg: "bg-emerald-950/80 text-emerald-400 border-emerald-500/40 hover:border-emerald-400",
      dot: "bg-emerald-400 shadow-[0_0_8px_#34d399]",
      desc: sourceDoc ? `${sourceDoc} (Page ${page})` : "Official ESG audit source",
    },
    estimated: {
      label: "ESTIMATED",
      icon: Calculator,
      bg: "bg-sky-950/80 text-sky-400 border-sky-500/40 hover:border-sky-400",
      dot: "bg-sky-400 shadow-[0_0_8px_#38bdf8]",
      desc: formula ? `Formula: ${formula}` : "Derived via documented conversion model",
    },
    simulated: {
      label: "SIMULATED",
      icon: FlaskConical,
      bg: "bg-amber-950/80 text-amber-400 border-amber-500/40 hover:border-amber-400",
      dot: "bg-amber-400 shadow-[0_0_8px_#fbbf24]",
      desc: notes || "Illustrative demo data for live ideathon showcase",
    },
  }[status];

  const Icon = config.icon;

  return (
    <span
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={showDetailsTooltip ? `${config.label}: ${config.desc}` : undefined}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold border transition-all duration-150 select-none ${
        onClick ? "cursor-pointer active:scale-95" : "cursor-help"
      } ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
      <Icon className="w-3 h-3 opacity-70" />
    </span>
  );
};
