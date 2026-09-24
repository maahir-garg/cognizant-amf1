"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FanProfile } from "@/lib/data/schemas";
import { useResolvedProfile } from "@/lib/fan/profile";
import { GetToCircuitTab } from "./get-to-circuit-tab";
import { NoProfileCard } from "./no-profile-card";
import { ProgrammeTab } from "./programme-tab";
import { VolunteerTab } from "./volunteer-tab";

export function ActClient({ paramProfile }: { paramProfile: FanProfile | null }) {
  const profile = useResolvedProfile(paramProfile);
  if (!profile) return <NoProfileCard />;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-2">
        <p className="label">Beyond the broadcast</p>
        <h1 className="display text-[clamp(2.5rem,9vw,4rem)]">What can you do?</h1>
      </div>

      <Tabs defaultValue="circuit">
        <TabsList className="h-auto w-full flex-wrap gap-1 bg-transparent p-0">
          <TabsTrigger value="circuit" className="min-h-11 flex-1 border border-line data-active:border-lime">
            Get to the circuit
          </TabsTrigger>
          <TabsTrigger value="volunteer" className="min-h-11 flex-1 border border-line data-active:border-lime">
            Volunteer
          </TabsTrigger>
          <TabsTrigger value="programme" className="min-h-11 flex-1 border border-line data-active:border-lime">
            Your programme
          </TabsTrigger>
        </TabsList>
        <TabsContent value="circuit" className="pt-6">
          <GetToCircuitTab />
        </TabsContent>
        <TabsContent value="volunteer" className="pt-6">
          <VolunteerTab />
        </TabsContent>
        <TabsContent value="programme" className="pt-6">
          <ProgrammeTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
