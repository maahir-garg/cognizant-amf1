/**
 * Pure helpers for the fan profile: URL encoding and copy tables. Split from
 * profile.ts (which is "use client" for its localStorage hooks) so server
 * components — e.g. a page reading the `?p=` search param — can import this
 * without pulling in client-only code.
 */
import { cities } from "@/lib/data/load";
import { FanProfile, INTERESTS, type FanLevel, type Interest } from "@/lib/data/schemas";

/** Compact URL form, e.g. "new.singapore.environment-stem". Order is level.city.interests. */
export function encodeProfile(profile: FanProfile): string {
  return `${profile.level}.${profile.cityId}.${profile.interests.join("-")}`;
}

export function decodeProfile(param: string | null | undefined): FanProfile | null {
  if (!param) return null;
  const [level, cityId, interestsPart] = param.split(".");
  if (!level || !cityId || !interestsPart) return null;
  const interests = interestsPart.split("-");
  const parsed = FanProfile.safeParse({ level, cityId, interests });
  if (!parsed.success) return null;
  if (!cities.some((c) => c.id === parsed.data.cityId)) return null;
  return parsed.data;
}

export const FAN_LEVEL_COPY: Record<FanLevel, { label: string; description: string }> = {
  new: { label: "New to F1", description: "Explain things simply, skip the jargon." },
  casual: { label: "Casual fan", description: "I follow the sport, I don't need everything spelled out." },
  "die-hard": { label: "Die-hard", description: "Give me the detail and the data quality caveats too." },
};

export const INTEREST_COPY: Record<Interest, string> = {
  environment: "Environment",
  community: "Community",
  inclusion: "Inclusion",
  stem: "STEM",
  tech: "Tech",
};

export const ALL_INTERESTS = INTERESTS;
