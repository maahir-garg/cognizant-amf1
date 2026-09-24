import type { Metadata } from "next";
import { ActClient } from "@/components/fan/act-client";
import { decodeProfile } from "@/lib/fan/profile-codec";

export const metadata: Metadata = { title: "What can you do?" };

export default async function ActPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams;
  return <ActClient paramProfile={decodeProfile(p)} />;
}
