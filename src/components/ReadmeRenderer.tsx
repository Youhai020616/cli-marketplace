"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import type { Components } from "react-markdown";

interface Props {
  content: string;
  fullName: string; // owner/repo
}

/**
 * 处理 README 内容：
 * 1. 把相对路径图片/链接转成 GitHub 绝对路径
 * 2. 处理 GitHub alert 语法 [!NOTE] [!WARNING] 等
 */
function preprocessReadme(content: string, fullName: string): string {
  const rawBase = `https://raw.githubusercontent.com/${fullName}/HEAD/`;
  const repoBase = `https://github.com/${fullName}/blob/HEAD/`;

  let processed = content;

  // 1. 转换 Markdown 图片的相对路径: ![alt](./path) or ![alt](path)
  processed = processed.replace(
    /!\[([^\]]*)\]\((?!https?:\/\/|data:)([^)]+)\)/g,
    (_, alt, path) => {
      const cleanPath = path.replace(/^\.\//, "");
      return `![${alt}](${rawBase}${cleanPath})`;
    }
  );

  // 2. 转换 HTML img 的相对路径: <img src="./path">
  processed = processed.replace(
    /<img\s([^>]*?)src=["'](?!https?:\/\/|data:)([^"']+)["']/gi,
    (match, before, path) => {
      const cleanPath = path.replace(/^\.\//, "");
      return `<img ${before}src="${rawBase}${cleanPath}"`;
    }
  );

  // 3. 转换 Markdown 链接的相对路径（非锚点、非http）
  processed = processed.replace(
    /\[([^\]]+)\]\((?!https?:\/\/|#|mailto:)([^)]+)\)/g,
    (_, text, path) => {
      const cleanPath = path.replace(/^\.\//, "");
      return `[${text}](${repoBase}${cleanPath})`;
    }
  );

  // 4. GitHub Alert 语法: > [!NOTE], > [!WARNING], > [!IMPORTANT], > [!TIP], > [!CAUTION]
  processed = processed.replace(
    /^> \[!(NOTE|WARNING|IMPORTANT|TIP|CAUTION)\]\s*\n((?:> .*\n?)*)/gm,
    (_, type, body) => {
      const cleanBody = body.replace(/^> ?/gm, "").trim();
      const icons: Record<string, string> = {
        NOTE: "ℹ️",
        TIP: "💡",
        IMPORTANT: "❗",
        WARNING: "⚠️",
        CAUTION: "🔴",
      };
      const colors: Record<string, string> = {
        NOTE: "#7c3aed",
        TIP: "#22c55e",
        IMPORTANT: "#7c3aed",
        WARNING: "#eab308",
        CAUTION: "#ef4444",
      };
      const icon = icons[type] || "ℹ️";
      const color = colors[type] || "#7c3aed";
      return `<div style="border-left:4px solid ${color};padding:12px 16px;margin:16px 0;background:#fafafa"><strong>${icon} ${type}</strong><br/>${cleanBody}</div>\n`;
    }
  );

  return processed;
}

export default function ReadmeRenderer({ content, fullName }: Props) {
  const processed = preprocessReadme(content, fullName);

  const components: Components = {
    // 图片渲染：加载失败时隐藏
    img: ({ src, alt, ...props }) => {
      if (!src) return null;
      return (
        <img
          src={src}
          alt={alt || ""}
          loading="lazy"
          style={{ maxWidth: "100%" }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
          {...props}
        />
      );
    },
    // 表格样式
    table: ({ children, ...props }) => (
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }} {...props}>
          {children}
        </table>
      </div>
    ),
    th: ({ children, ...props }) => (
      <th style={{ border: "2px solid #e5e5e5", padding: "6px 12px", textAlign: "left", background: "#fafafa" }} {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td style={{ border: "1px solid #e5e5e5", padding: "6px 12px" }} {...props}>
        {children}
      </td>
    ),
    // 外部链接加 target="_blank"
    a: ({ href, children, ...props }) => (
      <a
        href={href}
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
        {...props}
      >
        {children}
      </a>
    ),
  };

  return (
    <div className="prose prose-sm max-w-none
      prose-headings:text-[#7c3aed] prose-headings:border-b prose-headings:border-[#eee] prose-headings:pb-2
      prose-h1:text-lg prose-h2:text-base prose-h3:text-sm
      prose-a:text-[#7c3aed] prose-a:no-underline hover:prose-a:underline
      prose-code:text-[#6d28d9] prose-code:bg-[#f5f0ff] prose-code:px-1 prose-code:rounded prose-code:text-xs
      prose-pre:bg-[#fafafa] prose-pre:border-2 prose-pre:border-[#e5e5e5] prose-pre:text-xs
      prose-strong:text-[#1a1a1a]
      prose-li:text-[#555]
      prose-p:text-[#555]
      prose-blockquote:border-l-[#7c3aed] prose-blockquote:bg-[#fafafa] prose-blockquote:py-1 prose-blockquote:px-4
      prose-img:rounded prose-img:border prose-img:border-[#e5e5e5]
      prose-table:text-xs
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
