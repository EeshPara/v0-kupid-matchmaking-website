import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("[v0] API Route: add-user called")

  try {
    const body = await request.json()
    console.log("[v0] API Route: Received payload:", JSON.stringify(body, null, 2))

    // Call n8n webhook to add new user
    const response = await fetch("https://graysonlee.app.n8n.cloud/webhook/addnewuser", {
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

    // Handle empty response from webhook
    const responseText = await response.text()
    let data = { success: true, message: "User added successfully" }

    if (responseText) {
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.log("[v0] API Route: Webhook returned non-JSON response, treating as success")
      }
    }

    console.log("[v0] API Route: Webhook success:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] API Route: Error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
