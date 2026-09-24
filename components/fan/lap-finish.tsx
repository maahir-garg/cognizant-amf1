import { ArrowRight, Share2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LapFinish() {
  return (
    <div className="flex flex-col items-start gap-6 py-4">
      <p className="label">Chequered flag</p>
      <h1 className="display text-[clamp(2.5rem,9vw,4rem)]">Lap complete</h1>
      <p className="max-w-prose text-ink-2">Next up: the Singapore Grand Prix weekend, with your matched ways to get involved.</p>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button asChild size="lg">
          <Link href="/weekend/singapore-2026">
            Your weekend: Singapore GP <ArrowRight />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/share">
            Make your card <Share2 />
          </Link>
        </Button>
      </div>
    </div>
  );
}
