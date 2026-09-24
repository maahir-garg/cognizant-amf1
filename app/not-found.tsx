import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-center gap-6 px-4 py-20 sm:px-6">
      <p className="label">404 · Off track</p>
      <h1 className="display text-6xl sm:text-8xl">Wrong turn.</h1>
      <p className="max-w-md text-ink-2">That page isn&apos;t on this circuit. Head back to the start of the lap.</p>
      <Button asChild size="lg" className="self-start">
        <Link href="/">Back to the start</Link>
      </Button>
    </div>
  );
}
