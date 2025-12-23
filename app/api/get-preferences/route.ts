import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("[v0] API Route: get-preferences called")

  try {
    const body = await request.json()
    console.log("[v0] API Route: Received payload:", JSON.stringify(body, null, 2))

    if (!body.user_uid) {
      console.error("[v0] API Route: Missing user_uid in get-preferences request")
      return NextResponse.json({ error: "user_uid is required" }, { status: 400 })
    }

    // Get the Authorization header from the request
    const authHeader = request.headers.get("Authorization")

    if (!authHeader) {
      console.error("[v0] API Route: Missing Authorization header")
      return NextResponse.json({ error: "Unauthorized - Missing token" }, { status: 401 })
    }

    console.log("[v0] API Route: Fetching preferences for:", body.user_uid)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!supabaseUrl) {
      throw new Error("Missing Supabase configuration")
    }

    console.log("[v0] API Route: Forwarding request with user's JWT token")

    // Call Supabase edge function with the user's JWT token
    const response = await fetch(`${supabaseUrl}/functions/v1/get-preferences`, {
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
      console.error("[v0] API Route: Edge function error:", errorText)
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const data = await response.json()
    console.log("[v0] API Route: Edge function response:", JSON.stringify(data, null, 2))

    // The edge function returns { data: { success: false } } when preferences not found
    // or { data: { ...preferencesData, success: true } } when found
    const preferencesData = data.data || data

    if (preferencesData.success === false) {
      console.log("[v0] API Route: Preferences not found in database")
      return NextResponse.json({ success: false, message: "Preferences not found" }, { status: 404 })
    }

    // Return preferences data
    console.log("[v0] API Route: Preferences data received successfully")
    return NextResponse.json(preferencesData)
  } catch (error) {
    console.error("[v0] API Route: Error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
