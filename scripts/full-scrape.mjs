/**
 * Full CLI Tools Scraper
 * 
 * 全面抓取策略：
 * 1. 按 GitHub Topics 搜索（20+ topics）
 * 2. 按语言 + CLI 关键词组合搜索
 * 3. 按知名 CLI 框架依赖搜索
 * 4. 每个 query 搜 10 页（500 条）
 * 5. 智能去重 + 增量更新
 */

import pg from "pg";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error("Set GITHUB_TOKEN env var");
  process.exit(1);
}

const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;
if (!DB_PASSWORD) {
  console.error("Set SUPABASE_DB_PASSWORD env var");
  process.exit(1);
}

const MIN_STARS = 2;
const PAGES_PER_QUERY = 10;  // GitHub 最多返回 1000 条 (10 页 × 100)
const PER_PAGE = 100;

const client = new pg.Client({
  host: "db.ucdazttpaqiwsmsskigs.supabase.co",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

// ============================================
// 搜索 Queries - 全面覆盖
// ============================================
const QUERIES = [
  // --- Topic 搜索 ---
  "topic:cli",
  "topic:cli-tool",
  "topic:cli-app",
  "topic:cli-application",
  "topic:command-line",
  "topic:command-line-tool",
  "topic:command-line-interface",
  "topic:terminal",
  "topic:terminal-app",
  "topic:terminal-application",
  "topic:tui",
  "topic:console",
  "topic:console-application",
  "topic:shell-tool",
  "topic:devtool",
  "topic:developer-tools",

  // --- 按语言 + 关键词 ---
  "cli in:name language:go",
  "cli in:name language:rust",
  "cli in:name language:python",
  "cli in:name language:typescript",
  "cli in:name language:javascript",
  "cli tool in:name language:go",
  "cli tool in:name language:rust",
  "command line in:name,description language:go",
  "command line in:name,description language:rust",
  "command line in:name,description language:python",
  "terminal in:name language:go",
  "terminal in:name language:rust",
  "terminal in:name language:python",

  // --- CLI 框架相关 ---
  "topic:cobra",         // Go CLI framework
  "topic:clap",          // Rust CLI framework
  "topic:click",         // Python CLI framework
  "topic:argparse",
  "topic:commander",     // Node.js CLI
  "topic:inquirer",
  "topic:oclif",
  "topic:bubbletea",     // Go TUI
  "topic:ratatui",       // Rust TUI
  "topic:textual",       // Python TUI
  "topic:blessed",       // Node.js TUI
  "topic:ink",           // React CLI

  // --- 具体用途搜索 ---
  "topic:git-tool",
  "topic:devops-tools",
  "topic:docker-cli",
  "topic:kubernetes-cli",
  "topic:database-cli",
  "topic:http-client",
  "topic:api-client",
  "topic:file-manager",
  "topic:system-monitor",
  "topic:package-manager",
  "topic:static-site-generator",
  "topic:linter",
  "topic:formatter",
  "topic:code-formatter",
  "topic:code-quality",
  "topic:security-tools",
  "topic:penetration-testing",
  "topic:network-tools",
  "topic:benchmark",
  "topic:productivity",
  "topic:automation",

  // --- AI/LLM CLI ---
  "topic:ai-cli",
  "topic:llm-cli",
  "topic:chatgpt-cli",
  "topic:ai-coding",
  "topic:coding-agent",
  "topic:ai-agent",
  "ai cli in:name,description",
  "llm terminal in:name,description",
];

// ============================================
// 分类映射 - 扩展版
// ============================================
const CATEGORY_MAP = {
  // AI Agent
  "ai": "ai-agent", "ai-agent": "ai-agent", "ai-cli": "ai-agent",
  "ai-coding": "ai-agent", "coding-agent": "ai-agent", "llm": "ai-agent",
  "llm-cli": "ai-agent", "chatgpt": "ai-agent", "chatgpt-cli": "ai-agent",
  "copilot": "ai-agent", "ai-assistant": "ai-agent", "openai": "ai-agent",
  "anthropic": "ai-agent", "gemini": "ai-agent", "machine-learning": "ai-agent",

  // DevOps
  "docker": "devops", "docker-cli": "devops", "kubernetes": "devops",
  "kubernetes-cli": "devops", "k8s": "devops", "cicd": "devops",
  "ci-cd": "devops", "deployment": "devops", "monitoring": "devops",
  "cloud": "devops", "aws": "devops", "gcp": "devops", "azure": "devops",
  "terraform": "devops", "ansible": "devops", "helm": "devops",
  "devops": "devops", "devops-tools": "devops", "infrastructure": "devops",
  "container": "devops", "serverless": "devops",

  // Development
  "build-tool": "development", "scaffolding": "development",
  "linter": "development", "formatter": "development", "code-formatter": "development",
  "compiler": "development", "bundler": "development", "package-manager": "development",
  "boilerplate": "development", "generator": "development", "transpiler": "development",
  "code-quality": "development", "static-analysis": "development",
  "developer-tools": "development", "devtool": "development",
  "testing": "development", "test": "development", "benchmark": "development",

  // Database
  "database": "database", "database-cli": "database", "sql": "database",
  "postgresql": "database", "postgres": "database", "mysql": "database",
  "sqlite": "database", "mongodb": "database", "redis": "database",
  "migration": "database", "database-migration": "database",

  // Network
  "http": "network", "http-client": "network", "proxy": "network",
  "dns": "network", "api-client": "network", "curl": "network",
  "rest-client": "network", "grpc": "network", "websocket": "network",
  "network": "network", "network-tools": "network", "download": "network",
  "downloader": "network",

  // Security
  "security": "security", "security-tools": "security", "encryption": "security",
  "vulnerability": "security", "penetration-testing": "security", "pentest": "security",
  "audit": "security", "scanner": "security", "cybersecurity": "security",
  "password": "security", "hash": "security", "crypto": "security",

  // System
  "file-manager": "system", "process": "system", "system-monitor": "system",
  "disk": "system", "shell": "system", "shell-tool": "system",
  "system-information": "system", "system-administration": "system",
  "backup": "system", "file": "system", "filesystem": "system",
  "cleanup": "system", "dotfiles": "system",

  // Git
  "git": "git", "git-tool": "git", "github": "git", "gitlab": "git",
  "version-control": "git", "git-hooks": "git", "gitops": "git",
  "changelog": "git", "commit": "git",

  // Frontend
  "css": "frontend", "react": "frontend", "vue": "frontend", "svelte": "frontend",
  "ssg": "frontend", "static-site-generator": "frontend",
  "tailwind": "frontend", "nextjs": "frontend", "webpack": "frontend",
  "vite": "frontend",

  // Data
  "json": "data", "csv": "data", "yaml": "data", "toml": "data",
  "data-processing": "data", "parsing": "data", "xml": "data",
  "markdown": "data", "converter": "data", "transform": "data",

  // Documentation
  "documentation": "documentation", "docs": "documentation",
  "readme": "documentation", "api-documentation": "documentation",
  "doc-generator": "documentation", "man-page": "documentation",

  // Other
  "productivity": "other", "automation": "other", "utility": "other",
  "awesome": "other", "color": "other", "fun": "other", "game": "other",
  "music": "other", "weather": "other",
};

function detectCategories(repo) {
  const slugs = new Set();
  const words = [
    ...(repo.topics || []),
    ...(repo.description?.toLowerCase().split(/[\s,./\-_]+/) ?? []),
  ];
  for (const w of words) {
    const slug = CATEGORY_MAP[w.toLowerCase()];
    if (slug) slugs.add(slug);
  }
  if (slugs.size === 0) slugs.add("other");
  return [...slugs];
}

function guessInstall(repo) {
  const lang = repo.language?.toLowerCase();
  const name = repo.name;
  const full = repo.full_name;
  if (lang === "javascript" || lang === "typescript") return `npm install -g ${name}`;
  if (lang === "python") return `pip install ${name}`;
  if (lang === "rust") return `cargo install ${name}`;
  if (lang === "go") return `go install github.com/${full}@latest`;
  if (lang === "ruby") return `gem install ${name}`;
  if (lang === "c" || lang === "c++") return `# build from source: github.com/${full}`;
  return null;
}

// GitHub API 限速管理
let requestCount = 0;
let rateLimitRemaining = 30;

async function githubFetch(url) {
  requestCount++;

  if (rateLimitRemaining < 3) {
    console.log("  ⏳ Rate limit low, waiting 60s...");
    await sleep(60000);
  }

  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    },
  });

  rateLimitRemaining = parseInt(res.headers.get("x-ratelimit-remaining") || "30");

  if (res.status === 403 || res.status === 429) {
    const resetTime = parseInt(res.headers.get("x-ratelimit-reset") || "0") * 1000;
    const waitMs = Math.max(resetTime - Date.now(), 60000);
    console.log(`  ⏳ Rate limited, waiting ${Math.round(waitMs / 1000)}s...`);
    await sleep(waitMs);
    return githubFetch(url); // retry
  }

  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ============================================
// Main
// ============================================
async function run() {
  await client.connect();
  console.log("✅ Connected to DB\n");

  // 加载分类
  const catRes = await client.query("SELECT id, slug FROM categories");
  const catMap = Object.fromEntries(catRes.rows.map((r) => [r.slug, r.id]));

  // 已有数据
  const existingRes = await client.query("SELECT full_name FROM cli_tools");
  const existingSet = new Set(existingRes.rows.map((r) => r.full_name));
  console.log(`📦 Existing tools: ${existingSet.size}`);
  console.log(`📂 Categories: ${Object.keys(catMap).length}`);
  console.log(`🔍 Queries to run: ${QUERIES.length}\n`);

  const seen = new Set();
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (let qi = 0; qi < QUERIES.length; qi++) {
    const query = QUERIES[qi];
    console.log(`\n[${qi + 1}/${QUERIES.length}] "${query}"`);

    for (let page = 1; page <= PAGES_PER_QUERY; page++) {
      try {
        const q = `${query} stars:>=${MIN_STARS}`;
        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&page=${page}&per_page=${PER_PAGE}`;

        const data = await githubFetch(url);
        const repos = data.items || [];

        if (repos.length === 0) {
          console.log(`  page ${page}: empty, moving on`);
          break;
        }

        let pageInserted = 0;
        let pageSkipped = 0;

        for (const repo of repos) {
          if (seen.has(repo.full_name)) {
            pageSkipped++;
            continue;
          }
          seen.add(repo.full_name);

          const cats = detectCategories(repo);
          const install = guessInstall(repo);
          const signals = (repo.topics || [])
            .filter((t) => ["cli", "command-line-tool", "cli-tool", "terminal", "tui", "cli-app", "console"].includes(t))
            .map((t) => `topic:${t}`);

          const isExisting = existingSet.has(repo.full_name);

          try {
            const res = await client.query(
              `INSERT INTO cli_tools (name, full_name, description, stars, language, topics, homepage, html_url,
                last_pushed_at, repo_created_at, owner_avatar, owner_name, license, forks, open_issues,
                detection_signals, install_command, updated_at)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,NOW())
               ON CONFLICT (full_name) DO UPDATE SET
                 stars=$4, description=$3, language=$5, topics=$6, last_pushed_at=$9,
                 forks=$14, open_issues=$15, updated_at=NOW()
               RETURNING id`,
              [
                repo.name, repo.full_name, repo.description, repo.stargazers_count,
                repo.language, repo.topics || [], repo.homepage, repo.html_url,
                repo.pushed_at, repo.created_at, repo.owner.avatar_url, repo.owner.login,
                repo.license?.spdx_id ?? null, repo.forks_count, repo.open_issues_count,
                signals, install,
              ]
            );

            const toolId = res.rows[0].id;

            // 更新分类
            await client.query("DELETE FROM cli_tool_categories WHERE tool_id=$1", [toolId]);
            for (const slug of cats) {
              if (catMap[slug]) {
                await client.query(
                  "INSERT INTO cli_tool_categories (tool_id, category_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
                  [toolId, catMap[slug]]
                );
              }
            }

            if (isExisting) {
              updated++;
            } else {
              inserted++;
              existingSet.add(repo.full_name);
            }
            pageInserted++;
          } catch (e) {
            skipped++;
          }
        }

        console.log(`  page ${page}: +${pageInserted} new, ${pageSkipped} dup (rate: ${rateLimitRemaining})`);

        // API 速度控制
        await sleep(1200);
      } catch (e) {
        console.error(`  page ${page} error: ${e.message}`);
        if (e.message.includes("422")) break; // GitHub 不允许超过 1000 结果
      }
    }
  }

  // 更新分类计数
  console.log("\n📊 Updating category counts...");
  await client.query(`
    UPDATE categories SET tool_count = (
      SELECT COUNT(*) FROM cli_tool_categories WHERE category_id = categories.id
    )
  `);

  // 最终统计
  const finalCount = await client.query("SELECT count(*) as c FROM cli_tools");
  const catCount = await client.query("SELECT name, tool_count FROM categories ORDER BY tool_count DESC");

  console.log(`\n${"=".repeat(50)}`);
  console.log(`✅ Done!`);
  console.log(`   New: ${inserted}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total in DB: ${finalCount.rows[0].c}`);
  console.log(`   GitHub requests: ${requestCount}`);
  console.log(`\n📂 Categories:`);
  catCount.rows.forEach((r) => console.log(`   ${r.tool_count.toString().padStart(5)} ${r.name}`));

  await client.end();
}

run().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
