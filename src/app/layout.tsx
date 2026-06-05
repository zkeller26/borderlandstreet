import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import { EmbedResizeBroadcaster } from "@/components/embed-resize-broadcaster";

const display = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Borderland Street Team",
  description: "Earn your free Borderland Festival ticket.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <EmbedResizeBroadcaster />
        {children}
      </body>
    </html>
  );
}
