"use client";

import { useState } from "react";

export default function SubmitForm() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // 验证 GitHub URL
    const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
    if (!match) {
      setStatus("error");
      setMessage("Please enter a valid GitHub repository URL");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(`✓ ${data.name} has been added! (${data.stars} ★)`);
        setUrl("");
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to submit");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="border-2 border-[#e5e5e5] bg-white focus-within:border-[#7c3aed] transition-colors mb-4">
          <div className="flex items-center">
            <span className="text-[#7c3aed] font-pixel px-3 py-3 text-sm select-none">
              $git clone
            </span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="flex-1 bg-transparent text-[#1a1a1a] font-pixel text-sm px-2 py-3 outline-none placeholder-[#ccc]"
              disabled={status === "loading"}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={status === "loading" || !url}
          className="w-full font-pixel text-sm text-white bg-[#7c3aed] px-4 py-3 hover:bg-[#6d28d9] transition-colors disabled:bg-[#e5e5e5] disabled:text-[#999]"
        >
          {status === "loading" ? "$ fetching..." : "$ submit"}
        </button>
      </form>

      {/* Status message */}
      {message && (
        <div
          className={`border-2 p-4 font-pixel text-xs ${
            status === "success"
              ? "border-[#7c3aed] bg-[#f5f0ff] text-[#7c3aed]"
              : "border-red-200 bg-red-50 text-red-600"
          }`}
        >
          {message}
        </div>
      )}

      {/* Info */}
      <div className="mt-8 border-2 border-[#e5e5e5] bg-[#fafafa] p-5">
        <h3 className="font-pixel text-sm text-[#7c3aed] mb-3">$ cat requirements.md</h3>
        <ul className="font-pixel text-xs text-[#666] space-y-2">
          <li>• Repository must be public on GitHub</li>
          <li>• Must have at least 2 stars</li>
          <li>• Should be a CLI tool or terminal application</li>
          <li>• Duplicates will be updated with latest info</li>
        </ul>
      </div>
    </div>
  );
}
