import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("[v0] API Route: update-preferences called")

  try {
    const body = await request.json()
    console.log("[v0] API Route: Received payload:", JSON.stringify(body, null, 2))

    if (!body.user_uid) {
      console.error("[v0] API Route: CRITICAL ERROR - Missing user_uid in preferences update")
      return NextResponse.json({ error: "user_uid is required" }, { status: 400 })
    }

    console.log("[v0] API Route: Calling edge function to update preferences for user:", body.user_uid)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase configuration")
    }

    // Call Supabase edge function
    const response = await fetch(`${supabaseUrl}/functions/v1/update-preferences`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(body),
    })

    console.log("[v0] API Route: Edge function response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] API Route: CRITICAL - Edge function error:", errorText)
      console.error("[v0] API Route: Failed payload:", body)
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const data = await response.json()
    console.log("[v0] API Route: SUCCESS - Edge function response:", data)
    console.log("[v0] API Route: Preferences successfully updated for user:", body.user_uid)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] API Route: CRITICAL ERROR:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
