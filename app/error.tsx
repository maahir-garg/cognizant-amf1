"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-center gap-6 px-4 py-20 sm:px-6">
      <p className="label">Red flag</p>
      <h1 className="display text-6xl sm:text-8xl">Session stopped.</h1>
      <p className="max-w-md text-ink-2">Something went wrong loading this page. Your progress is saved on this device.</p>
      <Button size="lg" className="self-start" onClick={reset}>
        Restart the session
      </Button>
    </div>
  );
}
