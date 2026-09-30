"use client";

/**
 * Fan profile: the small state the whole fan experience is personalised
 * from (level, home city, interests). Persisted to localStorage so a fan's
 * weekend view and share card stay consistent across visits.
 */
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { FanProfile } from "@/lib/data/schemas";

export { ALL_INTERESTS, FAN_LEVEL_COPY, INTEREST_COPY, decodeProfile, encodeProfile } from "./profile-codec";

const PROFILE_KEY = "impact-lap:profile";

/** Fires in the same tab when we write localStorage ('storage' only fires cross-tab). */
const LOCAL_EVENT = "impact-lap:local-storage";

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
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(PROFILE_KEY);
  } catch {
    // Blocked storage reads as "no profile yet".
  }
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

/**
 * Resolves the profile a page should use: a `?p=` param (already decoded by
 * the caller) wins and is saved as the fan's new profile; otherwise falls
 * back to whatever is in storage. Lets a demo link fully set up a persona.
 */
export function useResolvedProfile(paramProfile: FanProfile | null): FanProfile | null {
  const { profile, setProfile } = useFanProfile();

  useEffect(() => {
    if (paramProfile) setProfile(paramProfile);
    // Only re-run if the encoded param itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramProfile ? JSON.stringify(paramProfile) : null]);

  return paramProfile ?? profile;
}
