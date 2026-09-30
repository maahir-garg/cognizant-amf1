import type { Metadata } from "next";
import { ShareBuilder } from "@/components/fan/share-builder";
import { heroRace } from "@/lib/data/load";
import { isTravelMode } from "@/lib/fan/trip";

export const metadata: Metadata = {
  title: "Make your card",
  description: "A race-week card for stories: your plan, a sourced team figure and your quick-check badge.",
};

export default async function SharePage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  return <ShareBuilder raceId={heroRace.id} initialMode={mode === "none" || isTravelMode(mode) ? (mode ?? null) : null} />;
}
