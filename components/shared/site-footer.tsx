import Link from "next/link";
import { FOOTER_LABEL } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-6 text-xs text-ink-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>{FOOTER_LABEL}</p>
        <p>
          Not affiliated with or endorsed by Aston Martin Aramco F1 Team. Figures from public reports:{" "}
          <Link href="/sources" className="underline underline-offset-4 hover:text-ink">
            see sources
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
