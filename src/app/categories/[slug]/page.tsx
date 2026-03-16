import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import PixelCard from "@/components/PixelCard";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await supabase.from("categories").select("name, description, tool_count").eq("slug", slug).single();
  if (!data) return { title: "Category Not Found" };
  return {
    title: `${data.name} CLI Tools (${data.tool_count})`,
    description: `${data.description} — Browse ${data.tool_count} ${data.name} CLI tools on CLI Marketplace.`,
    alternates: { canonical: `https://cli-marketplace.vercel.app/categories/${slug}` },
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}

async function getCategory(slug: string) {
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}

async function getCategoryTools(
  categoryId: string,
  sort: string,
  page: number
) {
  const limit = 24;
  const offset = (page - 1) * limit;

  // 获取该分类下的工具 ID
  const { data: relations } = await supabase
    .from("cli_tool_categories")
    .select("tool_id")
    .eq("category_id", categoryId);

  if (!relations || relations.length === 0) {
    return { tools: [], total: 0 };
  }

  const toolIds = relations.map((r) => r.tool_id);

  let query = supabase
    .from("cli_tools")
    .select("*", { count: "exact" })
    .in("id", toolIds);

  if (sort === "recent") {
    query = query.order("last_pushed_at", { ascending: false });
  } else {
    query = query.order("stars", { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count } = await query;
  return { tools: data ?? [], total: count ?? 0 };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const sort = sp.sort || "stars";
  const page = parseInt(sp.page || "1");

  const category = await getCategory(slug);
  if (!category) notFound();

  const { tools, total } = await getCategoryTools(category.id, sort, page);
  const totalPages = Math.ceil(total / 24);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="font-pixel text-xs text-[#999] mb-6">
        <Link href="/" className="text-[#7c3aed] hover:underline">~</Link>
        <span className="mx-1">/</span>
        <Link href="/categories" className="hover:text-[#7c3aed] transition-colors">categories</Link>
        <span className="mx-1">/</span>
        <span className="text-[#7c3aed]">{category.slug}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{category.icon}</span>
        <h1 className="font-pixel text-xl text-[#7c3aed]">
          {category.name}
        </h1>
      </div>
      <p className="font-pixel text-xs text-[#888] mb-6">
        {category.description} — {total} tools
      </p>

      {/* Sort */}
      <div className="flex items-center gap-1 font-pixel text-xs mb-6">
        <span className="text-[#999] mr-2">Sort by</span>
        <a
          href={`/categories/${slug}?sort=stars&page=1`}
          className={`px-3 py-1 border-2 transition-colors ${
            sort === "stars"
              ? "border-[#7c3aed] text-[#7c3aed] bg-[#f5f0ff]"
              : "border-[#e5e5e5] text-[#888] hover:border-[#a78bfa] hover:text-[#7c3aed]"
          }`}
        >
          ★ Stars
        </a>
        <a
          href={`/categories/${slug}?sort=recent&page=1`}
          className={`px-3 py-1 border-2 transition-colors ${
            sort === "recent"
              ? "border-[#7c3aed] text-[#7c3aed] bg-[#f5f0ff]"
              : "border-[#e5e5e5] text-[#888] hover:border-[#a78bfa] hover:text-[#7c3aed]"
          }`}
        >
          ↻ Recent
        </a>
      </div>

      {/* Tools grid */}
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
        <div className="text-center py-20 font-pixel text-sm text-[#999]">
          No tools in this category yet.
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 font-pixel text-xs">
          {page > 1 && (
            <a
              href={`/categories/${slug}?sort=${sort}&page=${page - 1}`}
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
              href={`/categories/${slug}?sort=${sort}&page=${page + 1}`}
              className="text-[#7c3aed] hover:underline"
            >
              next →
            </a>
          )}
        </div>
      )}

      {/* Back */}
      <div className="mt-6 font-pixel text-xs">
        <Link href="/categories" className="text-[#7c3aed] hover:underline">
          ← cd ..
        </Link>
      </div>
    </div>
  );
}
