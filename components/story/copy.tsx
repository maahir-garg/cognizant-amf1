import { Fragment } from "react";
import { InlineFact } from "@/components/shared/fact-value";
import { parseCopy } from "@/lib/story/chapters";

const TRAIL = /^[.,;:!?)’]+/;

/**
 * Story copy with `{f:fact-id}` tokens rendered as inline, sourced figures.
 * Punctuation right after a figure travels with it as `trail`, so
 * "5,124 tCO₂e." never wraps to a lone full stop.
 */
export function StoryCopy({ copy }: { copy: string }) {
  const parts = parseCopy(copy);
  return (
    <>
      {parts.map((part, i) => {
        if (part.kind === "fact") {
          const next = parts[i + 1];
          const trail = next?.kind === "text" ? TRAIL.exec(next.text)?.[0] : undefined;
          return <InlineFact key={i} id={part.id} trail={trail} />;
        }
        const prev = parts[i - 1];
        return <Fragment key={i}>{prev?.kind === "fact" ? part.text.replace(TRAIL, "") : part.text}</Fragment>;
      })}
    </>
  );
}
