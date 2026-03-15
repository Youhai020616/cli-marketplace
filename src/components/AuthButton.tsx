"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  if (user) {
    return (
      <div className="flex items-center gap-2">
        {user.user_metadata?.avatar_url && (
          <img
            src={user.user_metadata.avatar_url}
            alt=""
            className="w-5 h-5"
            style={{ imageRendering: "pixelated" }}
          />
        )}
        <button
          onClick={() => supabase.auth.signOut().then(() => setUser(null))}
          className="font-pixel text-xs text-[#888] hover:text-[#7c3aed] transition-colors"
        >
          $logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() =>
        supabase.auth.signInWithOAuth({
          provider: "github",
          options: { redirectTo: window.location.origin },
        })
      }
      className="font-pixel text-xs text-[#7c3aed] hover:text-[#6d28d9] transition-colors"
    >
      $Sign In
    </button>
  );
}
