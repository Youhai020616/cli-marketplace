import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t-2 border-[#e5e5e5] bg-[#fafafa] mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 font-pixel text-xs">
          {/* About */}
          <div>
            <h3 className="text-[#7c3aed] mb-3">$ cat README.md</h3>
            <p className="text-[#999] leading-relaxed">
              CLI Marketplace — Discover and explore CLI tools built by the
              community. Aggregated from GitHub.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-[#7c3aed] mb-3">$ ls ./links/</h3>
            <div className="flex flex-col gap-1">
              <Link href="/categories" className="text-[#888] hover:text-[#7c3aed] transition-colors">
                📁 Categories
              </Link>
              <Link href="/timeline" className="text-[#888] hover:text-[#7c3aed] transition-colors">
                📊 Timeline
              </Link>
              <a href="https://github.com" target="_blank" className="text-[#888] hover:text-[#7c3aed] transition-colors">
                🔗 GitHub
              </a>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-[#7c3aed] mb-3">$ ls ./resources/</h3>
            <div className="flex flex-col gap-1">
              <a href="https://agentskills.io" target="_blank" className="text-[#888] hover:text-[#7c3aed] transition-colors">
                📋 Agent Skills Spec
              </a>
              <Link href="/api/tools" className="text-[#888] hover:text-[#7c3aed] transition-colors">
                📄 API Docs
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-[#e5e5e5] text-center font-pixel text-xs text-[#ccc]">
          <span className="text-[#7c3aed]">online</span> v0.1.0 CLI Marketplace — © {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}
