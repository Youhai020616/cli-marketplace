import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://cli-marketplace.vercel.app";

  // 静态页面
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/categories`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/timeline`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/submit`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/docs/api`, changeFrequency: "monthly", priority: 0.5 },
  ];

  // 分类页面
  const { data: categories } = await supabase.from("categories").select("slug");
  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).map((cat) => ({
    url: `${baseUrl}/categories/${cat.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // 工具页面（取前 1000 个高星工具）
  const { data: tools } = await supabase
    .from("cli_tools")
    .select("id, last_pushed_at")
    .order("stars", { ascending: false })
    .limit(1000);

  const toolPages: MetadataRoute.Sitemap = (tools ?? []).map((tool) => ({
    url: `${baseUrl}/cli/${tool.id}`,
    lastModified: tool.last_pushed_at ? new Date(tool.last_pushed_at) : undefined,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...toolPages];
}
