import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
  keywords: ["Passport", "Automation", "System", "Passport Application", "Online Passport", "Gov Portal"],
  authors: [{ name: "Rohith Seervi" }],
  creator: "Rohith Seervi",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    title: "Passport Automation System",
    description: "Digitized complete passport issuance lifecycle online.",
    siteName: "Passport Automation System",
  },
  twitter: {
    card: "summary_large_image",
    title: "Passport Automation System",
    description: "Digitized complete passport issuance lifecycle online.",
  },
  verification: {
    google: "YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE", // Placeholder for actual verification code
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
