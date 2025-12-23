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

    // Get the Authorization header from the request
    const authHeader = request.headers.get("Authorization")

    if (!authHeader) {
      console.error("[v0] API Route: Missing Authorization header")
      return NextResponse.json({ error: "Unauthorized - Missing token" }, { status: 401 })
    }

    console.log("[v0] API Route: Calling edge function to update preferences for user:", body.user_uid)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!supabaseUrl) {
      throw new Error("Missing Supabase configuration")
    }

    console.log("[v0] API Route: Forwarding request with user's JWT token")

    // Call Supabase edge function with the user's JWT token
    const response = await fetch(`${supabaseUrl}/functions/v1/update-preferences`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader, // Forward the user's JWT token
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
