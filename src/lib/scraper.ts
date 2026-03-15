const GITHUB_API = "https://api.github.com";
const MIN_STARS = 2;

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  homepage: string | null;
  html_url: string;
  pushed_at: string;
  created_at: string;
  owner: { avatar_url: string; login: string };
  license: { spdx_id: string } | null;
  forks_count: number;
  open_issues_count: number;
}

// CLI 识别关键词（GitHub Topics）
const CLI_TOPICS = [
  "cli",
  "command-line",
  "command-line-tool",
  "terminal",
  "console",
  "cli-app",
  "cli-tool",
  "command-line-interface",
  "tui",
  "terminal-app",
];

// 分类映射：topic/关键词 → 分类 slug
const CATEGORY_MAP: Record<string, string> = {
  // AI Agent
  "ai-agent": "ai-agent",
  "ai-coding": "ai-agent",
  "coding-agent": "ai-agent",
  "llm": "ai-agent",
  "chatgpt": "ai-agent",
  "copilot": "ai-agent",
  "ai-assistant": "ai-agent",
  "openai": "ai-agent",
  "anthropic": "ai-agent",
  // DevOps
  "docker": "devops",
  "kubernetes": "devops",
  "cicd": "devops",
  "ci-cd": "devops",
  "deployment": "devops",
  "monitoring": "devops",
  "cloud": "devops",
  "aws": "devops",
  "terraform": "devops",
  // Development
  "build-tool": "development",
  "scaffolding": "development",
  "linter": "development",
  "formatter": "development",
  "compiler": "development",
  "bundler": "development",
  "package-manager": "development",
  // Database
  "database": "database",
  "sql": "database",
  "postgresql": "database",
  "mysql": "database",
  "mongodb": "database",
  "redis": "database",
  // Network
  "http": "network",
  "http-client": "network",
  "proxy": "network",
  "dns": "network",
  "api-client": "network",
  "curl": "network",
  // Security
  "security": "security",
  "encryption": "security",
  "vulnerability": "security",
  "pentesting": "security",
  "audit": "security",
  // System
  "file-manager": "system",
  "process": "system",
  "system-monitor": "system",
  "disk": "system",
  "shell": "system",
  // Git
  "git": "git",
  "github": "git",
  "git-tool": "git",
  "version-control": "git",
  // Frontend
  "css": "frontend",
  "react": "frontend",
  "vue": "frontend",
  "svelte": "frontend",
  "ssg": "frontend",
  // Data
  "json": "data",
  "csv": "data",
  "yaml": "data",
  "data-processing": "data",
  // Documentation
  "documentation": "documentation",
  "markdown": "documentation",
  "docs": "documentation",
};

function headers() {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

// 根据 topics 和描述推断分类
function detectCategories(repo: GitHubRepo): string[] {
  const slugs = new Set<string>();
  const allText = [
    ...repo.topics,
    ...(repo.description?.toLowerCase().split(/\s+/) ?? []),
  ];

  for (const word of allText) {
    const slug = CATEGORY_MAP[word.toLowerCase()];
    if (slug) slugs.add(slug);
  }

  if (slugs.size === 0) slugs.add("other");
  return Array.from(slugs);
}

// 检测 CLI 识别信号
function detectSignals(repo: GitHubRepo): string[] {
  const signals: string[] = [];
  for (const topic of repo.topics) {
    if (CLI_TOPICS.includes(topic)) {
      signals.push(`topic:${topic}`);
    }
  }
  const desc = repo.description?.toLowerCase() ?? "";
  if (desc.includes("cli") || desc.includes("command-line") || desc.includes("terminal")) {
    signals.push("description:cli-keyword");
  }
  return signals;
}

// 猜测安装命令
function guessInstallCommand(repo: GitHubRepo): string | null {
  const lang = repo.language?.toLowerCase();
  const name = repo.name;

  if (lang === "javascript" || lang === "typescript") return `npm install -g ${name}`;
  if (lang === "python") return `pip install ${name}`;
  if (lang === "rust") return `cargo install ${name}`;
  if (lang === "go") return `go install github.com/${repo.full_name}@latest`;
  if (lang === "ruby") return `gem install ${name}`;
  return null;
}

export interface ScrapedTool {
  name: string;
  full_name: string;
  description: string | null;
  stars: number;
  language: string | null;
  topics: string[];
  homepage: string | null;
  html_url: string;
  last_pushed_at: string;
  repo_created_at: string;
  owner_avatar: string;
  owner_name: string;
  license: string | null;
  forks: number;
  open_issues: number;
  detection_signals: string[];
  install_command: string | null;
  category_slugs: string[];
}

export async function searchCLITools(
  query: string,
  page = 1,
  perPage = 30
): Promise<{ tools: ScrapedTool[]; totalCount: number }> {
  const q = `${query} stars:>=${MIN_STARS}`;
  const url = `${GITHUB_API}/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&page=${page}&per_page=${perPage}`;

  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const repos: GitHubRepo[] = data.items;

  const tools: ScrapedTool[] = repos.map((repo) => ({
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    stars: repo.stargazers_count,
    language: repo.language,
    topics: repo.topics,
    homepage: repo.homepage,
    html_url: repo.html_url,
    last_pushed_at: repo.pushed_at,
    repo_created_at: repo.created_at,
    owner_avatar: repo.owner.avatar_url,
    owner_name: repo.owner.login,
    license: repo.license?.spdx_id ?? null,
    forks: repo.forks_count,
    open_issues: repo.open_issues_count,
    detection_signals: detectSignals(repo),
    install_command: guessInstallCommand(repo),
    category_slugs: detectCategories(repo),
  }));

  return { tools, totalCount: data.total_count };
}

// 抓取搜索 queries
export function getSearchQueries(): string[] {
  return [
    "topic:cli",
    "topic:command-line-tool",
    "topic:cli-tool",
    "topic:terminal",
    "topic:tui",
    "cli tool in:name,description",
    "command line in:name,description",
  ];
}
