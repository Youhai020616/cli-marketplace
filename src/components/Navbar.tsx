import Link from "next/link";
import AuthButton from "./AuthButton";

export default function Navbar() {
  return (
    <nav className="border-b-2 border-[#e5e5e5] bg-white">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-[#7c3aed] font-pixel text-sm">ready</span>
          <span className="text-[#ccc] font-pixel text-sm">~/</span>
          <span className="text-[#1a1a1a] font-pixel text-sm font-bold group-hover:text-[#7c3aed] transition-colors">
            cli-mp
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-4 font-pixel text-xs">
          <Link
            href="/categories"
            className="text-[#888] hover:text-[#7c3aed] transition-colors"
          >
            $cd /categories
          </Link>
          <Link
            href="/timeline"
            className="text-[#888] hover:text-[#7c3aed] transition-colors"
          >
            $watch stats
          </Link>
          <Link
            href="/docs/api"
            className="text-[#888] hover:text-[#7c3aed] transition-colors"
          >
            $api --docs
          </Link>
          <Link
            href="/submit"
            className="text-white bg-[#7c3aed] px-3 py-1 hover:bg-[#6d28d9] transition-colors"
          >
            +submit
          </Link>
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}
