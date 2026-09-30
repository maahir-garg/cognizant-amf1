import type { Metadata } from "next";
import { DeskHeader } from "@/components/partner/desk-header";
import { DraftChecker } from "@/components/partner/draft-checker";

export const metadata: Metadata = { title: "Impact desk: check my draft" };

export default function CheckDraftPage() {
  return (
    <>
      <DeskHeader
        kicker="Impact desk · Check my draft"
        title="Check every number in your own copy"
        dek="Paste a post you have written. Each number is matched to a published figure and given a citation, or held back with the reason. It runs in the browser, instantly, with no AI model involved."
      />
      <DraftChecker />
    </>
  );
}
