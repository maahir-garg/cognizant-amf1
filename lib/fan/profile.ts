"use client";

/**
 * Fan profile: the small state the fan pages share (reading depth, plus the
 * default city and interests). Persisted to localStorage so the story, the
 * quick check and the share card agree across visits.
 */
import { useCallback, useSyncExternalStore } from "react";
import { FanProfile } from "@/lib/data/schemas";
import { LOCAL_EVENT, PROFILE_KEY, readStored } from "./local-keys";

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(LOCAL_EVENT, { detail: key }));
  } catch {
    // Storage unavailable (private mode, quota). Fail quietly; state just won't persist.
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(LOCAL_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LOCAL_EVENT, onChange);
  };
}

/* ------------------------------------------------------------------ profile */

let cachedProfileRaw: string | null | undefined;
let cachedProfile: FanProfile | null = null;

function getProfileSnapshot(): FanProfile | null {
  if (typeof window === "undefined") return null;
  // Blocked storage reads as "no profile yet".
  const raw = readStored(PROFILE_KEY);
  if (raw === cachedProfileRaw) return cachedProfile;
  cachedProfileRaw = raw;
  try {
    const parsed = raw ? FanProfile.safeParse(JSON.parse(raw)) : null;
    cachedProfile = parsed?.success ? parsed.data : null;
  } catch {
    cachedProfile = null;
  }
  return cachedProfile;
}

function getProfileServerSnapshot(): FanProfile | null {
  return null;
}

/** Read/write the fan's profile. `null` means no profile has been saved yet. */
export function useFanProfile() {
  const profile = useSyncExternalStore(subscribe, getProfileSnapshot, getProfileServerSnapshot);

  const setProfile = useCallback((next: FanProfile) => {
    writeJson(PROFILE_KEY, next);
  }, []);

  const clearProfile = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(PROFILE_KEY);
    } catch {
      // Nothing stored to clear.
    }
    window.dispatchEvent(new CustomEvent(LOCAL_EVENT, { detail: PROFILE_KEY }));
  }, []);

  return { profile, setProfile, clearProfile };
}
