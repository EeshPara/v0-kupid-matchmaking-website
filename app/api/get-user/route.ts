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

    // Call n8n webhook to get user data
    const response = await fetch("https://graysonlee.app.n8n.cloud/webhook/getuser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log("[v0] API Route: Webhook response status:", response.status)
    console.log("[v0] API Route: Response headers:", JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] API Route: Webhook error:", errorText)
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    // Handle empty or non-JSON response
    const responseText = await response.text()
    console.log("[v0] API Route: Response text length:", responseText.length)
    console.log("[v0] API Route: Response text (first 500 chars):", responseText.substring(0, 500))

    if (!responseText || responseText.trim() === "") {
      console.log("[v0] API Route: Empty response from webhook, treating as user not found")
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      console.error("[v0] API Route: Failed to parse JSON response:", responseText)
      console.error("[v0] API Route: Parse error:", e)
      return NextResponse.json({ success: false, message: "Invalid response from webhook" }, { status: 500 })
    }

    // Check if response has nested data property (n8n format)
    if (responseData.data && !Array.isArray(responseData)) {
      if (responseData.data.success === false) {
        console.log("[v0] API Route: User not found in database (nested data object)")
        return NextResponse.json({ success: false, message: responseData.data.message || "User not found" }, { status: 404 })
      }
      if (responseData.data.success === true) {
        console.log("[v0] API Route: User data received successfully (nested data object)")
        return NextResponse.json([responseData.data])
      }
    }

    // Check if it's a plain object with success: false (error case)
    if (responseData.success === false && !Array.isArray(responseData)) {
      console.log("[v0] API Route: User not found in database")
      return NextResponse.json({ success: false, message: responseData.message || "User not found" }, { status: 404 })
    }

    // Check if it's a plain object with success: true (single user)
    if (responseData.success === true && !Array.isArray(responseData)) {
      console.log("[v0] API Route: User data received successfully (plain object)")
      // Wrap in array for consistent response format
      return NextResponse.json([responseData])
    }

    // Check if the response is an array with data wrappers
    if (Array.isArray(responseData) && responseData.length > 0) {
      const firstItem = responseData[0]

      // Check if it has a data property
      if (firstItem.data) {
        // Check if the data indicates failure
        if (firstItem.data.success === false) {
          console.log("[v0] API Route: User not found in database")
          return NextResponse.json({ success: false, message: firstItem.data.message || "User not found" }, { status: 404 })
        }

        // Success case: return the array of data objects (unwrap the data property)
        console.log("[v0] API Route: User data received successfully (array with data wrapper)")
        const unwrappedData = responseData.map(item => item.data)
        return NextResponse.json(unwrappedData)
      }

      // Array without data wrapper - return as is
      if (firstItem.success === true) {
        console.log("[v0] API Route: User data received successfully (plain array)")
        return NextResponse.json(responseData)
      }
    }

    // If we get here, the response format is unexpected
    console.error("[v0] API Route: Unexpected response format:", responseData)
    return NextResponse.json({ success: false, message: "Unexpected response format" }, { status: 500 })
  } catch (error) {
    console.error("[v0] API Route: Error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
