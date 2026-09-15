import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreHydrator } from "@/store/providers";

const inter = Inter({
  variable: "--font-inter",
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
  themeColor: "#f2f4f5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-bg text-text-primary">
        <StoreHydrator />
        {children}
      </body>
    </html>
  );
}
