"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DEFAULT_SHARE_FACT_IDS } from "@/lib/ai/requests";
import type { Race } from "@/lib/data/schemas";
import { raceShortName } from "@/lib/fan/race";
import { useTripPlan } from "@/lib/fan/storage";
import { isTravelMode, planLine } from "@/lib/fan/trip";
import { SHARE_CARD_HEIGHT, SHARE_CARD_WIDTH, ShareCard } from "./share-card";

const PREVIEW_WIDTH = 240;
const SCALE = PREVIEW_WIDTH / SHARE_CARD_WIDTH;
// The teaser stops below the source line: the bottom clear zone is empty by design and reads as a gap at this size.
const VISIBLE_HEIGHT = 1600;

/**
 * The race page's hand-off to /share, with a small preview of the default
 * card. It follows the planner's saved plan, so the link and the preview
 * change as soon as the fan picks a different way to the circuit; the
 * server-rendered mode (from the GET params) is only the starting point.
 */
export function CardTeaser({ race, modeId: initialMode }: { race: Race; modeId: string }) {
  const [plan] = useTripPlan();
  const modeId = plan?.raceId === race.id && isTravelMode(plan.modeId) ? plan.modeId : initialMode;
  return (
    <section aria-labelledby="card-title" data-tone="green">
      <div className="wrap grid items-center gap-10 py-[clamp(48px,8vw,96px)] md:grid-cols-12 md:gap-6">
        <div className="flex flex-col items-start gap-5 md:col-span-7 lg:col-span-6">
          <p className="kicker kicker-rule">Something worth posting</p>
          <h2 id="card-title" className="h2-chapter max-w-[20ch]">
            Make your {raceShortName(race)} race&#8209;week card
          </h2>
          <p className="dek">Your plan, a team figure you choose and your quick-check badge, sized for stories.</p>
          <Button asChild size="lg">
            <Link href={`/share?mode=${modeId}`}>Make your card →</Link>
          </Button>
        </div>
        <div aria-hidden className="md:col-span-4 md:col-start-9 lg:col-start-9">
          <div
            className="mx-auto overflow-hidden rounded-md border border-line-strong md:mx-0"
            style={{ width: PREVIEW_WIDTH, height: VISIBLE_HEIGHT * SCALE }}
          >
            <div style={{ width: SHARE_CARD_WIDTH, height: SHARE_CARD_HEIGHT, transform: `scale(${SCALE})`, transformOrigin: "top left" }}>
              <ShareCard raceShortName={raceShortName(race)} factIds={DEFAULT_SHARE_FACT_IDS} planLine={planLine(modeId, race)} badge={false} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
