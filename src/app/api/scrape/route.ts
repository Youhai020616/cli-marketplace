import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { searchCLITools, getSearchQueries } from "@/lib/scraper";

// Support Vercel Cron (GET) and manual trigger (POST)
export async function GET(request: Request) {
  // Vercel Cron sends CRON_SECRET header
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return scrape();
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return scrape();
}

async function scrape() {

  const supabase = getServiceClient();
  const queries = getSearchQueries();
  let totalInserted = 0;
  let totalSkipped = 0;

  for (const query of queries) {
    try {
      const { tools } = await searchCLITools(query, 1, 30);

      for (const tool of tools) {
        // 先查分类 ID
        const { data: categories } = await supabase
          .from("categories")
          .select("id, slug")
          .in("slug", tool.category_slugs);

        const categoryIds = categories?.map((c) => c.id) ?? [];

        // Upsert 工具
        const { data: upserted, error } = await supabase
          .from("cli_tools")
          .upsert(
            {
              name: tool.name,
              full_name: tool.full_name,
              description: tool.description,
              stars: tool.stars,
              language: tool.language,
              topics: tool.topics,
              homepage: tool.homepage,
              html_url: tool.html_url,
              last_pushed_at: tool.last_pushed_at,
              repo_created_at: tool.repo_created_at,
              owner_avatar: tool.owner_avatar,
              owner_name: tool.owner_name,
              license: tool.license,
              forks: tool.forks,
              open_issues: tool.open_issues,
              detection_signals: tool.detection_signals,
              install_command: tool.install_command,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "full_name" }
          )
          .select("id")
          .single();

        if (error || !upserted) {
          totalSkipped++;
          continue;
        }

        // 关联分类
        if (categoryIds.length > 0) {
          // 先删旧关联
          await supabase
            .from("cli_tool_categories")
            .delete()
            .eq("tool_id", upserted.id);

          // 插入新关联
          await supabase.from("cli_tool_categories").insert(
            categoryIds.map((cid) => ({
              tool_id: upserted.id,
              category_id: cid,
            }))
          );
        }

        totalInserted++;
      }

      // GitHub API 限速
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      console.error(`Error scraping query "${query}":`, err);
    }
  }

  return NextResponse.json({
    success: true,
    inserted: totalInserted,
    skipped: totalSkipped,
  });
}
