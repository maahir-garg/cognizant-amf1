/**
 * The Latin faces of the two story fonts, loaded through next/font/local
 * from the self-hosted @fontsource-variable files (offline, no CDN). This
 * adds a preload and a metric-matched fallback, so the title page no longer
 * shifts when the web font arrives. Other scripts still come from the
 * @fontsource CSS in globals.css, listed after these in the font stacks.
 */
import localFont from "next/font/local";

export const newsreader = localFont({
  src: [
    { path: "../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-opsz-normal.woff2", style: "normal", weight: "200 800" },
    { path: "../node_modules/@fontsource-variable/newsreader/files/newsreader-latin-opsz-italic.woff2", style: "italic", weight: "200 800" },
  ],
  variable: "--font-newsreader",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

export const archivo = localFont({
  src: [{ path: "../node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2", style: "normal", weight: "100 900" }],
  variable: "--font-archivo",
  display: "swap",
  adjustFontFallback: "Arial",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});
