import type { Metadata } from "next";
import Link from "next/link";
import SubmitForm from "@/components/SubmitForm";

export const metadata: Metadata = {
  title: "Submit a CLI Tool",
  description: "Submit a GitHub repository to CLI Marketplace. We'll automatically fetch its details and add it to our collection.",
  alternates: { canonical: "https://cli-marketplace.vercel.app/submit" },
};

export default function SubmitPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="font-pixel text-xs text-[#999] mb-6">
        <Link href="/" className="text-[#7c3aed] hover:underline">~</Link>
        <span className="mx-1">/</span>
        <span className="text-[#1a1a1a]">submit</span>
      </div>

      <h1 className="font-pixel text-xl text-[#7c3aed] mb-2">
        &gt; Submit a CLI Tool
      </h1>
      <p className="font-pixel text-xs text-[#888] mb-8">
        // Submit a GitHub repository URL and we&apos;ll fetch its details automatically
      </p>

      <SubmitForm />
    </div>
  );
}
