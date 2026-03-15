import { Suspense } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import SortToggle from "@/components/SortToggle";
import PixelCard from "@/components/PixelCard";
import { supabase } from "@/lib/supabase";

interface PageProps {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}

async function getTools(q: string, sort: string, page: number) {
  const limit = 24;
  const offset = (page - 1) * limit;

  let query = supabase.from("cli_tools").select("*", { count: "exact" });

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,description.ilike.%${q}%,full_name.ilike.%${q}%`
    );
  }

  if (sort === "recent") {
    query = query.order("last_pushed_at", { ascending: false });
  } else {
    query = query.order("stars", { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count } = await query;
  return { tools: data ?? [], total: count ?? 0 };
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

async function getTopCategories() {
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("tool_count", { ascending: false })
    .limit(6);
  return data ?? [];
}

async function getTotalCount() {
  const { count } = await supabase
    .from("cli_tools")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q || "";
  const sort = params.sort || "stars";
  const page = parseInt(params.page || "1");

  const [{ tools, total }, totalCount, topCategories] = await Promise.all([
    getTools(q, sort, page),
    getTotalCount(),
    getTopCategories(),
  ]);

  const totalPages = Math.ceil(total / 24);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="font-pixel text-xs text-[#999] mb-2">
          cli.marketplace
        </div>
        <h1 className="font-pixel text-2xl md:text-3xl text-[#7c3aed] mb-2">
          &gt; CLI Marketplace
        </h1>
        <p className="font-pixel text-sm text-[#888] mb-1">
          &gt; for the open CLI ecosystem
        </p>
        <p className="font-pixel text-xs text-[#bbb]">
          const tools = {formatNumber(totalCount)};
        </p>
      </div>

      {/* Search */}
      <Suspense>
        <SearchBar />
      </Suspense>

      {/* Sort */}
      <Suspense>
        <SortToggle />
      </Suspense>

      {/* Categories quick nav */}
      {!q && page === 1 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="font-pixel text-xs text-[#999]">$ ls ./categories/</span>
            <Link href="/categories" className="font-pixel text-xs text-[#7c3aed] hover:underline">
              view all →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {topCategories.map((cat: Record<string, unknown>) => (
              <Link
                key={cat.id as string}
                href={`/categories/${cat.slug}`}
                className="font-pixel text-xs border-2 border-[#e5e5e5] px-3 py-1.5 hover:border-[#7c3aed] hover:text-[#7c3aed] hover:bg-[#f5f0ff] transition-colors text-[#666]"
              >
                {cat.icon as string} {cat.name as string} <span className="text-[#ccc]">({cat.tool_count as number})</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="font-pixel text-xs text-[#999] mb-4">
        <span className="text-[#7c3aed]">ready</span>
        <span className="text-[#ddd]"> // </span>
        <span>
          {q ? `search: "${q}" — ` : ""}
          {total} tools found
        </span>
      </div>

      {/* Grid */}
      {tools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tools.map((tool: Record<string, unknown>) => (
            <PixelCard
              key={tool.id as string}
              id={tool.id as string}
              name={tool.name as string}
              fullName={tool.full_name as string}
              description={tool.description as string | null}
              stars={tool.stars as number}
              language={tool.language as string | null}
              ownerAvatar={tool.owner_avatar as string | null}
              ownerName={tool.owner_name as string}
              lastPushedAt={tool.last_pushed_at as string}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 font-pixel">
          <p className="text-[#999] text-sm">
            {q ? `No tools found for "${q}"` : "No tools yet. Run the scraper first."}
          </p>
          <p className="text-[#ccc] text-xs mt-2">
            $ curl -X POST /api/scrape
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 font-pixel text-xs">
          {page > 1 && (
            <a
              href={`/?q=${q}&sort=${sort}&page=${page - 1}`}
              className="text-[#7c3aed] hover:underline"
            >
              ← prev
            </a>
          )}
          <span className="text-[#999]">
            page {page}/{totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`/?q=${q}&sort=${sort}&page=${page + 1}`}
              className="text-[#7c3aed] hover:underline"
            >
              next →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
