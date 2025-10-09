import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  console.log("[v0] Auth callback route hit")

  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  console.log("[v0] Auth callback - received code:", code ? "yes" : "no")

  if (code) {
    try {
      const cookieStore = await cookies()

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
      )

      console.log("[v0] Exchanging code for session...")
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("[v0] Error exchanging code:", error.message)
        return NextResponse.redirect(`${origin}/?error=auth_failed`)
      }

      console.log("[v0] Session created successfully for user:", data.user?.email)
      console.log("[v0] User ID:", data.user?.id)

      console.log("[v0] Redirecting to onboarding page...")
      return NextResponse.redirect(`${origin}/onboarding`)
    } catch (err) {
      console.error("[v0] Auth callback error:", err)
      return NextResponse.redirect(`${origin}/?error=callback_error`)
    }
  }

  console.log("[v0] No code provided, redirecting to home page")
  return NextResponse.redirect(`${origin}/`)
}
