"use client";

import { usePathname } from "next/navigation";

/**
 * Routes that speak to partners and judges keep the workings visible (fact
 * ids, the verifier, who drafted a paragraph). Everywhere else is a fan page
 * and gets the same facts in plain words.
 */
const TECHNICAL_PREFIXES = ["/partners", "/sources", "/how-it-works"];

function isFanPath(pathname: string | null): boolean {
  if (!pathname) return true;
  return !TECHNICAL_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function useFanSurface(): boolean {
  return isFanPath(usePathname());
}
