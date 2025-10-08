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

    const response = await fetch("https://graysonlee.app.n8n.cloud/webhook/getuser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ user_uid: user.id }),
    })

    if (!response.ok) {
      console.log("[v0] Webhook call failed")
      return NextResponse.json({ onboardingComplete: false })
    }

    const userData = await response.json()
    console.log("[v0] User data received:", JSON.stringify(userData).substring(0, 100))

    const userExists = userData && !Array.isArray(userData) && Object.keys(userData).length > 0

    if (!userExists) {
      console.log("[v0] User does not exist in database")
      return NextResponse.json({ onboardingComplete: false })
    }

    const requiredFields = ["display_name", "class_year", "gender", "age", "interests", "dream_date"]

    const hasAllFields = requiredFields.every((field) => {
      const hasField = !!userData[field]
      if (!hasField) {
        console.log(`[v0] Missing required field: ${field}`)
      }
      return hasField
    })

    console.log("[v0] Onboarding complete:", hasAllFields)
    return NextResponse.json({ onboardingComplete: hasAllFields })
  } catch (error) {
    console.error("[v0] Error checking onboarding:", error)
    return NextResponse.json({ onboardingComplete: false })
  }
}
