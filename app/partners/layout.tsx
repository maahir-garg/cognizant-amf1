import type { ReactNode } from "react";
import { DeskTabs } from "@/components/partner/desk-tabs";

/** Paper ground, 1680 frame, tabs across the top. Base text steps up to 16px on a projector-width screen. */
export default function PartnersLayout({ children }: { children: ReactNode }) {
  return (
    <div data-tone="paper" className="flex flex-1 flex-col text-[0.9375rem] leading-normal min-[1800px]:text-base">
      <DeskTabs />
      <div className="wrap-desk flex flex-1 flex-col pb-20">{children}</div>
    </div>
  );
}
