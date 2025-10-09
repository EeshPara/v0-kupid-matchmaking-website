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

    // Call n8n webhook to search for matches
    const response = await fetch("https://graysonlee.app.n8n.cloud/webhook/searchformatches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log("[v0] API Route: Webhook response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] API Route: Webhook error:", errorText)
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const data = await response.json()
    console.log("[v0] API Route: Webhook success - found matches:", data.matches?.length || 0)

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
