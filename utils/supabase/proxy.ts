import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // Always initialize a valid NextResponse
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const rawUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://buxephhlngnfgbpevpvw.supabase.co";

    const rawKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      "sb_publishable_e0IzN00reJrLbPyYvuXaQw_vK7wXL0Q";

    const supabaseUrl = rawUrl?.trim();
    const supabaseKey = rawKey?.trim();

    // Validate that Supabase URL is a valid HTTP/HTTPS URL and key is non-empty
    if (
      !supabaseUrl ||
      !supabaseKey ||
      (!supabaseUrl.startsWith("http://") && !supabaseUrl.startsWith("https://"))
    ) {
      return supabaseResponse;
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
              supabaseResponse.headers.set(key, value);
            });
          }
        },
      },
    });

    // Refresh auth session safely if method exists
    if (typeof supabase.auth.getUser === "function") {
      await supabase.auth.getUser();
    }
  } catch (error) {
    // Avoid unhandled exceptions from crashing the proxy routing layer on Vercel
    console.error("Supabase proxy session refresh error:", error);
  }

  return supabaseResponse;
};

// Aliased export for compatibility
export const createClient = updateSession;
