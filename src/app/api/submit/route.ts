import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

const CATEGORY_MAP: Record<string, string> = {
  "ai-agent": "ai-agent", "ai-coding": "ai-agent", "coding-agent": "ai-agent",
  "llm": "ai-agent", "chatgpt": "ai-agent", "copilot": "ai-agent",
  "docker": "devops", "kubernetes": "devops", "cicd": "devops",
  "deployment": "devops", "terraform": "devops",
  "build-tool": "development", "linter": "development", "formatter": "development",
  "database": "database", "sql": "database", "postgresql": "database",
  "http": "network", "http-client": "network", "proxy": "network",
  "security": "security", "encryption": "security",
  "shell": "system", "file-manager": "system",
  "git": "git", "github": "git",
  "react": "frontend", "vue": "frontend", "css": "frontend",
  "json": "data", "csv": "data", "yaml": "data",
  "documentation": "documentation", "markdown": "documentation",
};

function guessInstall(name: string, lang: string | null): string | null {
  const l = lang?.toLowerCase();
  if (l === "javascript" || l === "typescript") return `npm install -g ${name}`;
  if (l === "python") return `pip install ${name}`;
  if (l === "rust") return `cargo install ${name}`;
  if (l === "go") return `go install github.com/${name}@latest`;
  return null;
}

export async function POST(request: Request) {
  const { repoUrl } = await request.json();

  // 解析 GitHub URL
  const match = repoUrl?.match(/github\.com\/([^/]+\/[^/]+)/);
  if (!match) {
    return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });
  }

  const fullName = match[1].replace(/\.git$/, "");

  // 从 GitHub API 获取仓库信息
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(`https://api.github.com/repos/${fullName}`, { headers });

  if (!res.ok) {
    if (res.status === 404) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to fetch repository" }, { status: 500 });
  }

  const repo = await res.json();

  if (repo.stargazers_count < 2) {
    return NextResponse.json({ error: "Repository must have at least 2 stars" }, { status: 400 });
  }

  // 推断分类
  const slugs = new Set<string>();
  const words = [...(repo.topics || []), ...(repo.description?.toLowerCase().split(/\s+/) ?? [])];
  for (const w of words) {
    if (CATEGORY_MAP[w]) slugs.add(CATEGORY_MAP[w]);
  }
  if (slugs.size === 0) slugs.add("other");

  const supabase = getServiceClient();

  // Upsert 工具
  const { data: tool, error } = await supabase
    .from("cli_tools")
    .upsert({
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      stars: repo.stargazers_count,
      language: repo.language,
      topics: repo.topics || [],
      homepage: repo.homepage,
      html_url: repo.html_url,
      last_pushed_at: repo.pushed_at,
      repo_created_at: repo.created_at,
      owner_avatar: repo.owner.avatar_url,
      owner_name: repo.owner.login,
      license: repo.license?.spdx_id ?? null,
      forks: repo.forks_count,
      open_issues: repo.open_issues_count,
      detection_signals: ["user-submitted"],
      install_command: guessInstall(repo.name, repo.language),
      updated_at: new Date().toISOString(),
    }, { onConflict: "full_name" })
    .select("id")
    .single();

  if (error || !tool) {
    return NextResponse.json({ error: "Failed to save tool" }, { status: 500 });
  }

  // 关联分类
  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug")
    .in("slug", Array.from(slugs));

  if (categories && categories.length > 0) {
    await supabase.from("cli_tool_categories").delete().eq("tool_id", tool.id);
    await supabase.from("cli_tool_categories").insert(
      categories.map((c) => ({ tool_id: tool.id, category_id: c.id }))
    );
  }

  return NextResponse.json({
    success: true,
    name: repo.full_name,
    stars: repo.stargazers_count,
    id: tool.id,
  });
}
