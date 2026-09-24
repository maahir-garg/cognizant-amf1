import type { Metadata } from "next";
import { ShareClient } from "@/components/fan/share-client";
import { decodeProfile } from "@/lib/fan/profile-codec";

export const metadata: Metadata = { title: "Make your card" };

export default async function SharePage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams;
  return <ShareClient paramProfile={decodeProfile(p)} />;
}
