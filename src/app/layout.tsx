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
  title: "Athey - AI Space & Cosmos Assistant",
  description: "Ask Athey anything about the cosmos, satellites, SpaceX, ISRO, and more. Real-time space data at your fingertips. Your AI guide to the universe.",
  keywords: ["AI assistant", "space", "cosmos", "satellite tracking", "SpaceX", "ISRO", "NASA", "orbital mechanics", "astronomy", "ISS"],
  icons: {
    icon: "/logo.jpeg",
    shortcut: "/logo.jpeg",
    apple: "/logo.jpeg",
  },
  openGraph: {
    title: "Athey - AI Space & Cosmos Assistant",
    description: "Real-time satellite tracking, SpaceX launches, and cosmic exploration with Athey",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
