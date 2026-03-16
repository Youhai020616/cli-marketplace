import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import ReadmeRenderer from "@/components/ReadmeRenderer";
import { ToolJsonLd } from "@/components/JsonLd";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase.from("cli_tools").select("name, full_name, description, stars, language").eq("id", id).single();
  if (!data) return { title: "Tool Not Found" };
  const desc = data.description || `${data.name} — a CLI tool on GitHub`;
  return {
    title: `${data.name} — ${data.language || "CLI"} tool (${data.stars >= 1000 ? (data.stars/1000).toFixed(1)+"k" : data.stars} ★)`,
    description: `${desc} | ${data.full_name} — ${data.stars.toLocaleString()} stars on GitHub.`,
    alternates: { canonical: `https://cli-marketplace.vercel.app/cli/${id}` },
    openGraph: {
      title: `${data.name} — ${desc}`,
      description: `${data.full_name} — ${data.stars.toLocaleString()} ★ | ${data.language || "CLI tool"}`,
    },
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getTool(id: string) {
  const { data } = await supabase
    .from("cli_tools")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

async function fetchReadme(fullName: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${fullName}/readme`,
      {
        headers: {
          Accept: "application/vnd.github.raw+json",
          ...(process.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {}),
        },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export default async function ToolDetailPage({ params }: PageProps) {
  const { id } = await params;
  const tool = await getTool(id);

  if (!tool) notFound();

  const readme = tool.readme_content || (await fetchReadme(tool.full_name));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ToolJsonLd
        name={tool.name}
        description={tool.description || `${tool.name} — CLI tool`}
        url={tool.html_url}
        stars={tool.stars}
        language={tool.language}
        author={tool.owner_name}
      />
      {/* Breadcrumb */}
      <div className="font-pixel text-xs text-[#999] mb-6">
        <Link href="/" className="text-[#7c3aed] hover:underline">
          ~
        </Link>
        <span className="mx-1">/</span>
        <span>cli</span>
        <span className="mx-1">/</span>
        <span className="text-[#1a1a1a]">{tool.name}</span>
      </div>

      {/* Header */}
      <div className="border-2 border-[#e5e5e5] bg-white p-6 mb-6">
        <div className="flex items-start gap-4">
          {tool.owner_avatar && (
            <img
              src={tool.owner_avatar}
              alt={tool.owner_name}
              className="w-12 h-12"
              style={{ imageRendering: "pixelated" }}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-pixel text-xl text-[#7c3aed]">
                {tool.name}
              </h1>
              <FavoriteButton toolId={tool.id} />
            </div>
            <p className="font-pixel text-xs text-[#999] mb-3">
              from &quot;{tool.full_name}&quot;
            </p>
            <p className="font-pixel text-sm text-[#555]">
              {tool.description || "No description"}
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-[#eee] font-pixel text-xs">
          <span className="text-[#eab308]">★ {formatStars(tool.stars)}</span>
          {tool.language && (
            <span className="text-[#666]">◆ {tool.language}</span>
          )}
          <span className="text-[#999]">🔀 {tool.forks} forks</span>
          {tool.license && (
            <span className="text-[#999]">📄 {tool.license}</span>
          )}
          <span className="text-[#bbb]">
            updated {formatDate(tool.last_pushed_at)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-4 font-pixel text-xs">
          <a
            href={tool.html_url}
            target="_blank"
            className="border-2 border-[#7c3aed] text-[#7c3aed] px-4 py-2 hover:bg-[#7c3aed] hover:text-white transition-colors"
          >
            $ open github
          </a>
          {tool.install_command && (
            <div className="border-2 border-[#e5e5e5] text-[#666] px-4 py-2 select-all hover:border-[#a78bfa] transition-colors bg-[#fafafa]">
              $ {tool.install_command}
            </div>
          )}
          {tool.homepage && (
            <a
              href={tool.homepage}
              target="_blank"
              className="border-2 border-[#e5e5e5] text-[#666] px-4 py-2 hover:border-[#a78bfa] hover:text-[#7c3aed] transition-colors"
            >
              $ open homepage
            </a>
          )}
        </div>
      </div>

      {/* Topics */}
      {tool.topics && tool.topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {tool.topics.map((topic: string) => (
            <span
              key={topic}
              className="font-pixel text-xs border-2 border-[#e5e5e5] text-[#888] px-2 py-1 hover:border-[#7c3aed] hover:text-[#7c3aed] hover:bg-[#f5f0ff] transition-colors"
            >
              #{topic}
            </span>
          ))}
        </div>
      )}

      {/* README */}
      {readme ? (
        <div className="border-2 border-[#e5e5e5] bg-white p-6">
          <h2 className="font-pixel text-sm text-[#7c3aed] mb-4">
            $ cat README.md
          </h2>
          <ReadmeRenderer content={readme} fullName={tool.full_name} />
        </div>
      ) : (
        <div className="border-2 border-[#e5e5e5] bg-white p-6 text-center font-pixel text-sm text-[#999]">
          README not available
        </div>
      )}

      {/* Back */}
      <div className="mt-6 font-pixel text-xs">
        <Link href="/" className="text-[#7c3aed] hover:underline">
          ← cd ..
        </Link>
      </div>
    </div>
  );
}
