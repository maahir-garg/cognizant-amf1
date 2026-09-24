import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Shown on /lap, /weekend, /share and /act when no fan profile exists yet. */
export function NoProfileCard() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-start gap-4 px-4 py-20 sm:px-6">
      <p className="label">First things first</p>
      <h1 className="display text-4xl">Set up your lap</h1>
      <p className="text-ink-2">We need your fan level, home city and interests to personalise this page.</p>
      <Button asChild size="lg">
        <Link href="/start">
          Start your lap <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}
