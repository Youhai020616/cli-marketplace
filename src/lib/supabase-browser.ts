"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // 构建时静态预渲染会走到这里，返回一个空壳
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithOAuth: async () => ({ data: null, error: null }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ eq: () => ({ single: async () => ({ data: null }) }) }) }),
        insert: async () => ({ error: null }),
        delete: () => ({ eq: () => ({ eq: async () => ({ error: null }) }) }),
      }),
    } as ReturnType<typeof createBrowserClient>;
  }

  return createBrowserClient(url, key);
}
