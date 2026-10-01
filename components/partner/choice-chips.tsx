"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type Option<T extends string> = { value: T; label: string; hint?: string };

const chip =
  "relative flex min-h-12 cursor-pointer flex-col justify-center rounded-[4px] border border-line-strong bg-surface px-4 py-2 text-left font-medium text-ink transition-colors hover:bg-surface-2 has-[:checked]:border-2 has-[:checked]:border-ink has-[:checked]:bg-lime-tint has-[:checked]:px-[15px] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus";

/**
 * Choice chips on native inputs (visually hidden, still focusable and
 * arrow-key navigable). Selected: 2px ink border, lime tint and a ✓ in the
 * text, so the state never rests on colour.
 */
export function ChoiceChips<T extends string>({
  legend,
  options,
  value,
  onChange,
  layout = "row",
  className,
}: {
  legend: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  layout?: "row" | "column";
  className?: string;
}) {
  const name = useId();
  return (
    <fieldset className={cn("flex min-w-0 flex-col gap-2", className)}>
      <legend className="kicker mb-2">{legend}</legend>
      <div className={cn("flex gap-2", layout === "column" ? "flex-col" : "flex-wrap")}>
        {options.map((o) => {
          const checked = o.value === value;
          return (
            <label key={o.value} className={chip}>
              <input type="radio" name={name} value={o.value} checked={checked} onChange={() => onChange(o.value)} className="sr-only" />
              <span>
                {checked && <span aria-hidden>✓ </span>}
                {o.label}
              </span>
              {o.hint && <span className="text-[0.8125rem] font-normal text-ink-2">{o.hint}</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** The multi-select version, on native checkboxes. */
export function CheckChips<T extends string>({
  legend,
  options,
  values,
  onChange,
  className,
}: {
  legend: string;
  options: Option<T>[];
  values: T[];
  onChange: (values: T[]) => void;
  className?: string;
}) {
  return (
    <fieldset className={cn("flex min-w-0 flex-col gap-2", className)}>
      <legend className="kicker mb-2">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const checked = values.includes(o.value);
          return (
            <label key={o.value} className={chip}>
              <input
                type="checkbox"
                value={o.value}
                checked={checked}
                onChange={() => onChange(checked ? values.filter((v) => v !== o.value) : [...values, o.value])}
                className="sr-only"
              />
              <span>
                {checked && <span aria-hidden>✓ </span>}
                {o.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
