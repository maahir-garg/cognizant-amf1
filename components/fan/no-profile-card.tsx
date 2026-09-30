import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Shown on /weekend and /share when no fan profile exists yet. */
export function NoProfileCard() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-start gap-4 px-4 py-20 sm:px-6">
      <p className="label">First things first</p>
      <h1 className="font-serif font-medium leading-[1.05] tracking-tight text-4xl">Read the story</h1>
      <p className="text-ink-2">We need your fan level, home city and interests to personalise this page.</p>
      <Button asChild size="lg">
        <Link href="/">
          Read the story <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}
