import { describe, expect, it } from "vitest";
import { cacheKey } from "@/lib/ai/engine";
import { STORY_DEFAULT_FAN, fanChapterRequest, quizRevealRequest, shareCaptionRequest } from "@/lib/ai/requests";
import { cities, heroRace, quizzes } from "@/lib/data/load";
import { FanProfile } from "@/lib/data/schemas";
import { nearestRaceFor, nearestRaceLabel, nearestRaceOptions, withNearestRace } from "@/lib/fan/nearest-race";
import { DEFAULT_FAN } from "@/lib/fan/quiz";
import { isUpcoming } from "@/lib/fan/race";

describe("nearest race options", () => {
  const options = nearestRaceOptions();

  it("start with Singapore, the one 2026 round, and offer only races with a page", () => {
    expect(options[0].id).toBe("singapore-2026");
    expect(options.filter((r) => isUpcoming(r)).map((r) => r.id)).toEqual(["singapore-2026"]);
  });

  it("offer one race per city, so Singapore 2025 never sits beside 2026", () => {
    const ids = options.map((r) => r.id);
    expect(ids).not.toContain("singapore-2025");
    expect(new Set(options.map((r) => r.cityId)).size).toBe(options.length);
  });

  it("cover every city's home race", () => {
    const ids = new Set(options.map((r) => r.id));
    for (const c of cities) if (c.homeRaceId) expect(ids.has(c.homeRaceId), c.id).toBe(true);
  });

  it("label past rounds as past, with their season", () => {
    expect(nearestRaceLabel(heroRace)).toBe("Singapore Grand Prix · 2026");
    for (const r of options.filter((x) => !isUpcoming(x))) expect(nearestRaceLabel(r)).toMatch(new RegExp(`· past race, ${r.season}$`));
  });
});

describe("the stored choice", () => {
  it("defaults to Singapore with no profile, no city or an unknown city", () => {
    expect(nearestRaceFor(null).id).toBe("singapore-2026");
    expect(nearestRaceFor(undefined).id).toBe("singapore-2026");
    expect(nearestRaceFor("atlantis").id).toBe("singapore-2026");
  });

  it("resolves a city through its home race", () => {
    expect(nearestRaceFor("silverstone").id).toBe("gbr-2025");
    expect(nearestRaceFor("kuala-lumpur").id).toBe("singapore-2026");
  });

  it("round-trips every option through the profile", () => {
    for (const r of nearestRaceOptions()) expect(nearestRaceFor(withNearestRace(null, r.id).cityId).id).toBe(r.id);
  });

  it("keeps the fan's depth and interests", () => {
    const fan: FanProfile = { level: "die-hard", cityId: "singapore", interests: ["inclusion"] };
    const next = withNearestRace(fan, "gbr-2025");
    expect(next).toEqual({ level: "die-hard", cityId: "silverstone", interests: ["inclusion"] });
    expect(FanProfile.safeParse(next).success).toBe(true);
    expect(withNearestRace(null, "gbr-2025")).toEqual({ ...DEFAULT_FAN, cityId: "silverstone" });
  });
});

describe("AI requests ignore the nearest race", () => {
  const near: FanProfile = { ...STORY_DEFAULT_FAN, cityId: "silverstone" };

  it("give the same request and cache key whichever race is chosen", () => {
    const quizId = quizzes[0].id;
    const pairs = [
      [fanChapterRequest(STORY_DEFAULT_FAN, "circuit"), fanChapterRequest(near, "circuit")],
      [fanChapterRequest({ ...STORY_DEFAULT_FAN, level: "die-hard" }, "beyond"), fanChapterRequest({ ...near, level: "die-hard" }, "beyond")],
      [quizRevealRequest(STORY_DEFAULT_FAN, quizId, true), quizRevealRequest(near, quizId, true)],
      [shareCaptionRequest(STORY_DEFAULT_FAN, ["e25-saf-airfreight-cut"], "singapore-2026"), shareCaptionRequest(near, ["e25-saf-airfreight-cut"], "singapore-2026")],
    ];
    for (const [a, b] of pairs) {
      expect(b).toEqual(a);
      expect(cacheKey(b)).toBe(cacheKey(a));
      expect(b.fan?.cityId).toBe("singapore");
    }
  });
});
