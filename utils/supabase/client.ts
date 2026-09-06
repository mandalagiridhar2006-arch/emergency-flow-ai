import { createBrowserClient } from "@supabase/ssr";

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

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );
