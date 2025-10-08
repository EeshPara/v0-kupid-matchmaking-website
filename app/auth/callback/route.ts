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

      console.log("[v0] Checking if user exists in database via webhook...")
      try {
        const webhookResponse = await fetch("https://graysonlee.app.n8n.cloud/webhook/getuser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ user_uid: data.user?.id }),
        })

        if (!webhookResponse.ok) {
          console.log("[v0] Webhook call failed, user needs onboarding")
          return NextResponse.redirect(`${origin}/?onboarding=true`)
        }

        const userData = await webhookResponse.json()
        console.log("[v0] User data received:", JSON.stringify(userData).substring(0, 100))

        // Check if user exists and has completed onboarding
        const userExists = userData && !Array.isArray(userData) && Object.keys(userData).length > 0

        if (!userExists) {
          console.log("[v0] User does not exist in database, needs onboarding")
          return NextResponse.redirect(`${origin}/?onboarding=true`)
        }

        // Check if user has all required fields
        const requiredFields = ["display_name", "class_year", "gender", "age", "interests", "dream_date"]
        const hasAllFields = requiredFields.every((field) => {
          const hasField = !!userData[field]
          if (!hasField) {
            console.log(`[v0] Missing required field: ${field}`)
          }
          return hasField
        })

        if (!hasAllFields) {
          console.log("[v0] User exists but onboarding incomplete, needs to complete onboarding")
          return NextResponse.redirect(`${origin}/?onboarding=true`)
        }

        console.log("[v0] User found in database with complete profile, redirecting to matches")
        return NextResponse.redirect(`${origin}/matches`)
      } catch (webhookError) {
        console.error("[v0] Error calling webhook:", webhookError)
        console.log("[v0] Assuming user needs onboarding due to webhook error")
        return NextResponse.redirect(`${origin}/?onboarding=true`)
      }
    } catch (err) {
      console.error("[v0] Auth callback error:", err)
      return NextResponse.redirect(`${origin}/?error=callback_error`)
    }
  }

  console.log("[v0] No code provided, redirecting to home page")
  return NextResponse.redirect(`${origin}/`)
}
