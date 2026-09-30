import type { Metadata, Viewport } from "next";
import { ProvenanceProvider } from "@/components/shared/provenance";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { APP_NAME, isDemoMode } from "@/lib/config";
import { archivo, newsreader } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description:
    "The story of the AMR26 off camera: where it is built, how it is moved round the world, what powers the garage, who the team reaches and how far it has to go. Every figure opens to the page of the team's own report it came from.",
};

export const viewport: Viewport = {
  themeColor: "#f5f3ec",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${newsreader.variable} ${archivo.variable}`}>
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
