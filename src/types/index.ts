export interface CLITool {
  id: string;
  name: string;
  full_name: string; // owner/repo
  description: string | null;
  stars: number;
  language: string | null;
  topics: string[];
  homepage: string | null;
  html_url: string;
  readme_content: string | null;
  install_command: string | null;
  last_pushed_at: string;
  created_at: string;
  owner_avatar: string | null;
  owner_name: string;
  license: string | null;
  forks: number;
  open_issues: number;
  detection_signals: string[]; // how we identified it as CLI
  category_ids: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_slug: string | null;
  tool_count: number;
  icon: string | null;
}

export interface TimelineDataPoint {
  date: string;
  count: number;
  cumulative: number;
}

export interface CategoryDistribution {
  name: string;
  count: number;
  percentage: number;
}
