import { Fragment, type ReactNode } from "react";
import { InlineFact } from "@/components/shared/fact-value";
import { parseCopy } from "@/lib/story/chapters";

const TRAIL = /^[.,;:!?)\u2019]+/;

/**
 * Story copy with `{f:fact-id}` tokens rendered as inline, sourced figures.
 * Punctuation right after a figure stays on its line ("5,124 tCO₂e." never
 * wraps to a lone full stop).
 */
export function StoryCopy({ copy }: { copy: string }) {
  const parts = parseCopy(copy);
  const out: ReactNode[] = [];
  parts.forEach((part, i) => {
    if (part.kind === "fact") {
      const next = parts[i + 1];
      const trail = next?.kind === "text" ? (TRAIL.exec(next.text)?.[0] ?? "") : "";
      // Padding with matching negative margin: a taller tap target without opening up the line.
      const fact = <InlineFact id={part.id} className="-my-2.5 py-2.5" />;
      out.push(
        trail ? (
          <span key={i} className="whitespace-nowrap">
            {fact}
            {trail}
          </span>
        ) : (
          <Fragment key={i}>{fact}</Fragment>
        ),
      );
    } else {
      const prev = parts[i - 1];
      const text = prev?.kind === "fact" ? part.text.replace(TRAIL, "") : part.text;
      out.push(<Fragment key={i}>{text}</Fragment>);
    }
  });
  return <>{out}</>;
}
