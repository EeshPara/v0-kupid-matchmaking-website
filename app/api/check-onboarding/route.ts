export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET() {
  try {
    console.log("[v0] Starting onboarding check...")

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
          set: (name, value, options) => cookieStore.set({ name, value, ...options }),
          remove: (name, options) => cookieStore.set({ name, value: "", ...options }),
        },
      },
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] No authenticated user found")
      return NextResponse.json({ onboardingComplete: false })
    }

    console.log("[v0] Checking onboarding for user:", user.id)

    // TODO: Add n8n webhook call here
    // Webhook URL: https://graysonlee.app.n8n.cloud/webhook/getuser
    // Should check if user exists in database and has completed onboarding

    return NextResponse.json({ onboardingComplete: false })
  } catch (error) {
    console.error("[v0] Error checking onboarding:", error)
    return NextResponse.json({ onboardingComplete: false })
  }
}
