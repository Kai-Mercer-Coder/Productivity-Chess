
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import LenisProvider from "@/components/layouts/LenisProvider";
import { SidebarProvider } from "@/components/layouts/SidebarContext";
import OnboardingOverlay from "@/components/profile/OnboardingOverlay";
import NetworkToaster from "@/components/NetworkToaster";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Productivity Chess",
  description:
    "Chess tactics training with puzzles, game analysis, and play modes",
  applicationName: "Productivity Chess",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        </head>
        <body className="min-h-full flex flex-col"><LenisProvider><SidebarProvider>{children}<OnboardingOverlay /><NetworkToaster /></SidebarProvider></LenisProvider></body>
      </html>
    </SessionProvider>
  );
}
