import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Browse CLI Tools by Category",
  description: "Explore CLI tools organized by category — AI Agent, DevOps, Development, Database, Network, Security, System, Git, Frontend, Data, and more.",
  alternates: { canonical: "https://cli-marketplace.vercel.app/categories" },
};

async function getCategories() {
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("tool_count", { ascending: false });
  return data ?? [];
}

export default async function CategoriesPage() {
  const categories = await getCategories();
  const totalTools = categories.reduce((sum, c) => sum + (c.tool_count || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="font-pixel text-xs text-[#999] mb-2">
        <Link href="/" className="text-[#7c3aed] hover:underline">~</Link>
        <span className="mx-1">/</span>
        <span className="text-[#1a1a1a]">categories</span>
      </div>

      <h1 className="font-pixel text-xl text-[#7c3aed] mb-2">
        &gt; Browse by Category
      </h1>
      <p className="font-pixel text-xs text-[#999] mb-8">
        $ Explore CLI tools organized by use case — {totalTools} tools across {categories.length} categories
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/categories/${cat.slug}`}>
            <div className="group border-2 border-[#e5e5e5] bg-white hover:border-[#7c3aed] hover:shadow-[4px_4px_0px_#7c3aed22] transition-all p-5 cursor-pointer h-full">
              {/* Category header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{cat.icon}</span>
                <span className="font-pixel text-xs text-[#7c3aed]">
                  {cat.slug}/
                </span>
              </div>

              {/* Name */}
              <h2 className="font-pixel text-sm font-bold text-[#1a1a1a] group-hover:text-[#7c3aed] transition-colors mb-1">
                {cat.name}
              </h2>

              {/* Description */}
              <p className="font-pixel text-xs text-[#888] mb-3">
                {cat.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between font-pixel text-xs">
                <span className="text-[#999]">
                  // {cat.tool_count || 0} tools
                </span>
                <span className="text-[#ccc] group-hover:text-[#7c3aed] transition-colors">
                  $cd {cat.slug} && ls
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
