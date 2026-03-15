import Link from "next/link";

export default function ApiDocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="font-pixel text-xs text-[#999] mb-6">
        <Link href="/" className="text-[#7c3aed] hover:underline">~</Link>
        <span className="mx-1">/</span>
        <span className="text-[#1a1a1a]">docs/api</span>
      </div>

      <h1 className="font-pixel text-xl text-[#7c3aed] mb-2">
        &gt; API Documentation
      </h1>
      <p className="font-pixel text-xs text-[#888] mb-8">
        // Public REST API for querying CLI tools
      </p>

      {/* Base URL */}
      <div className="border-2 border-[#e5e5e5] bg-white p-5 mb-6">
        <h2 className="font-pixel text-sm text-[#7c3aed] mb-2">$ echo $BASE_URL</h2>
        <code className="font-pixel text-xs bg-[#f5f0ff] text-[#6d28d9] px-2 py-1 border border-[#e5e5e5]">
          GET /api/tools
        </code>
      </div>

      {/* Parameters */}
      <div className="border-2 border-[#e5e5e5] bg-white p-5 mb-6">
        <h2 className="font-pixel text-sm text-[#7c3aed] mb-4">$ man parameters</h2>
        <div className="overflow-x-auto">
          <table className="w-full font-pixel text-xs">
            <thead>
              <tr className="border-b-2 border-[#e5e5e5]">
                <th className="text-left py-2 pr-4 text-[#7c3aed]">Param</th>
                <th className="text-left py-2 pr-4 text-[#7c3aed]">Type</th>
                <th className="text-left py-2 pr-4 text-[#7c3aed]">Default</th>
                <th className="text-left py-2 text-[#7c3aed]">Description</th>
              </tr>
            </thead>
            <tbody className="text-[#555]">
              <tr className="border-b border-[#f0f0f0]">
                <td className="py-2 pr-4 text-[#1a1a1a]">q</td>
                <td className="py-2 pr-4 text-[#999]">string</td>
                <td className="py-2 pr-4 text-[#ccc]">—</td>
                <td className="py-2">Search by name, description, or repo</td>
              </tr>
              <tr className="border-b border-[#f0f0f0]">
                <td className="py-2 pr-4 text-[#1a1a1a]">sort</td>
                <td className="py-2 pr-4 text-[#999]">string</td>
                <td className="py-2 pr-4 text-[#ccc]">stars</td>
                <td className="py-2">&quot;stars&quot; or &quot;recent&quot;</td>
              </tr>
              <tr className="border-b border-[#f0f0f0]">
                <td className="py-2 pr-4 text-[#1a1a1a]">category</td>
                <td className="py-2 pr-4 text-[#999]">string</td>
                <td className="py-2 pr-4 text-[#ccc]">—</td>
                <td className="py-2">Filter by category slug</td>
              </tr>
              <tr className="border-b border-[#f0f0f0]">
                <td className="py-2 pr-4 text-[#1a1a1a]">page</td>
                <td className="py-2 pr-4 text-[#999]">number</td>
                <td className="py-2 pr-4 text-[#ccc]">1</td>
                <td className="py-2">Page number</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-[#1a1a1a]">limit</td>
                <td className="py-2 pr-4 text-[#999]">number</td>
                <td className="py-2 pr-4 text-[#ccc]">24</td>
                <td className="py-2">Results per page (max 100)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Examples */}
      <div className="border-2 border-[#e5e5e5] bg-white p-5 mb-6">
        <h2 className="font-pixel text-sm text-[#7c3aed] mb-4">$ cat examples.sh</h2>
        <div className="space-y-4 font-pixel text-xs">
          <div>
            <div className="text-[#999] mb-1"># List top tools by stars</div>
            <code className="text-[#6d28d9] bg-[#f5f0ff] px-2 py-1 border border-[#e5e5e5] block">
              curl /api/tools?sort=stars&amp;limit=10
            </code>
          </div>
          <div>
            <div className="text-[#999] mb-1"># Search for &quot;git&quot; tools</div>
            <code className="text-[#6d28d9] bg-[#f5f0ff] px-2 py-1 border border-[#e5e5e5] block">
              curl /api/tools?q=git&amp;sort=stars
            </code>
          </div>
          <div>
            <div className="text-[#999] mb-1"># Filter by category</div>
            <code className="text-[#6d28d9] bg-[#f5f0ff] px-2 py-1 border border-[#e5e5e5] block">
              curl /api/tools?category=ai-agent
            </code>
          </div>
        </div>
      </div>

      {/* Response */}
      <div className="border-2 border-[#e5e5e5] bg-white p-5">
        <h2 className="font-pixel text-sm text-[#7c3aed] mb-4">$ cat response.json</h2>
        <pre className="font-pixel text-xs text-[#555] bg-[#fafafa] border-2 border-[#e5e5e5] p-4 overflow-x-auto">
{`{
  "tools": [
    {
      "id": "uuid",
      "name": "fzf",
      "full_name": "junegunn/fzf",
      "description": "A command-line fuzzy finder",
      "stars": 78628,
      "language": "Go",
      "topics": ["cli", "terminal", "fuzzy-finder"],
      "html_url": "https://github.com/junegunn/fzf",
      "install_command": "go install github.com/junegunn/fzf@latest",
      "last_pushed_at": "2026-03-15T02:31:52Z",
      "owner_name": "junegunn",
      "owner_avatar": "https://avatars.githubusercontent.com/..."
    }
  ],
  "total": 312,
  "page": 1,
  "limit": 24
}`}
        </pre>
      </div>

      {/* Back */}
      <div className="mt-6 font-pixel text-xs">
        <Link href="/" className="text-[#7c3aed] hover:underline">← cd ~</Link>
      </div>
    </div>
  );
}
