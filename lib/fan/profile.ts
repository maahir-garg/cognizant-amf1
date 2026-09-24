"use client";

/**
 * Fan profile: the small state the whole fan experience is personalised
 * from (level, home city, interests). Persisted to localStorage so a fan's
 * lap, weekend view and share card stay consistent across visits.
 *
 * `useCredits` is the separate, simulated "impact credits" balance earned in
 * /act. Kept here alongside the profile because both are small local-storage
 * backed pieces of fan state with the same read/write shape.
 */
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { FanProfile } from "@/lib/data/schemas";

export { ALL_INTERESTS, FAN_LEVEL_COPY, INTEREST_COPY, decodeProfile, encodeProfile } from "./profile-codec";

const PROFILE_KEY = "impact-lap:profile";
const CREDITS_KEY = "impact-lap:credits";

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
  const raw = window.localStorage.getItem(PROFILE_KEY);
  if (raw === cachedProfileRaw) return cachedProfile;
  cachedProfileRaw = raw;
  const parsed = raw ? FanProfile.safeParse(JSON.parse(raw)) : null;
  cachedProfile = parsed?.success ? parsed.data : null;
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
    window.localStorage.removeItem(PROFILE_KEY);
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

/* ------------------------------------------------------------------ credits */

export type CreditEntry = { id: string; amount: number; reason: string; at: number };
export type CreditsState = { total: number; history: CreditEntry[] };

const EMPTY_CREDITS: CreditsState = { total: 0, history: [] };

let cachedCreditsRaw: string | null | undefined;
let cachedCredits: CreditsState = EMPTY_CREDITS;

function getCreditsSnapshot(): CreditsState {
  if (typeof window === "undefined") return EMPTY_CREDITS;
  const raw = window.localStorage.getItem(CREDITS_KEY);
  if (raw === cachedCreditsRaw) return cachedCredits;
  cachedCreditsRaw = raw;
  if (!raw) {
    cachedCredits = EMPTY_CREDITS;
    return cachedCredits;
  }
  try {
    const parsed = JSON.parse(raw) as CreditsState;
    cachedCredits = typeof parsed.total === "number" && Array.isArray(parsed.history) ? parsed : EMPTY_CREDITS;
  } catch {
    cachedCredits = EMPTY_CREDITS;
  }
  return cachedCredits;
}

function getCreditsServerSnapshot(): CreditsState {
  return EMPTY_CREDITS;
}

/** Simulated impact-credit balance. Earned in /act by picking a lower-carbon way to the circuit. */
export function useCredits() {
  const state = useSyncExternalStore(subscribe, getCreditsSnapshot, getCreditsServerSnapshot);

  const addCredits = useCallback((amount: number, reason: string) => {
    const current = getCreditsSnapshot();
    const entry: CreditEntry = { id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`, amount, reason, at: Date.now() };
    const next: CreditsState = { total: current.total + amount, history: [entry, ...current.history].slice(0, 20) };
    writeJson(CREDITS_KEY, next);
  }, []);

  const reset = useCallback(() => {
    writeJson(CREDITS_KEY, EMPTY_CREDITS);
  }, []);

  return { ...state, addCredits, reset };
}
