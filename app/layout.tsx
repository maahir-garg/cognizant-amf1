import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { SITE_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} | ${SITE_CONFIG.subtitle}`,
  description: SITE_CONFIG.tagline,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-amf1-bg text-slate-100 antialiased selection:bg-amf1-lime selection:text-amf1-bg">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
