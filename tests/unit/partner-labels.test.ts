import { describe, expect, it } from "vitest";
import { getFact } from "@/lib/data/load";
import { captionAfterUnit } from "@/lib/format";
import { DESK_CAPTION_IDS, deskCaption } from "@/lib/partner/labels";

/** A caption repeats its unit when the shared helper would still strip something from it. */
const repeatsUnit = (caption: string, unit: string) => captionAfterUnit(caption, unit) !== caption;
import { jointCognizantFacts, raceFacts } from "@/lib/partner/race-week";
import { PUBLISHED_BASELINES } from "@/lib/partner/measures";
import { cardLabel, storyKitInitiatives } from "@/lib/partner/story-kit";

describe("desk captions read on from the unit", () => {
  const tileIds = [
    ...DESK_CAPTION_IDS,
    ...raceFacts().filter((f) => f.value !== null).map((f) => f.id),
    ...jointCognizantFacts().filter((f) => f.value !== null).map((f) => f.id),
    ...PUBLISHED_BASELINES.map((b) => b.factId),
  ];

  it.each([...new Set(tileIds)])("%s", (id) => {
    const fact = getFact(id);
    expect(repeatsUnit(deskCaption(id), fact.unit), deskCaption(id)).toBe(false);
  });

  it("card and kit labels never repeat the unit either", () => {
    for (const i of storyKitInitiatives())
      for (const id of i.factIds) {
        const f = getFact(id);
        if (f.value !== null) expect(repeatsUnit(cardLabel(id), f.unit), `${id}: ${cardLabel(id)}`).toBe(false);
      }
  });

  it("strips a leading unit from a fallback label", () => {
    expect(deskCaption("c25-stem-racing-students")).toBe("at the STEM Racing World Finals in Singapore");
    expect(captionAfterUnit("Students engaged at the finals", "students")).toBe("engaged at the finals");
  });
});
