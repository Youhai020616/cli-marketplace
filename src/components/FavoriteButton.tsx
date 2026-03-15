"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function FavoriteButton({ toolId }: { toolId: string }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: { id: string } | null } }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        supabase
          .from("user_favorites")
          .select("id")
          .eq("user_id", uid)
          .eq("tool_id", toolId)
          .single()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .then(({ data }: any) => {
            setIsFavorited(!!data);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });
  }, [toolId]);

  async function toggle() {
    if (!userId) {
      supabase.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: window.location.href },
      });
      return;
    }

    if (isFavorited) {
      await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", userId)
        .eq("tool_id", toolId);
      setIsFavorited(false);
    } else {
      await supabase
        .from("user_favorites")
        .insert({ user_id: userId, tool_id: toolId });
      setIsFavorited(true);
    }
  }

  if (loading) return null;

  return (
    <button
      onClick={toggle}
      className={`font-pixel text-sm transition-colors ${
        isFavorited
          ? "text-[#7c3aed] hover:text-[#6d28d9]"
          : "text-[#ccc] hover:text-[#7c3aed]"
      }`}
      title={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      {isFavorited ? "★" : "☆"}
    </button>
  );
}
