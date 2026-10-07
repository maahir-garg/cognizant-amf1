/**
 * localStorage keys for the fan pages. They were "impact-lap:*" before the
 * product was renamed; a value still under the old key is read once, moved
 * to the new key and the old one removed, so a returning fan keeps their
 * badge, plan and reading depth.
 */
const PREFIX = "off-camera:";
const LEGACY_PREFIX = "impact-lap:";

export const PROFILE_KEY = `${PREFIX}profile`;
export const QUICK_CHECK_KEY = `${PREFIX}quick-check`;
export const TRIP_PLAN_KEY = `${PREFIX}trip-plan`;
/** The optional first name for the share card. Stays in this browser: never sent to an API or put in a URL. */
export const CARD_NAME_KEY = `${PREFIX}card-name`;

/** Fired in the same tab after a write ('storage' only fires in other tabs). */
export const LOCAL_EVENT = `${PREFIX}local-storage`;

/** The raw stored string, or null when missing or storage is blocked. */
export function readStored(key: string): string | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw !== null || !key.startsWith(PREFIX)) return raw;
    const legacyKey = LEGACY_PREFIX + key.slice(PREFIX.length);
    const legacy = window.localStorage.getItem(legacyKey);
    if (legacy !== null) {
      window.localStorage.setItem(key, legacy);
      window.localStorage.removeItem(legacyKey);
    }
    return legacy;
  } catch {
    return null;
  }
}
