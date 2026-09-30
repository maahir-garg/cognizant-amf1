import { Fragment } from "react";
import { InlineFact } from "@/components/shared/fact-value";
import { parseCopy } from "@/lib/story/chapters";

/** Story copy with `{f:fact-id}` tokens rendered as inline, sourced figures. */
export function StoryCopy({ copy }: { copy: string }) {
  return (
    <>
      {parseCopy(copy).map((part, i) =>
        part.kind === "fact" ? <InlineFact key={i} id={part.id} /> : <Fragment key={i}>{part.text}</Fragment>,
      )}
    </>
  );
}
