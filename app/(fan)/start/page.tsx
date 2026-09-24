import type { Metadata } from "next";
import { StartClient } from "@/components/fan/start-client";
import { decodeProfile } from "@/lib/fan/profile-codec";

export const metadata: Metadata = { title: "Start your lap" };

export default async function StartPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams;
  return <StartClient paramProfile={decodeProfile(p)} />;
}
