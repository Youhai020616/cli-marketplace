"use client";

import Link from "next/link";

interface PixelCardProps {
  id: string;
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  language: string | null;
  ownerAvatar: string | null;
  ownerName: string;
  lastPushedAt: string;
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Ruby: "#701516",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Shell: "#89e051",
  Zig: "#ec915c",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Dart: "#00B4AB",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export default function PixelCard({
  id,
  name,
  fullName,
  description,
  stars,
  language,
  ownerAvatar,
  ownerName,
  lastPushedAt,
}: PixelCardProps) {
  return (
    <Link href={`/cli/${id}`}>
      <div className="group border-2 border-[#e5e5e5] bg-white hover:border-[#7c3aed] hover:shadow-[4px_4px_0px_#7c3aed22] transition-all p-4 cursor-pointer">
        {/* 顶部：头像 + 仓库名 */}
        <div className="flex items-center gap-2 mb-2">
          {ownerAvatar && (
            <img
              src={ownerAvatar}
              alt={ownerName}
              className="w-5 h-5 pixelated"
              style={{ imageRendering: "pixelated" }}
            />
          )}
          <span className="text-[#999] text-xs font-pixel truncate">
            {ownerName}/
          </span>
        </div>

        {/* 名称 */}
        <h3 className="text-[#1a1a1a] font-pixel text-sm font-bold mb-1 group-hover:text-[#7c3aed] truncate transition-colors">
          {name}
        </h3>

        {/* 描述 */}
        <p className="text-[#666] text-xs font-pixel mb-3 line-clamp-2 min-h-[2rem]">
          {description || "No description"}
        </p>

        {/* 底部信息 */}
        <div className="flex items-center gap-3 text-xs font-pixel">
          {/* 星数 */}
          <span className="text-[#eab308]">★ {formatStars(stars)}</span>

          {/* 语言 */}
          {language && (
            <span className="flex items-center gap-1">
              <span
                className="w-2 h-2 inline-block"
                style={{ backgroundColor: LANG_COLORS[language] || "#999" }}
              />
              <span className="text-[#666]">{language}</span>
            </span>
          )}

          {/* 更新时间 */}
          <span className="text-[#bbb] ml-auto">{timeAgo(lastPushedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
