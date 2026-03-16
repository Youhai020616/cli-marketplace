import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/scrape", "/api/submit"],
      },
    ],
    sitemap: "https://cli-marketplace.vercel.app/sitemap.xml",
  };
}
