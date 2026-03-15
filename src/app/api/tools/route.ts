import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") || "stars";
  const search = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "24");
  const offset = (page - 1) * limit;

  let query = supabase.from("cli_tools").select("*", { count: "exact" });

  // 搜索
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,description.ilike.%${search}%,full_name.ilike.%${search}%`
    );
  }

  // 分类过滤
  if (category) {
    const { data: catData } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .single();

    if (catData) {
      const { data: toolIds } = await supabase
        .from("cli_tool_categories")
        .select("tool_id")
        .eq("category_id", catData.id);

      if (toolIds && toolIds.length > 0) {
        query = query.in(
          "id",
          toolIds.map((t) => t.tool_id)
        );
      } else {
        return NextResponse.json({ tools: [], total: 0, page, limit });
      }
    }
  }

  // 排序
  if (sort === "stars") {
    query = query.order("stars", { ascending: false });
  } else if (sort === "recent") {
    query = query.order("last_pushed_at", { ascending: false });
  }

  // 分页
  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    tools: data ?? [],
    total: count ?? 0,
    page,
    limit,
  });
}
