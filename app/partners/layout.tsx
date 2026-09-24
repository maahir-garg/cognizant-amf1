import type { ReactNode } from "react";
import { PartnerSubNav } from "@/components/partner/sub-nav";

export default function PartnersLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 sm:px-6">
      <PartnerSubNav />
      <div className="flex flex-1 flex-col gap-12 py-8">{children}</div>
    </div>
  );
}
