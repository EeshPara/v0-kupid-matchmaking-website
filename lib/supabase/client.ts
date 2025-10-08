import { createClient } from "@supabase/supabase-js"

export function createBrowserSupabaseClient() {
  console.log("[v0] Creating Supabase client...")

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("[v0] Supabase URL:", url ? "✓ Set" : "✗ Missing")
  console.log("[v0] Supabase Key:", key ? "✓ Set" : "✗ Missing")

  if (!url || !key) {
    console.error("[v0] Missing Supabase environment variables!")
    throw new Error("Missing Supabase configuration")
  }

  return createClient(url, key)
}
