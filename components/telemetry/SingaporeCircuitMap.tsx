"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface CircuitSectorData {
  id: number;
  name: string;
  pillar: string;
  metric: string;
  value: string;
  delta: string;
  status: "verified" | "estimated";
  color: string;
  turns: string;
  description: string;
}

export const CIRCUIT_SECTORS: Record<number, CircuitSectorData> = {
  1: {
    id: 1,
    name: "Sector 1",
    pillar: "Environment & Logistics",
    metric: "SAFc Decarbonisation",
    value: "-1,188 tCO₂e",
    delta: "-14.2% vs 2023",
    status: "verified",
    color: "#00FF87",
    turns: "Turn 1 (Sheares) → Turn 5",
    description: "Air freight charter decarbonisation via certified Sustainable Aviation Fuel.",
  },
  2: {
    id: 2,
    name: "Sector 2",
    pillar: "Belong & Culture",
    metric: "Workforce Inclusivity",
    value: "48% Female",
    delta: "Enabling Roles",
    status: "verified",
    color: "#00E5FF",
    turns: "Turn 6 (St. Andrew) → Turn 14 (Stamford)",
    description: "STEM talent pipelines and active Neurodiversity Employee Resource Group.",
  },
  3: {
    id: 3,
    name: "Sector 3",
    pillar: "Community & STEM",
    metric: "Make A Mark Immersion",
    value: "300+ Students",
    delta: "14 Schools",
    status: "verified",
    color: "#CEDC00",
    turns: "Turn 15 (Connaught) → Turn 19 Pit Straight",
    description: "Hands-on telemetry coding workshops hosted at Marina Bay Pit Building.",
  },
};

interface CircuitProps {
  activeSector: number;
  onSelectSector?: (sector: number) => void;
  interactive?: boolean;
}

export const SingaporeCircuitMap: React.FC<CircuitProps> = ({
  activeSector,
  onSelectSector,
  interactive = true,
}) => {
  const [hoveredSector, setHoveredSector] = useState<number | null>(null);
  const currentSector = hoveredSector || activeSector;
  const sectorInfo = CIRCUIT_SECTORS[currentSector] || CIRCUIT_SECTORS[1];

  // SVG Paths for Marina Bay Street Circuit (accurate geometric trace)
  const paths = {
    s1: "M 480 340 L 410 338 L 350 330 L 290 310 L 260 280 L 230 220 L 210 160",
    s2: "M 210 160 L 210 100 L 260 70 L 340 65 L 430 70 L 480 95 L 530 130 L 520 180 L 460 210",
    s3: "M 460 210 L 420 230 L 400 270 L 420 310 L 480 340",
  };

  return (
    <div className="relative w-full rounded-2xl bg-[#081210] border border-amf1-border/90 p-5 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      {/* Background Reticle Grid & Coordinates */}
      <div className="absolute inset-0 bg-carbon opacity-30 pointer-events-none" />
      <div className="absolute top-3 left-4 flex items-center gap-2 font-mono text-[10px] text-amf1-muted uppercase">
        <span className="w-2 h-2 rounded-full bg-amf1-lime animate-pulse" />
        <span>MARINA BAY STREET CIRCUIT // 5.063 KM // 19 TURNS</span>
      </div>
      <div className="absolute top-3 right-4 font-mono text-[10px] text-amf1-muted hidden sm:block">
        LAT 1.2914° N · LON 103.8580° E
      </div>

      {/* SVG Circuit Canvas */}
      <div className="relative w-full h-[260px] sm:h-[300px] flex items-center justify-center mt-4">
        <svg
          viewBox="180 50 400 320"
          className="w-full h-full max-h-[290px] select-none filter drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]"
        >
          {/* Circuit Ghost Track Underlay */}
          <path
            d={`${paths.s1} ${paths.s2} ${paths.s3}`}
            fill="none"
            stroke="#162925"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Sector 1 Path (Environment / Sheares & Republic Blvd) */}
          <path
            d={paths.s1}
            fill="none"
            stroke={currentSector === 1 ? "#00FF87" : "#00594F"}
            strokeWidth={currentSector === 1 ? "8" : "4"}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="cursor-pointer transition-all duration-300"
            style={{
              filter: currentSector === 1 ? "drop-shadow(0 0 10px #00FF87)" : "none",
            }}
            onMouseEnter={() => interactive && setHoveredSector(1)}
            onMouseLeave={() => interactive && setHoveredSector(null)}
            onClick={() => onSelectSector && onSelectSector(1)}
          />

          {/* Sector 2 Path (Belong / Padang & Stamford) */}
          <path
            d={paths.s2}
            fill="none"
            stroke={currentSector === 2 ? "#00E5FF" : "#00594F"}
            strokeWidth={currentSector === 2 ? "8" : "4"}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="cursor-pointer transition-all duration-300"
            style={{
              filter: currentSector === 2 ? "drop-shadow(0 0 10px #00E5FF)" : "none",
            }}
            onMouseEnter={() => interactive && setHoveredSector(2)}
            onMouseLeave={() => interactive && setHoveredSector(null)}
            onClick={() => onSelectSector && onSelectSector(2)}
          />

          {/* Sector 3 Path (Community / Bayfront & Pit Entry) */}
          <path
            d={paths.s3}
            fill="none"
            stroke={currentSector === 3 ? "#CEDC00" : "#00594F"}
            strokeWidth={currentSector === 3 ? "8" : "4"}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="cursor-pointer transition-all duration-300"
            style={{
              filter: currentSector === 3 ? "drop-shadow(0 0 10px #CEDC00)" : "none",
            }}
            onMouseEnter={() => interactive && setHoveredSector(3)}
            onMouseLeave={() => interactive && setHoveredSector(null)}
            onClick={() => onSelectSector && onSelectSector(3)}
          />

          {/* Track Annotations */}
          <circle cx="210" cy="160" r="4" fill="#00FF87" />
          <circle cx="460" cy="210" r="4" fill="#00E5FF" />
          <circle cx="480" cy="340" r="4" fill="#CEDC00" />

          {/* Start/Finish Line */}
          <line x1="480" y1="326" x2="480" y2="354" stroke="#FFFFFF" strokeWidth="3" />
          <text x="490" y="344" fill="#FFFFFF" fontSize="9" fontFamily="monospace" fontWeight="bold">
            START / FINISH
          </text>
        </svg>

        {/* Telemetry Overlay Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSector}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-2 left-2 right-2 sm:right-auto sm:max-w-xs p-3.5 rounded-xl bg-amf1-card/95 border border-amf1-border/90 backdrop-blur-md shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider"
                style={{ backgroundColor: `${sectorInfo.color}20`, color: sectorInfo.color }}
              >
                {sectorInfo.name} · {sectorInfo.turns}
              </span>
              <span className="text-[9px] font-mono text-amf1-muted uppercase">LIVE SECTOR</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span className="text-lg font-mono font-black text-white">{sectorInfo.value}</span>
                <span className="text-[10px] font-mono text-amf1-silver block">{sectorInfo.metric}</span>
              </div>
              <span
                className="text-xs font-mono font-bold px-2 py-1 rounded bg-[#070D0C] border"
                style={{ borderColor: `${sectorInfo.color}40`, color: sectorInfo.color }}
              >
                {sectorInfo.delta}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sector Quick Switcher Buttons */}
      <div className="mt-4 pt-3 border-t border-amf1-border/60 grid grid-cols-3 gap-2">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => onSelectSector && onSelectSector(s)}
            className={`py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-between border transition-all ${
              activeSector === s
                ? "bg-amf1-card border-amf1-lime text-amf1-lime shadow-[0_0_12px_rgba(0,255,135,0.2)]"
                : "bg-amf1-bg/80 border-amf1-border text-amf1-muted hover:text-white"
            }`}
          >
            <span>SECTOR {s}</span>
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: CIRCUIT_SECTORS[s].color }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
