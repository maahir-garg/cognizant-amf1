/** Quiet loading placeholder for AiText, sized like a couple of lines of body copy. */
export function AiSkeleton({ lines = 2 }: { lines?: number }) {
  return (
    <div className="flex flex-col gap-2" aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-4 animate-pulse rounded-sm bg-surface-2 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}
