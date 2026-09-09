import type { Metadata } from "next";
import { Space_Grotesk, Geist_Mono } from "next/font/google";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hardwood Almanac — NBA Stats Explorer",
  description:
    "Season leaders, career trajectories, and team splits across 22 NBA seasons of box score data.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteNav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
          Hardwood Almanac · Data: 2003-04 through 2024-25 NBA box scores · Built with Next.js, Supabase &amp; shadcn/ui
        </footer>
      </body>
    </html>
  );
}
