import type { Metadata } from "next";
import { DeskHeader } from "@/components/partner/desk-header";
import { ScenarioStudio } from "@/components/partner/scenario-studio";
import { StatusBadge } from "@/components/shared/status-badge";

export const metadata: Metadata = { title: "Impact desk: scenarios" };

export default function ScenariosPage() {
  return (
    <>
      <DeskHeader
        kicker="Impact desk · Scenarios"
        title="Plan the joint programmes"
        dek="What more Make A Mark Day editions, a wider STEM programme or extra mentoring cohorts could reach, scaled from the team's published results. Every output is an estimate with its formula shown."
        aside={<StatusBadge status="estimated" />}
      />
      <ScenarioStudio />
    </>
  );
}
