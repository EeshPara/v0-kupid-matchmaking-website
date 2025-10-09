import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("[v0] API Route: document-to-user called")

  try {
    const body = await request.json()
    console.log("[v0] API Route: Received payload:", JSON.stringify(body, null, 2))

    if (!body.document_metadata) {
      console.error("[v0] API Route: Missing document_metadata in request")
      return NextResponse.json({ error: "document_metadata is required" }, { status: 400 })
    }

    console.log("[v0] API Route: Fetching user for document_metadata:", body.document_metadata)

    // Call n8n webhook to convert document metadata to user
    const response = await fetch("https://graysonlee.app.n8n.cloud/webhook/documenttouser", {
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

    const responseText = await response.text()
    console.log("[v0] API Route: Response text length:", responseText.length)
    console.log("[v0] API Route: Response text (first 500 chars):", responseText.substring(0, 500))

    if (!responseText || responseText.trim() === "") {
      console.log("[v0] API Route: Empty response from webhook")
      return NextResponse.json({ error: "Empty response from webhook" }, { status: 500 })
    }

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      console.error("[v0] API Route: Failed to parse JSON response:", responseText)
      return NextResponse.json({ error: "Invalid response from webhook" }, { status: 500 })
    }

    console.log("[v0] API Route: Parsed response data:", JSON.stringify(responseData, null, 2))

    // n8n now returns data directly without wrapper
    console.log("[v0] API Route: User data retrieved successfully for metadata:", body.document_metadata)
    return NextResponse.json(Array.isArray(responseData) ? responseData : [responseData])
  } catch (error) {
    console.error("[v0] API Route: Error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
