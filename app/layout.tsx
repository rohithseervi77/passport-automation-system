import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";
import Analytics from "@/components/Analytics";
import StickyMobileCTA from "@/components/StickyMobileCTA";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://passport-automation-system.vercel.app'),
  title: {
    default: "Passport Automation System",
    template: "%s | Passport Automation System"
  },
  description: "A centralized, digitized Passport Seva Automation Platform. Apply, track, and manage passport applications online.",
  keywords: ["Passport", "Automation", "System", "Passport Application", "Online Passport", "Gov Portal", "Passport Seva"],
  authors: [{ name: "Rohith Seervi" }],
  creator: "Rohith Seervi",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    title: "Passport Automation System",
    description: "Digitized complete passport issuance lifecycle online.",
    siteName: "Passport Automation System",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Passport Automation System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Passport Automation System",
    description: "Digitized complete passport issuance lifecycle online.",
    images: ["/opengraph-image"],
  },
  verification: {
    google: "YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-white">
        {children}
        <StickyMobileCTA />
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
