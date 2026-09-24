import type { Metadata } from "next";
import { LapClient } from "@/components/fan/lap-client";
import { decodeProfile } from "@/lib/fan/profile-codec";

export const metadata: Metadata = { title: "Your lap" };

export default async function LapPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams;
  return <LapClient paramProfile={decodeProfile(p)} />;
}
