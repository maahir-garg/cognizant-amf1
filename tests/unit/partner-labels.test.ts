import { describe, expect, it } from "vitest";
import { getFact } from "@/lib/data/load";
import { DESK_CAPTION_IDS, deskCaption, repeatsUnit, withoutLeadingUnit } from "@/lib/partner/labels";
import { jointCognizantFacts, raceFacts } from "@/lib/partner/race-week";
import { ROI_BASELINES } from "@/lib/partner/roi";
import { cardLabel, storyKitInitiatives } from "@/lib/partner/story-kit";

describe("desk captions read on from the unit", () => {
  const tileIds = [
    ...DESK_CAPTION_IDS,
    ...raceFacts().filter((f) => f.value !== null).map((f) => f.id),
    ...jointCognizantFacts().filter((f) => f.value !== null).map((f) => f.id),
    ...ROI_BASELINES.map((b) => b.factId),
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
    expect(withoutLeadingUnit("Students engaged at the finals", "students")).toBe("engaged at the finals");
    expect(withoutLeadingUnit("Impressions for ESG content", "impressions")).toBe("for ESG content");
    expect(withoutLeadingUnit("Raised for charity", "GBP")).toBe("Raised for charity");
  });
});
