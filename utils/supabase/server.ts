import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const rawUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://buxephhlngnfgbpevpvw.supabase.co";
const rawKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_e0IzN00reJrLbPyYvuXaQw_vK7wXL0Q";

const supabaseUrl = rawUrl?.trim() || "";
const supabaseKey = rawKey?.trim() || "";

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};
