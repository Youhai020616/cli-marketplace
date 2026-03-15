/**
 * Turbo Scraper - 3 tokens 轮换，3 倍速度
 */
import pg from "pg";

const TOKENS = [
  process.env.TOKEN1,
  process.env.TOKEN2,
  process.env.TOKEN3,
].filter(Boolean);

console.log(`🔑 ${TOKENS.length} tokens loaded\n`);

const client = new pg.Client({
  host: "db.ucdazttpaqiwsmsskigs.supabase.co", port: 5432,
  database: "postgres", user: "postgres",
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

const CATEGORY_MAP = {
  'ai':'ai-agent','ai-agent':'ai-agent','ai-cli':'ai-agent','llm':'ai-agent',
  'chatgpt':'ai-agent','copilot':'ai-agent','openai':'ai-agent','anthropic':'ai-agent',
  'machine-learning':'ai-agent','deep-learning':'ai-agent','gpt':'ai-agent',
  'docker':'devops','kubernetes':'devops','k8s':'devops','cicd':'devops','ci-cd':'devops',
  'terraform':'devops','ansible':'devops','helm':'devops','devops':'devops',
  'deployment':'devops','monitoring':'devops','cloud':'devops','aws':'devops','gcp':'devops',
  'infrastructure':'devops','container':'devops','serverless':'devops',
  'linter':'development','formatter':'development','compiler':'development',
  'bundler':'development','package-manager':'development','testing':'development',
  'test':'development','benchmark':'development','build-tool':'development',
  'scaffolding':'development','generator':'development','code-quality':'development',
  'static-analysis':'development','developer-tools':'development','devtool':'development',
  'database':'database','sql':'database','postgresql':'database','postgres':'database',
  'mysql':'database','sqlite':'database','mongodb':'database','redis':'database',
  'migration':'database','database-migration':'database',
  'http':'network','http-client':'network','proxy':'network','dns':'network',
  'api-client':'network','curl':'network','rest':'network','grpc':'network',
  'websocket':'network','download':'network','downloader':'network','network':'network',
  'security':'security','encryption':'security','vulnerability':'security',
  'pentest':'security','penetration-testing':'security','audit':'security',
  'scanner':'security','cybersecurity':'security','password':'security',
  'file-manager':'system','process':'system','system-monitor':'system',
  'shell':'system','disk':'system','filesystem':'system','backup':'system',
  'dotfiles':'system','cleanup':'system','system-information':'system',
  'git':'git','github':'git','gitlab':'git','version-control':'git',
  'git-hooks':'git','gitops':'git','changelog':'git','commit':'git',
  'css':'frontend','react':'frontend','vue':'frontend','svelte':'frontend',
  'ssg':'frontend','static-site-generator':'frontend','webpack':'frontend',
  'vite':'frontend','tailwind':'frontend','nextjs':'frontend',
  'json':'data','csv':'data','yaml':'data','toml':'data','xml':'data',
  'markdown':'data','converter':'data','transform':'data','parsing':'data',
  'documentation':'documentation','docs':'documentation','readme':'documentation',
  'api-documentation':'documentation','doc-generator':'documentation',
  'productivity':'other','automation':'other','utility':'other','fun':'other',
  'game':'other','music':'other','weather':'other','color':'other',
};

function detectCats(repo) {
  const s = new Set();
  const words = [...(repo.topics||[]), ...(repo.description?.toLowerCase().split(/[\s,./\-_]+/)??[])];
  for (const w of words) { if (CATEGORY_MAP[w]) s.add(CATEGORY_MAP[w]); }
  if (s.size===0) s.add('other');
  return [...s];
}

function guessInstall(r) {
  const l = r.language?.toLowerCase();
  if (l==='javascript'||l==='typescript') return `npm install -g ${r.name}`;
  if (l==='python') return `pip install ${r.name}`;
  if (l==='rust') return `cargo install ${r.name}`;
  if (l==='go') return `go install github.com/${r.full_name}@latest`;
  if (l==='ruby') return `gem install ${r.name}`;
  return null;
}

let tokenIdx = 0;
let requestCount = 0;

async function githubFetch(url) {
  const token = TOKENS[tokenIdx % TOKENS.length];
  tokenIdx++;
  requestCount++;

  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}` },
  });

  if (res.status === 403 || res.status === 429) {
    // 这个 token 限速了，换下一个等一下再试
    console.log(`  ⏳ token ${(tokenIdx-1) % TOKENS.length + 1} rate limited, switching...`);
    await new Promise(r => setTimeout(r, 5000));
    return githubFetch(url); // retry with next token
  }

  if (res.status === 422) throw new Error("422");
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  return res.json();
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

const QUERIES = [
  // 关键词搜索（上次没跑完的）
  "command-line in:description language:rust",
  "command-line in:description language:python",
  "command-line in:description language:c",
  "command-line in:description language:typescript",
  "command-line in:description language:javascript",
  "command-line in:description language:java",
  "command-line in:description language:ruby",
  "command-line in:description language:swift",
  "command-line in:description language:kotlin",
  "command-line in:description language:c++",
  "command-line in:description language:c#",
  "terminal tool in:name,description language:go",
  "terminal tool in:name,description language:rust",
  "terminal tool in:name,description language:python",
  "tui in:name language:go",
  "tui in:name language:rust",
  "tui in:name language:python",

  // CLI 框架
  "topic:cobra", "topic:clap", "topic:click", "topic:typer",
  "topic:commander", "topic:oclif", "topic:yargs",
  "topic:bubbletea", "topic:ratatui", "topic:crossterm",
  "topic:textual", "topic:rich", "topic:blessed", "topic:ink",
  "topic:charmbracelet",

  // 用途搜索
  "topic:git-tool", "topic:devops-tools", "topic:docker-cli",
  "topic:kubernetes-cli", "topic:kubectl-plugin",
  "topic:database-cli", "topic:sql-client",
  "topic:http-client", "topic:api-client", "topic:rest-client",
  "topic:file-manager", "topic:system-monitor", "topic:task-manager",
  "topic:package-manager", "topic:version-manager",
  "topic:linter", "topic:formatter", "topic:code-formatter",
  "topic:security-tools", "topic:penetration-testing", "topic:osint",
  "topic:network-tools", "topic:port-scanner", "topic:dns-tool",
  "topic:benchmark", "topic:profiler",
  "topic:static-site-generator", "topic:markdown-editor",
  "topic:task-runner", "topic:build-tool",
  "topic:dotfiles", "topic:shell-script",
  "topic:json-tool", "topic:csv-tool", "topic:yaml-tool",

  // AI/LLM CLI
  "topic:ai-cli", "topic:llm-cli", "topic:chatgpt-cli",
  "topic:ai-coding", "topic:coding-agent", "topic:ai-agent",
  "topic:claude", "topic:ollama",
  "ai assistant cli in:name,description",
  "llm command line in:name,description",
  "chatgpt terminal in:name,description",

  // 知名工具生态
  "topic:neovim-plugin", "topic:tmux", "topic:zsh-plugin",
  "topic:fish-plugin", "topic:bash-script",
  "topic:homebrew", "topic:apt", "topic:snap",
  "topic:cargo-subcommand", "topic:go-tool",
  "topic:npm-package cli in:description",

  // 更多语言搜索
  "cli in:name language:dart",
  "cli in:name language:zig",
  "cli in:name language:elixir",
  "cli in:name language:haskell",
  "cli in:name language:lua",
  "cli in:name language:nim",
  "cli in:name language:crystal",
  "cli in:name language:ocaml",
  "cli in:name language:perl",
  "cli in:name language:scala",
  "cli in:name language:powershell",

  // 高星通用搜索
  "awesome cli in:name stars:>100",
  "terminal utility in:name,description stars:>50",
  "command line tool in:name stars:>50",
];

async function run() {
  await client.connect();
  const catRes = await client.query("SELECT id, slug FROM categories");
  const catMap = Object.fromEntries(catRes.rows.map(r => [r.slug, r.id]));

  const existR = await client.query("SELECT full_name FROM cli_tools");
  const seen = new Set(existR.rows.map(r => r.full_name));
  console.log(`📦 Existing: ${seen.size}`);
  console.log(`🔍 Queries: ${QUERIES.length}\n`);

  let inserted = 0;

  for (let qi = 0; qi < QUERIES.length; qi++) {
    const q = QUERIES[qi];
    process.stdout.write(`[${qi+1}/${QUERIES.length}] ${q}`);
    let n = 0;

    for (let page = 1; page <= 5; page++) {
      try {
        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q + " stars:>=2")}&sort=stars&order=desc&page=${page}&per_page=100`;
        const data = await githubFetch(url);
        if (!data.items?.length) break;

        for (const repo of data.items) {
          if (seen.has(repo.full_name)) continue;
          seen.add(repo.full_name);

          const cats = detectCats(repo);
          const install = guessInstall(repo);

          try {
            const r = await client.query(
              `INSERT INTO cli_tools (name,full_name,description,stars,language,topics,homepage,html_url,
                last_pushed_at,repo_created_at,owner_avatar,owner_name,license,forks,open_issues,
                detection_signals,install_command,updated_at)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,NOW())
               ON CONFLICT (full_name) DO UPDATE SET stars=$4,last_pushed_at=$9,updated_at=NOW()
               RETURNING id`,
              [repo.name, repo.full_name, repo.description, repo.stargazers_count,
               repo.language, repo.topics||[], repo.homepage, repo.html_url,
               repo.pushed_at, repo.created_at, repo.owner.avatar_url, repo.owner.login,
               repo.license?.spdx_id??null, repo.forks_count, repo.open_issues_count, [], install]
            );
            const tid = r.rows[0].id;
            await client.query("DELETE FROM cli_tool_categories WHERE tool_id=$1", [tid]);
            for (const s of cats) {
              if (catMap[s]) await client.query("INSERT INTO cli_tool_categories (tool_id,category_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [tid, catMap[s]]);
            }
            n++; inserted++;
          } catch(e) {}
        }
        // 3 个 token 轮换，间隔可以更短
        await sleep(800);
      } catch(e) {
        if (e.message === "422") break;
        console.log(` err:${e.message}`);
      }
    }
    console.log(` → +${n}`);
  }

  await client.query("UPDATE categories SET tool_count = (SELECT COUNT(*) FROM cli_tool_categories WHERE category_id = categories.id)");

  const finalR = await client.query("SELECT count(*) as c FROM cli_tools");
  console.log(`\n${"=".repeat(40)}`);
  console.log(`✅ Done! +${inserted} new, Total: ${finalR.rows[0].c}`);
  console.log(`   API requests: ${requestCount}`);

  const catR = await client.query("SELECT name, tool_count FROM categories ORDER BY tool_count DESC");
  catR.rows.forEach(r => console.log(`  ${r.tool_count.toString().padStart(5)} ${r.name}`));
  await client.end();
}

run().catch(e => { console.error("Fatal:", e); process.exit(1); });
