"use client";

import { useCallback } from "react";
import type { Race } from "@/lib/data/schemas";
import { nearestRaceFor, withNearestRace } from "./nearest-race";
import { useFanProfile } from "./profile";

/**
 * The fan's nearest race, from the stored profile. The server and the first
 * client render see no profile, so they agree on Singapore; a stored choice
 * swaps in after hydration.
 */
export function useNearestRace(): { race: Race; setRace: (raceId: string) => void } {
  const { profile, setProfile } = useFanProfile();
  const race = nearestRaceFor(profile?.cityId);
  const setRace = useCallback((raceId: string) => setProfile(withNearestRace(profile, raceId)), [profile, setProfile]);
  return { race, setRace };
}
