export function WebsiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CLI Marketplace",
    url: "https://cli-marketplace.vercel.app",
    description: "Discover and explore 3,700+ CLI tools from GitHub.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://cli-marketplace.vercel.app/?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ToolJsonLd({
  name,
  description,
  url,
  stars,
  language,
  author,
}: {
  name: string;
  description: string;
  url: string;
  stars: number;
  language: string | null;
  author: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Cross-platform",
    programmingLanguage: language,
    author: { "@type": "Person", name: author },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: Math.min(5, Math.round((stars / 10000) * 5 * 10) / 10),
      bestRating: 5,
      ratingCount: stars,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
