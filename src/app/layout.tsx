import type { Metadata } from "next";
import { GeistPixelSquare } from "geist/font/pixel";
import { GeistMono } from "geist/font/mono";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "CLI Marketplace — Discover CLI Tools",
  description:
    "Discover and explore CLI tools from GitHub. The largest collection of command-line tools for developers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistPixelSquare.variable} ${GeistMono.variable} bg-white text-[#1a1a1a] min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
