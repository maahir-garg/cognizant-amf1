"use client";

import type { ReactNode } from "react";
import { useFanSurface } from "./surface";

/** Renders its children on partner, sources and explainer routes only, never on fan pages. */
export function PartnerOnly({ children }: { children: ReactNode }) {
  return useFanSurface() ? null : <>{children}</>;
}
