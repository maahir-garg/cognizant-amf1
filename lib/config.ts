/** Product constants. Rename the product here and nowhere else. */
export const APP_NAME = "Impact Lap";
export const APP_TAGLINE = "Aston Martin Aramco's impact, one lap at a time.";
export const TEAM_NAME = "Team Growthbeans";
export const FOOTER_LABEL = "Concept prototype: Team Growthbeans, AMF1 × Cognizant Ideathon 2026";
export const HERO_RACE_ID = "singapore-2026";
export const PARTNER_ID = "cognizant";
export const PARTNER_NAME = "Cognizant";

/**
 * Demo mode serves AI text from data/ai-cache and never calls the network.
 * It is ON unless DEMO_MODE=false and a model key is configured, so a fresh
 * clone or a keyless deploy always works. Server-only.
 */
export function isDemoMode(): boolean {
  if (process.env.DEMO_MODE === "false") return !process.env.GEMINI_API_KEY;
  return true;
}
