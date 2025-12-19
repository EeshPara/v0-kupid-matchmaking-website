import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("[v0] API Route: get-user called")

  try {
    const body = await request.json()
    console.log("[v0] API Route: Received payload:", JSON.stringify(body, null, 2))

    if (!body.user_uid) {
      console.error("[v0] API Route: Missing user_uid in get-user request")
      return NextResponse.json({ error: "user_uid is required" }, { status: 400 })
    }

    console.log("[v0] API Route: Fetching user data for:", body.user_uid)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase configuration")
    }

    // Call Supabase edge function
    const response = await fetch(`${supabaseUrl}/functions/v1/get-user`, {
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
      console.error("[v0] API Route: Edge function error:", errorText)
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const data = await response.json()
    console.log("[v0] API Route: Edge function response:", JSON.stringify(data, null, 2))

    // The edge function returns { data: { success: false } } when user not found
    // or { data: { ...userData, success: true } } when found
    const userData = data.data || data

    if (userData.success === false) {
      console.log("[v0] API Route: User not found in database")
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Wrap in array for consistent response format
    console.log("[v0] API Route: User data received successfully")
    return NextResponse.json([userData])
  } catch (error) {
    console.error("[v0] API Route: Error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
