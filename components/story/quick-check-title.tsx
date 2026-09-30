"use client";

import { DEPTH_COPY } from "@/lib/fan/quiz";
import { useDepth } from "@/lib/fan/storage";

/** "Test yourself: 3 questions", with the count the quick check really asks at the fan's depth. */
export function QuickCheckTitle() {
  const [depth] = useDepth();
  const n = DEPTH_COPY[depth].count;
  return (
    <>
      Test yourself: {n} question{n === 1 ? "" : "s"}
    </>
  );
}
