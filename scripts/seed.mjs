import pg from "pg";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const MIN_STARS = 2;

const client = new pg.Client({
  host: "db.ucdazttpaqiwsmsskigs.supabase.co",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

const CATEGORY_MAP = {
  "ai-agent": "ai-agent", "ai-coding": "ai-agent", "coding-agent": "ai-agent",
  "llm": "ai-agent", "chatgpt": "ai-agent", "copilot": "ai-agent",
  "ai-assistant": "ai-agent", "openai": "ai-agent", "anthropic": "ai-agent",
  "docker": "devops", "kubernetes": "devops", "cicd": "devops", "ci-cd": "devops",
  "deployment": "devops", "monitoring": "devops", "cloud": "devops", "terraform": "devops",
  "build-tool": "development", "scaffolding": "development", "linter": "development",
  "formatter": "development", "compiler": "development", "package-manager": "development",
  "database": "database", "sql": "database", "postgresql": "database", "mysql": "database",
  "mongodb": "database", "redis": "database",
  "http": "network", "http-client": "network", "proxy": "network", "api-client": "network",
  "security": "security", "encryption": "security", "vulnerability": "security",
  "file-manager": "system", "shell": "system", "system-monitor": "system",
  "git": "git", "github": "git", "git-tool": "git", "version-control": "git",
  "css": "frontend", "react": "frontend", "vue": "frontend",
  "json": "data", "csv": "data", "yaml": "data",
  "documentation": "documentation", "markdown": "documentation", "docs": "documentation",
};

function detectCategories(repo) {
  const slugs = new Set();
  const words = [...repo.topics, ...(repo.description?.toLowerCase().split(/\s+/) ?? [])];
  for (const w of words) {
    if (CATEGORY_MAP[w]) slugs.add(CATEGORY_MAP[w]);
  }
  if (slugs.size === 0) slugs.add("other");
  return [...slugs];
}

function guessInstall(repo) {
  const lang = repo.language?.toLowerCase();
  const name = repo.name;
  if (lang === "javascript" || lang === "typescript") return `npm install -g ${name}`;
  if (lang === "python") return `pip install ${name}`;
  if (lang === "rust") return `cargo install ${name}`;
  if (lang === "go") return `go install github.com/${repo.full_name}@latest`;
  return null;
}

async function fetchGitHub(query, page = 1) {
  const q = `${query} stars:>=${MIN_STARS}`;
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&page=${page}&per_page=50`;
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${GITHUB_TOKEN}` },
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`);
  return res.json();
}

async function run() {
  await client.connect();
  console.log("Connected to DB");

  // 加载分类
  const catRes = await client.query("SELECT id, slug FROM categories");
  const catMap = Object.fromEntries(catRes.rows.map((r) => [r.slug, r.id]));
  console.log("Categories loaded:", Object.keys(catMap).length);

  const queries = [
    "topic:cli",
    "topic:command-line-tool",
    "topic:cli-tool",
    "topic:terminal-app",
    "topic:tui",
  ];

  let total = 0;
  const seen = new Set();

  for (const query of queries) {
    for (let page = 1; page <= 3; page++) {
      try {
        console.log(`Fetching: ${query} page ${page}...`);
        const data = await fetchGitHub(query, page);
        const repos = data.items || [];
        if (repos.length === 0) break;

        for (const repo of repos) {
          if (seen.has(repo.full_name)) continue;
          seen.add(repo.full_name);

          const cats = detectCategories(repo);
          const install = guessInstall(repo);
          const signals = repo.topics
            .filter((t) => ["cli", "command-line-tool", "cli-tool", "terminal", "tui"].includes(t))
            .map((t) => `topic:${t}`);

          try {
            const res = await client.query(
              `INSERT INTO cli_tools (name, full_name, description, stars, language, topics, homepage, html_url,
                last_pushed_at, repo_created_at, owner_avatar, owner_name, license, forks, open_issues,
                detection_signals, install_command)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
               ON CONFLICT (full_name) DO UPDATE SET stars=$4, last_pushed_at=$9, updated_at=NOW()
               RETURNING id`,
              [
                repo.name, repo.full_name, repo.description, repo.stargazers_count,
                repo.language, repo.topics, repo.homepage, repo.html_url,
                repo.pushed_at, repo.created_at, repo.owner.avatar_url, repo.owner.login,
                repo.license?.spdx_id ?? null, repo.forks_count, repo.open_issues_count,
                signals, install,
              ]
            );

            const toolId = res.rows[0].id;

            // 关联分类
            await client.query("DELETE FROM cli_tool_categories WHERE tool_id=$1", [toolId]);
            for (const slug of cats) {
              if (catMap[slug]) {
                await client.query(
                  "INSERT INTO cli_tool_categories (tool_id, category_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
                  [toolId, catMap[slug]]
                );
              }
            }
            total++;
          } catch (e) {
            // skip duplicates
          }
        }

        // Rate limit
        await new Promise((r) => setTimeout(r, 1500));
      } catch (e) {
        console.error(`Error: ${e.message}`);
      }
    }
  }

  // 验证
  const countRes = await client.query("SELECT count(*) FROM cli_tools");
  console.log(`\nDone! Inserted/updated ${total} tools. Total in DB: ${countRes.rows[0].count}`);

  await client.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
