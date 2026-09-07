import type { Metadata, Viewport } from "next";
import { Poppins, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { StoreHydrator } from "@/store/providers";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Uni Mart — campus marketplace",
  description:
    "Buy, sell and swap inside your campus. Verified students trading textbooks, electronics, hostel gear, bikes, merch, tickets and services.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#15101d",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text-primary">
        <StoreHydrator />
        {children}
      </body>
    </html>
  );
}
