import type { Metadata } from "next";
import { GeistPixelSquare } from "geist/font/pixel";
import { GeistMono } from "geist/font/mono";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { WebsiteJsonLd } from "@/components/JsonLd";
import "./globals.css";

const SITE_URL = "https://cli-marketplace.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CLI Marketplace — Discover CLI Tools for Developers",
    template: "%s | CLI Marketplace",
  },
  description:
    "Discover and explore 3,700+ CLI tools from GitHub. The largest collection of command-line tools for developers — search, browse by category, and find the perfect CLI tool.",
  keywords: [
    "CLI tools", "command line tools", "terminal tools", "developer tools",
    "CLI marketplace", "GitHub CLI", "TUI", "command line interface",
    "devtools", "open source CLI", "coding tools", "terminal apps",
  ],
  authors: [{ name: "CLI Marketplace" }],
  creator: "CLI Marketplace",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "CLI Marketplace",
    title: "CLI Marketplace — Discover CLI Tools for Developers",
    description:
      "Discover and explore 3,700+ CLI tools from GitHub. Search, browse by category, and find the perfect command-line tool.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CLI Marketplace — Discover CLI Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CLI Marketplace — Discover CLI Tools",
    description: "3,700+ CLI tools from GitHub. Search, browse, discover.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <WebsiteJsonLd />
      </head>
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
