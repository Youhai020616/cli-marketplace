import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "CLI Tools Timeline & Statistics",
  description: "Visualize CLI tool growth over time. See trends, category distribution, and activity statistics.",
  alternates: { canonical: "https://cli-marketplace.vercel.app/timeline" },
};
import TimelineChart from "@/components/TimelineChart";
import CategoryPieChart from "@/components/CategoryPieChart";

async function getTimelineData() {
  const { data } = await supabase
    .from("cli_tools")
    .select("repo_created_at")
    .not("repo_created_at", "is", null)
    .order("repo_created_at", { ascending: true });

  if (!data) return [];

  // 按月聚合
  const monthMap = new Map<string, number>();
  for (const row of data) {
    const d = new Date(row.repo_created_at);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(month, (monthMap.get(month) || 0) + 1);
  }

  let cumulative = 0;
  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => {
      cumulative += count;
      return { month, count, cumulative };
    });
}

async function getCategoryDistribution() {
  const { data } = await supabase
    .from("categories")
    .select("name, tool_count, icon")
    .order("tool_count", { ascending: false });

  return (data ?? []).map((c) => ({
    name: c.name,
    count: c.tool_count || 0,
    icon: c.icon || "",
  }));
}

async function getStats() {
  const { count } = await supabase
    .from("cli_tools")
    .select("*", { count: "exact", head: true });
  return { total: count ?? 0 };
}

export default async function TimelinePage() {
  const [timelineData, categoryData, stats] = await Promise.all([
    getTimelineData(),
    getCategoryDistribution(),
    getStats(),
  ]);

  // 计算统计
  const peakMonth = timelineData.reduce(
    (max, d) => (d.count > max.count ? d : max),
    { month: "-", count: 0, cumulative: 0 }
  );
  const months = timelineData.length;
  const avgPerMonth = months > 0 ? Math.round(stats.total / months) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="font-pixel text-xs text-[#999] mb-6">
        <Link href="/" className="text-[#7c3aed] hover:underline">~</Link>
        <span className="mx-1">/</span>
        <span className="text-[#1a1a1a]">timeline</span>
      </div>

      <h1 className="font-pixel text-xl text-[#7c3aed] mb-2">
        &gt; CLI Timeline
      </h1>
      <p className="font-pixel text-xs text-[#888] mb-8">
        // Visualize CLI tool activity over time
      </p>

      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="border-2 border-[#e5e5e5] bg-white p-4">
          <div className="font-pixel text-xs text-[#999] mb-1">Total Tools</div>
          <div className="font-pixel text-2xl text-[#7c3aed]">{stats.total}</div>
        </div>
        <div className="border-2 border-[#e5e5e5] bg-white p-4">
          <div className="font-pixel text-xs text-[#999] mb-1">Average per Month</div>
          <div className="font-pixel text-2xl text-[#7c3aed]">{avgPerMonth}</div>
        </div>
        <div className="border-2 border-[#e5e5e5] bg-white p-4">
          <div className="font-pixel text-xs text-[#999] mb-1">Peak Month</div>
          <div className="font-pixel text-2xl text-[#7c3aed]">{peakMonth.count}</div>
          <div className="font-pixel text-xs text-[#bbb]">@ {peakMonth.month}</div>
        </div>
      </div>

      {/* Timeline chart */}
      <div className="border-2 border-[#e5e5e5] bg-white p-6 mb-8">
        <h2 className="font-pixel text-sm text-[#7c3aed] mb-4">
          $ plot timeline.data --type=area --cumulative
        </h2>
        <TimelineChart data={timelineData} />
      </div>

      {/* Category distribution */}
      <div className="border-2 border-[#e5e5e5] bg-white p-6">
        <h2 className="font-pixel text-sm text-[#7c3aed] mb-4">
          $ plot categories.data --type=pie
        </h2>
        <CategoryPieChart data={categoryData} />
      </div>
    </div>
  );
}
