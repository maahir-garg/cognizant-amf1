/**
 * Class names for editorial tables that stack into labelled rows below
 * 768 px: each cell prints its column name from `data-label`, so a phone
 * never scrolls sideways and the header row is not needed.
 */
export const stack = {
  table: "w-full border-collapse text-left max-md:block",
  head: "max-md:hidden",
  body: "max-md:block max-md:border-t max-md:border-line",
  row: "border-b border-line max-md:block max-md:py-4",
  rowHead: "py-4 pr-6 align-top text-left font-sans text-base font-semibold text-ink max-md:block max-md:pr-0 max-md:pb-2",
  cell: "py-4 pr-6 align-top last:pr-0 max-md:block max-md:py-1 max-md:pr-0 max-md:before:mb-1 max-md:before:block max-md:before:font-sans max-md:before:text-xs max-md:before:font-semibold max-md:before:tracking-[0.06em] max-md:before:text-ink-3 max-md:before:uppercase max-md:before:content-[attr(data-label)]",
  headCell: "kicker border-b border-line-strong py-3 pr-6 text-left align-bottom text-ink-3 last:pr-0",
} as const;
