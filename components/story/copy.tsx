import { Fragment } from "react";
import { InlineFact } from "@/components/shared/fact-value";
import { parseCopy } from "@/lib/story/chapters";

/** Story copy with `{f:fact-id}` tokens rendered as inline, sourced figures. */
export function StoryCopy({ copy }: { copy: string }) {
  return (
    <>
      {parseCopy(copy).map((part, i) =>
        part.kind === "fact" ? (
          // Padding with matching negative margin: a taller tap target without opening up the line.
          <InlineFact key={i} id={part.id} className="-my-2.5 py-2.5" />
        ) : (
          <Fragment key={i}>{part.text}</Fragment>
        ),
      )}
    </>
  );
}
