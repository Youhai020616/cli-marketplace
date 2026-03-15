"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    router.push(`/?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex border-2 border-[#e5e5e5] bg-white focus-within:border-[#7c3aed] transition-colors">
        <span className="text-[#7c3aed] font-pixel px-3 py-3 text-sm select-none">
          $find
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search cli tools..."
          className="flex-1 bg-transparent text-[#1a1a1a] font-pixel text-sm px-2 py-3 outline-none placeholder-[#ccc]"
        />
        <button
          type="submit"
          className="text-white bg-[#7c3aed] font-pixel px-4 py-3 text-sm hover:bg-[#6d28d9] transition-colors"
        >
          ENTER
        </button>
      </div>
    </form>
  );
}
