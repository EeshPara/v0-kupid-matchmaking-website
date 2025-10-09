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

    console.log("[v0] API Route: Calling webhook to update preferences for user:", body.user_uid)

    // Call n8n webhook to update user preferences
    const response = await fetch("https://graysonlee.app.n8n.cloud/webhook/updatepreferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log("[v0] API Route: Webhook response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] API Route: CRITICAL - Webhook error:", errorText)
      console.error("[v0] API Route: Failed payload:", body)
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    // Handle empty response from webhook
    const responseText = await response.text()
    let data = { success: true, message: "Preferences updated successfully" }

    if (responseText) {
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.log("[v0] API Route: Webhook returned non-JSON response, treating as success")
      }
    }

    console.log("[v0] API Route: SUCCESS - Webhook response:", data)
    console.log("[v0] API Route: Preferences successfully updated for user:", body.user_uid)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] API Route: CRITICAL ERROR:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
