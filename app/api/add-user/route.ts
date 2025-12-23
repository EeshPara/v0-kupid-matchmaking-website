import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("[v0] API Route: add-user called")

  try {
    const body = await request.json()
    console.log("[v0] API Route: Received payload:", JSON.stringify(body, null, 2))

    // Get the Authorization header from the request
    const authHeader = request.headers.get("Authorization")

    if (!authHeader) {
      console.error("[v0] API Route: Missing Authorization header")
      return NextResponse.json({ error: "Unauthorized - Missing token" }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!supabaseUrl) {
      throw new Error("Missing Supabase configuration")
    }

    console.log("[v0] API Route: Forwarding request with user's JWT token")

    // Call Supabase edge function with the user's JWT token
    // Edge function will verify the JWT using its ANON_KEY
    const response = await fetch(`${supabaseUrl}/functions/v1/add-new-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader, // Forward the user's JWT token
      },
      body: JSON.stringify(body),
    })

    console.log("[v0] API Route: Edge function response status:", response.status)
    console.log("[v0] API Route: Response headers:", Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log("[v0] API Route: Raw response:", responseText)

    if (!response.ok) {
      console.error("[v0] API Route: Edge function error - Status:", response.status)
      console.error("[v0] API Route: Edge function error - Body:", responseText)
      return NextResponse.json({ error: responseText }, { status: response.status })
    }

    const data = JSON.parse(responseText)
    console.log("[v0] API Route: Edge function success:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] API Route: Error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
