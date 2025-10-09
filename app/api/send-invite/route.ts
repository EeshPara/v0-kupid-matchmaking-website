import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("[v0] API Route: send-invite called")

  try {
    const body = await request.json()
    console.log("[v0] API Route: Received payload:", JSON.stringify(body, null, 2))

    if (!body.user_id_1 || !body.user_id_2) {
      console.error("[v0] API Route: Missing user_id_1 or user_id_2 in request")
      return NextResponse.json({ error: "user_id_1 and user_id_2 are required" }, { status: 400 })
    }

    console.log("[v0] API Route: Sending invite from user:", body.user_id_1, "to user:", body.user_id_2)

    // Call n8n webhook to send invite
    const response = await fetch("https://graysonlee.app.n8n.cloud/webhook/sendinvite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id_1: body.user_id_1,
        user_id_2: body.user_id_2,
      }),
    })

    console.log("[v0] API Route: Webhook response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] API Route: Webhook error:", errorText)
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const responseText = await response.text()
    console.log("[v0] API Route: Response text length:", responseText.length)
    console.log("[v0] API Route: Response text (first 500 chars):", responseText.substring(0, 500))

    let responseData
    if (responseText && responseText.trim() !== "") {
      try {
        responseData = JSON.parse(responseText)
        console.log("[v0] API Route: Parsed response data:", JSON.stringify(responseData, null, 2))
      } catch (e) {
        console.error("[v0] API Route: Failed to parse JSON response:", responseText)
        return NextResponse.json({ error: "Invalid response from webhook" }, { status: 500 })
      }
    } else {
      console.log("[v0] API Route: Empty response from webhook, treating as success")
      responseData = { success: true }
    }

    console.log("[v0] API Route: Invite sent successfully")
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("[v0] API Route: Error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
