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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://7-0.world";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "7-0 — Build your all-time World XI",
  description:
    "Spin the reels, draft legends from football's greatest international tournament squads, and simulate a 7-game knockout run. Can you go a perfect 7-0?",
  openGraph: {
    title: "7-0 — Build your all-time World XI",
    description:
      "Draft an all-time World XI from history's greatest tournament squads and chase a perfect 7-0.",
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "7-0 — Build your all-time World XI",
    description:
      "Draft an all-time World XI from history's greatest tournament squads and chase a perfect 7-0.",
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
