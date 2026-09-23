import React from "react";
import { SITE_CONFIG } from "@/lib/config";
import { ShieldCheck, Leaf, HeartHandshake } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-amf1-border/60 bg-amf1-bg/95 py-8 text-amf1-muted text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Notice */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <span className="font-mono text-amf1-silver font-semibold">
            {SITE_CONFIG.name}
          </span>
          <span className="hidden sm:inline text-amf1-border">|</span>
          <p className="font-mono text-amf1-muted">
            {SITE_CONFIG.footerNotice}
          </p>
        </div>

        {/* Center Pillars */}
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span className="flex items-center gap-1 text-amf1-lime">
            <Leaf className="w-3.5 h-3.5" />
            Environment
          </span>
          <span className="flex items-center gap-1 text-amf1-cyan">
            <HeartHandshake className="w-3.5 h-3.5" />
            Belong
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            Community & Governance
          </span>
        </div>

        {/* Right Info */}
        <div className="text-[11px] font-mono text-amf1-muted/80 text-center sm:text-right">
          Singapore GP Special Edition · Pitch Date: 8 Oct 2026
        </div>
      </div>
    </footer>
  );
};
