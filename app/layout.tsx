import type { Metadata, Viewport } from "next";
import { ProvenanceProvider } from "@/components/shared/provenance";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { APP_NAME, APP_TAGLINE, isDemoMode } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: `${APP_TAGLINE} A concept prototype that turns Aston Martin Aramco's published ESG data into a trusted, personalised view of impact.`,
};

export const viewport: Viewport = {
  themeColor: "#0b1a16",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className="dark">
      <body className="flex min-h-dvh flex-col">
        <TooltipProvider delayDuration={150}>
          <ProvenanceProvider>
            <SiteHeader demo={isDemoMode()} />
            <main className="flex flex-1 flex-col">{children}</main>
            <SiteFooter />
          </ProvenanceProvider>
        </TooltipProvider>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
