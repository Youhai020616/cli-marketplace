"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "stars";

  function setSort(sort: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    params.set("page", "1");
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1 font-pixel text-xs mb-6">
      <span className="text-[#999] mr-2">Sort by</span>
      <button
        onClick={() => setSort("stars")}
        className={`px-3 py-1 border-2 transition-colors ${
          currentSort === "stars"
            ? "border-[#7c3aed] text-[#7c3aed] bg-[#f5f0ff]"
            : "border-[#e5e5e5] text-[#888] hover:border-[#a78bfa] hover:text-[#7c3aed]"
        }`}
      >
        ★ Stars
      </button>
      <button
        onClick={() => setSort("recent")}
        className={`px-3 py-1 border-2 transition-colors ${
          currentSort === "recent"
            ? "border-[#7c3aed] text-[#7c3aed] bg-[#f5f0ff]"
            : "border-[#e5e5e5] text-[#888] hover:border-[#a78bfa] hover:text-[#7c3aed]"
        }`}
      >
        ↻ Recent
      </button>
    </div>
  );
}
