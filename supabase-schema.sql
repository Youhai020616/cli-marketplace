-- ============================================
-- CLI Marketplace Database Schema
-- ============================================

-- 分类表
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_slug TEXT REFERENCES categories(slug),
  icon TEXT,
  tool_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLI 工具表
CREATE TABLE cli_tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT UNIQUE NOT NULL, -- owner/repo
  description TEXT,
  stars INTEGER DEFAULT 0,
  language TEXT,
  topics TEXT[] DEFAULT '{}',
  homepage TEXT,
  html_url TEXT NOT NULL,
  readme_content TEXT,
  install_command TEXT,
  last_pushed_at TIMESTAMPTZ,
  repo_created_at TIMESTAMPTZ,
  owner_avatar TEXT,
  owner_name TEXT NOT NULL,
  license TEXT,
  forks INTEGER DEFAULT 0,
  open_issues INTEGER DEFAULT 0,
  detection_signals TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 工具-分类关联表
CREATE TABLE cli_tool_categories (
  tool_id UUID REFERENCES cli_tools(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (tool_id, category_id)
);

-- 全文搜索索引
CREATE INDEX idx_cli_tools_search ON cli_tools
  USING GIN (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')));

CREATE INDEX idx_cli_tools_stars ON cli_tools(stars DESC);
CREATE INDEX idx_cli_tools_pushed ON cli_tools(last_pushed_at DESC);
CREATE INDEX idx_cli_tools_full_name ON cli_tools(full_name);

-- 更新 tool_count 的函数
CREATE OR REPLACE FUNCTION update_category_tool_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE categories SET tool_count = (
    SELECT COUNT(*) FROM cli_tool_categories WHERE category_id = COALESCE(NEW.category_id, OLD.category_id)
  ) WHERE id = COALESCE(NEW.category_id, OLD.category_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_category_count
AFTER INSERT OR DELETE ON cli_tool_categories
FOR EACH ROW EXECUTE FUNCTION update_category_tool_count();

-- ============================================
-- 种子分类数据
-- ============================================
INSERT INTO categories (name, slug, description, icon) VALUES
  ('AI Agent', 'ai-agent', 'AI coding agents and assistants', '🤖'),
  ('DevOps', 'devops', 'CI/CD, containers, monitoring, cloud', '🚀'),
  ('Development', 'development', 'Build tools, scaffolding, linting', '⚡'),
  ('Database', 'database', 'SQL clients, migration, backup', '🗄️'),
  ('Network', 'network', 'HTTP clients, proxy, DNS', '🌐'),
  ('Security', 'security', 'Scanning, encryption, audit', '🔒'),
  ('System', 'system', 'File, process, disk management', '💻'),
  ('Git', 'git', 'Git extensions and workflows', '📦'),
  ('Frontend', 'frontend', 'CSS, components, SSG', '🎨'),
  ('Data', 'data', 'JSON/CSV/YAML processing', '📊'),
  ('Documentation', 'documentation', 'Doc generation, Markdown', '📝'),
  ('Other', 'other', 'Games, fun, lifestyle', '✨');
