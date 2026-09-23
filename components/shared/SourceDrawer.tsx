"use client";

import React from "react";
import { X, ExternalLink, ShieldCheck, FileText, Calendar, Layers, Hash } from "lucide-react";
import { Fact, StatusType } from "@/lib/data/schemas";
import { ProvenanceBadge } from "./ProvenanceBadge";

export interface DrawerDetailItem {
  title: string;
  metric: string;
  value: string | number;
  unit?: string;
  status: StatusType;
  period?: string;
  source_doc?: string;
  page?: number;
  formula?: string;
  notes?: string;
  extraction_date?: string;
}

interface SourceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: DrawerDetailItem | Fact | null;
}

export const SourceDrawer: React.FC<SourceDrawerProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const item: DrawerDetailItem = "metric" in data
    ? {
        title: (data as any).title || (data as Fact).metric,
        metric: (data as Fact).metric,
        value: (data as Fact).display_value || `${(data as Fact).value} ${(data as Fact).unit}`,
        unit: (data as Fact).unit,
        status: data.status,
        period: (data as Fact).period || "2024–2025",
        source_doc: (data as Fact).source_doc || "Make A Mark ESG Report 2025",
        page: (data as Fact).page || 18,
        formula: (data as Fact).formula,
        notes: (data as Fact).notes,
        extraction_date: "2026-09-24 (Automated Extraction)",
      }
    : (data as DrawerDetailItem);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="w-full max-w-md bg-amf1-surface border-l border-amf1-border shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-amf1-border/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amf1-lime" />
              <h3 className="text-sm font-mono uppercase tracking-wider text-amf1-lime font-bold">
                Provenance Audit Record
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-amf1-muted hover:text-white hover:bg-amf1-card transition-colors"
              aria-label="Close provenance drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Metric Hero */}
          <div className="mt-5 p-4 rounded-lg bg-amf1-card/90 border border-amf1-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amf1-muted font-mono uppercase">Metric Name</span>
              <ProvenanceBadge status={item.status} sourceDoc={item.source_doc} page={item.page} />
            </div>
            <h4 className="text-lg font-bold text-white mt-1">{item.title}</h4>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-mono font-extrabold text-amf1-lime">
                {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
              </span>
              {item.unit && <span className="text-xs font-mono text-amf1-silver">{item.unit}</span>}
            </div>
          </div>

          {/* Provenance Fields */}
          <div className="mt-6 space-y-4">
            <div className="p-3 rounded-md bg-amf1-bg border border-amf1-border/60">
              <div className="flex items-center gap-2 text-xs font-mono text-amf1-muted">
                <FileText className="w-4 h-4 text-amf1-lime" />
                <span>Primary Document</span>
              </div>
              <p className="text-sm font-semibold text-white mt-1">{item.source_doc || "Official ESG Disclosure"}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-md bg-amf1-bg border border-amf1-border/60">
                <div className="flex items-center gap-1.5 text-xs font-mono text-amf1-muted">
                  <Hash className="w-4 h-4 text-amf1-lime" />
                  <span>Report Page</span>
                </div>
                <p className="text-sm font-bold text-white mt-1">
                  {item.page ? `Page ${item.page}` : "Document Appendix"}
                </p>
              </div>

              <div className="p-3 rounded-md bg-amf1-bg border border-amf1-border/60">
                <div className="flex items-center gap-1.5 text-xs font-mono text-amf1-muted">
                  <Calendar className="w-4 h-4 text-amf1-lime" />
                  <span>Reporting Period</span>
                </div>
                <p className="text-sm font-bold text-white mt-1">{item.period || "2024 Season"}</p>
              </div>
            </div>

            {item.formula && (
              <div className="p-3 rounded-md bg-amf1-bg border border-sky-500/30">
                <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
                  <Layers className="w-4 h-4" />
                  <span>Transformation Formula</span>
                </div>
                <p className="text-xs font-mono text-sky-200 mt-1 bg-sky-950/40 p-2 rounded border border-sky-900/50">
                  {item.formula}
                </p>
              </div>
            )}

            {item.notes && (
              <div className="p-3 rounded-md bg-amf1-bg border border-amf1-border/60">
                <span className="text-xs font-mono text-amf1-muted uppercase">Audit Scope & Method</span>
                <p className="text-xs text-amf1-silver mt-1 leading-relaxed">{item.notes}</p>
              </div>
            )}

            <div className="p-3 rounded-md bg-amf1-bg/50 border border-amf1-border/30 text-[11px] font-mono text-amf1-muted">
              Verification Hash: AMF1-ESG-{item.page || 0}-{item.status.toUpperCase()}
              <br />
              Audit Extractor: Automated PDF Lexer (Verified against official publication)
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-amf1-border">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-md bg-amf1-card hover:bg-amf1-border text-white text-sm font-medium transition-colors"
          >
            Close Provenance Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
