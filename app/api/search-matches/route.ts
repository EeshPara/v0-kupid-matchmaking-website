import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("[v0] API Route: search-matches called")

  try {
    const body = await request.json()
    console.log("[v0] API Route: Received payload:", JSON.stringify(body, null, 2))

    if (!body.user_uid) {
      console.error("[v0] API Route: Missing user_uid in search request")
      return NextResponse.json({ error: "user_uid is required" }, { status: 400 })
    }

    console.log("[v0] API Route: Searching for matches for user:", body.user_uid)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase configuration")
    }

    // Call Supabase edge function
    const response = await fetch(`${supabaseUrl}/functions/v1/search-for-matches`, {
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
    console.log("[v0] API Route: Edge function success - found matches:", data.matches?.length || 0)

    // Log the first match to see what fields are available
    if (data.matches && data.matches.length > 0) {
      console.log("[v0] API Route: First match data:", JSON.stringify(data.matches[0], null, 2))
      console.log("[v0] API Route: First match keys:", Object.keys(data.matches[0]))
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] API Route: Error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
