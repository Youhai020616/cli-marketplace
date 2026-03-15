/**
 * 智能重分类脚本
 * 
 * 策略：
 * 1. 扩展关键词映射（topics + description + name）
 * 2. 对只属于 Other 的工具重新判断
 * 3. 能归类的移走，不能归类的保留 Other
 */
import pg from "pg";

const client = new pg.Client({
  host: "db.ucdazttpaqiwsmsskigs.supabase.co", port: 5432,
  database: "postgres", user: "postgres",
  password: process.env.SUPABASE_DB_PASSWORD || "2653063588Xyh!@#",
  ssl: { rejectUnauthorized: false },
});

// 扩展版分类规则：关键词 → 分类 slug
const KEYWORD_RULES = {
  "ai-agent": [
    "ai", "ai-agent", "ai-cli", "ai-assistant", "llm", "llm-cli",
    "chatgpt", "chatgpt-cli", "copilot", "openai", "anthropic", "claude",
    "gemini", "ollama", "gpt", "machine-learning", "deep-learning",
    "coding-agent", "ai-coding", "neural", "transformer", "langchain",
    "huggingface", "diffusion", "stable-diffusion", "computer-vision",
    "nlp", "natural-language", "text-generation",
  ],
  "devops": [
    "docker", "dockerfile", "docker-cli", "docker-compose",
    "kubernetes", "k8s", "kubectl", "helm", "kustomize",
    "cicd", "ci-cd", "ci", "cd", "pipeline", "github-actions",
    "terraform", "ansible", "puppet", "chef", "vagrant",
    "devops", "devops-tools", "infrastructure", "infrastructure-as-code",
    "deployment", "deploy", "monitoring", "observability", "alerting",
    "cloud", "aws", "aws-cli", "gcp", "azure", "cloud-native",
    "container", "containerization", "orchestration",
    "serverless", "lambda", "cloudformation", "pulumi",
    "nginx", "traefik", "load-balancer", "service-mesh", "istio",
    "prometheus", "grafana", "datadog", "logging", "log",
  ],
  "development": [
    "linter", "lint", "eslint", "pylint", "clippy", "rubocop",
    "formatter", "code-formatter", "prettier", "rustfmt", "gofmt", "black",
    "compiler", "transpiler", "interpreter", "runtime",
    "bundler", "build-tool", "build-system", "cmake", "make", "bazel",
    "package-manager", "npm", "yarn", "pnpm", "pip", "cargo", "brew",
    "scaffolding", "generator", "boilerplate", "template", "starter",
    "testing", "test", "unit-test", "test-framework", "jest", "pytest",
    "benchmark", "profiler", "profiling", "perf", "performance",
    "code-quality", "static-analysis", "code-review",
    "developer-tools", "devtool", "dev-tools",
    "debugger", "debug", "debugging",
    "repl", "playground", "sandbox",
    "refactoring", "code-generation", "codegen",
    "version-manager", "nvm", "pyenv", "rbenv", "asdf",
    "task-runner", "makefile", "just", "taskfile",
    "cli-framework", "cli-library", "argument-parser", "argument-parsing",
    "command-line-parser", "subcommands", "cobra", "clap", "click",
    "commander", "yargs", "oclif", "inquirer", "prompts",
    "tui-framework", "bubbletea", "ratatui", "textual", "blessed", "ink",
    "crossterm", "termion", "ncurses", "curses",
    "ansi", "ansi-escape", "chalk", "color", "colors", "terminal-color",
    "progress-bar", "progressbar", "spinner", "loading",
    "rich", "charmbracelet", "lipgloss",
    "cookiecutter", "yeoman",
  ],
  "database": [
    "database", "database-cli", "db", "dbms",
    "sql", "sql-client", "sql-editor",
    "postgresql", "postgres", "pgcli", "psql",
    "mysql", "mariadb", "mycli",
    "sqlite", "sqlite3",
    "mongodb", "mongo", "mongosh",
    "redis", "redis-cli", "memcached",
    "elasticsearch", "opensearch",
    "migration", "database-migration", "schema-migration",
    "orm", "query-builder",
    "cassandra", "dynamodb", "couchdb", "neo4j",
    "clickhouse", "timescaledb", "influxdb",
  ],
  "network": [
    "http", "http-client", "https", "http2",
    "proxy", "reverse-proxy", "forward-proxy", "socks",
    "dns", "dns-tool", "dns-client", "dns-server",
    "api-client", "rest-client", "rest-api",
    "curl", "wget", "httpie",
    "grpc", "grpcurl", "protobuf",
    "websocket", "ws", "socket",
    "download", "downloader", "upload",
    "network", "network-tools", "networking",
    "tcp", "udp", "ip", "ipv6",
    "vpn", "wireguard", "openvpn", "tunnel", "ssh-tunnel",
    "bandwidth", "speed-test", "ping", "traceroute",
    "ftp", "sftp", "scp",
    "mqtt", "amqp", "rabbitmq", "kafka",
    "streaming", "stream", "livestream",
    "crawler", "scraper", "web-scraper", "spider",
  ],
  "security": [
    "security", "security-tools", "cybersecurity", "infosec",
    "encryption", "encrypt", "decrypt", "cipher", "aes", "rsa",
    "vulnerability", "vulnerability-scanner", "cve",
    "pentest", "penetration-testing", "pentesting",
    "audit", "security-audit",
    "scanner", "port-scanner", "nmap",
    "osint", "reconnaissance", "recon",
    "password", "password-manager", "password-generator",
    "hash", "hashing", "checksum", "sha256", "md5",
    "crypto", "cryptography",
    "firewall", "waf", "ids", "ips",
    "malware", "antivirus", "virus",
    "secrets", "secret-management", "vault",
    "tls", "ssl", "certificate",
    "2fa", "totp", "otp", "mfa",
    "bruteforce", "wordlist", "forensics",
  ],
  "system": [
    "file-manager", "file-browser", "file-explorer",
    "process", "process-manager", "process-monitor",
    "system-monitor", "system-info", "system-information", "sysinfo",
    "disk", "disk-usage", "disk-space", "storage",
    "shell", "shell-tool", "bash", "zsh", "fish",
    "filesystem", "file", "files", "directory",
    "backup", "sync", "rsync", "rclone",
    "dotfiles", "dotfile-manager",
    "cleanup", "cleaner", "cache-cleaner",
    "clipboard", "copy-paste",
    "coreutils", "gnu-coreutils", "busybox",
    "find", "search", "grep", "ripgrep", "fuzzy", "fuzzy-finder", "fzf",
    "ls", "cat", "bat", "tree", "dir",
    "top", "htop", "btop", "glances",
    "archiver", "archive", "zip", "tar", "compress", "compression",
    "rename", "bulk-rename",
    "symlink", "hardlink",
    "cron", "scheduler", "daemon",
    "trash", "recycle-bin",
    "terminal-emulator", "terminal-multiplexer", "tmux", "screen",
    "window-manager", "tiling", "wayland", "x11",
    "power-management", "battery",
    "cross-platform",
    "autojump", "zoxide", "cd", "navigation",
    "recording", "screenshot", "screencast", "asciinema", "gif",
    "media", "audio", "video", "player", "mpv", "ffmpeg", "vlc",
    "image", "image-processing", "imagemagick", "image-conversion",
    "pdf", "epub", "ebook",
  ],
  "git": [
    "git", "git-tool", "git-extension", "git-plugin",
    "github", "github-cli", "gh", "github-api",
    "gitlab", "gitlab-cli", "bitbucket",
    "version-control", "vcs",
    "git-hooks", "pre-commit", "husky",
    "gitops", "gitflow",
    "changelog", "release", "semantic-release", "conventional-commits",
    "commit", "commit-message",
    "merge", "rebase", "cherry-pick",
    "diff", "patch", "blame",
    "monorepo", "mono-repo", "lerna", "nx",
    "submodule", "subtree",
    "lazygit", "tig", "gitui",
  ],
  "frontend": [
    "css", "css-framework", "sass", "less", "postcss",
    "react", "reactjs", "preact",
    "vue", "vuejs", "nuxt",
    "svelte", "sveltekit",
    "angular", "angular-cli",
    "ssg", "static-site-generator", "static-site",
    "webpack", "rollup", "esbuild", "parcel", "snowpack",
    "vite", "vitejs",
    "tailwind", "tailwindcss", "bootstrap",
    "nextjs", "next-js", "gatsby", "remix",
    "html", "html5",
    "svg", "svgo", "icon",
    "responsive", "pwa",
    "storybook", "component",
    "browser", "chrome", "firefox", "webextension",
    "electron", "tauri", "desktop-app",
  ],
  "data": [
    "json", "json-tool", "jq", "json-parser",
    "csv", "csv-tool", "csv-parser", "tsv",
    "yaml", "yml", "yaml-tool",
    "toml", "toml-tool",
    "xml", "xml-parser", "xpath",
    "markdown", "md", "markdown-tool",
    "converter", "convert", "transform", "transformation",
    "parsing", "parser", "serialization",
    "data-processing", "data-pipeline", "etl",
    "regex", "regexp", "pattern",
    "text-processing", "text", "string",
    "encoding", "decode", "encode", "base64", "unicode", "utf8",
    "template", "templating", "mustache", "handlebars",
    "i18n", "l10n", "internationalization", "translation",
    "statistics", "stats", "analytics",
    "visualization", "chart", "graph", "plot",
    "geospatial", "geo", "map", "gis",
    "math", "calculator", "computation",
  ],
  "documentation": [
    "documentation", "docs", "doc",
    "readme", "readme-generator",
    "api-documentation", "api-docs", "swagger", "openapi",
    "doc-generator", "docgen", "documentation-generator",
    "man-page", "manpage", "help",
    "wiki", "knowledge-base",
    "blog", "cms", "static-blog",
    "book", "mdbook", "gitbook",
    "tutorial", "guide", "reference",
    "license", "license-generator",
    "comment", "jsdoc", "typedoc", "doxygen", "rustdoc",
  ],
};

// 把所有关键词打平成 word → [slugs] 的映射
const wordToSlugs = {};
for (const [slug, words] of Object.entries(KEYWORD_RULES)) {
  for (const word of words) {
    if (!wordToSlugs[word]) wordToSlugs[word] = [];
    if (!wordToSlugs[word].includes(slug)) wordToSlugs[word].push(slug);
  }
}

function classifyTool(tool) {
  const slugs = new Set();

  // 检查 topics
  for (const topic of (tool.topics || [])) {
    const matches = wordToSlugs[topic.toLowerCase()];
    if (matches) matches.forEach(s => slugs.add(s));
  }

  // 检查 description 中的关键词
  const descWords = (tool.description || "").toLowerCase().split(/[\s,./\-_:;()[\]{}|&!?'"]+/).filter(Boolean);
  for (const word of descWords) {
    const matches = wordToSlugs[word];
    if (matches) matches.forEach(s => slugs.add(s));
  }

  // 检查 name
  const nameWords = tool.name.toLowerCase().split(/[\-_]+/);
  for (const word of nameWords) {
    const matches = wordToSlugs[word];
    if (matches) matches.forEach(s => slugs.add(s));
  }

  if (slugs.size === 0) slugs.add("other");
  return [...slugs];
}

async function run() {
  await client.connect();
  console.log("✅ Connected\n");

  // 加载分类
  const catRes = await client.query("SELECT id, slug, name FROM categories");
  const catMap = Object.fromEntries(catRes.rows.map(r => [r.slug, r.id]));
  const catNames = Object.fromEntries(catRes.rows.map(r => [r.slug, r.name]));

  // 获取所有工具
  const toolsRes = await client.query("SELECT id, name, description, topics, language FROM cli_tools");
  console.log(`📦 Total tools: ${toolsRes.rows.length}`);

  let reclassified = 0;
  let movedFromOther = 0;
  const movementStats = {};

  for (const tool of toolsRes.rows) {
    const newSlugs = classifyTool(tool);

    // 获取当前分类
    const currentRes = await client.query(
      "SELECT c.slug FROM cli_tool_categories tc JOIN categories c ON c.id = tc.category_id WHERE tc.tool_id = $1",
      [tool.id]
    );
    const currentSlugs = currentRes.rows.map(r => r.slug);
    const wasOnlyOther = currentSlugs.length === 1 && currentSlugs[0] === "other";
    const newHasReal = newSlugs.some(s => s !== "other");

    // 只在有更好分类时才更新
    if (wasOnlyOther && newHasReal) {
      // 删旧关联
      await client.query("DELETE FROM cli_tool_categories WHERE tool_id = $1", [tool.id]);
      // 插新关联
      for (const slug of newSlugs) {
        if (catMap[slug]) {
          await client.query(
            "INSERT INTO cli_tool_categories (tool_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [tool.id, catMap[slug]]
          );
        }
      }
      movedFromOther++;
      for (const s of newSlugs.filter(s => s !== "other")) {
        movementStats[s] = (movementStats[s] || 0) + 1;
      }
    }

    // 如果当前没在 Other，但新分类能补充更多分类
    if (!wasOnlyOther && newHasReal) {
      const newOnes = newSlugs.filter(s => s !== "other" && !currentSlugs.includes(s));
      if (newOnes.length > 0) {
        for (const slug of newOnes) {
          if (catMap[slug]) {
            await client.query(
              "INSERT INTO cli_tool_categories (tool_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
              [tool.id, catMap[slug]]
            );
          }
        }
        reclassified++;
      }
    }
  }

  // 更新计数
  await client.query("UPDATE categories SET tool_count = (SELECT COUNT(*) FROM cli_tool_categories WHERE category_id = categories.id)");

  // 结果
  const finalRes = await client.query("SELECT name, tool_count FROM categories ORDER BY tool_count DESC");

  console.log(`\n${"=".repeat(40)}`);
  console.log(`✅ Moved from Other: ${movedFromOther}`);
  console.log(`✅ Added categories: ${reclassified}`);
  console.log(`\nMovements from Other:`);
  Object.entries(movementStats).sort((a, b) => b[1] - a[1]).forEach(([slug, count]) => {
    console.log(`  +${count.toString().padStart(4)} → ${catNames[slug] || slug}`);
  });
  console.log(`\nFinal counts:`);
  finalRes.rows.forEach(r => console.log(`  ${r.tool_count.toString().padStart(5)} ${r.name}`));

  await client.end();
}

run().catch(e => { console.error("Fatal:", e); process.exit(1); });
