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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase configuration")
    }

    // Call Supabase edge function
    const response = await fetch(`${supabaseUrl}/functions/v1/document-to-user`, {
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
    console.log("[v0] API Route: Parsed response data:", JSON.stringify(data, null, 2))

    // Edge function returns { data: { ...userData, success: true } }
    console.log("[v0] API Route: User data retrieved successfully for metadata:", body.document_metadata)
    const userData = data.data || data
    return NextResponse.json(Array.isArray(userData) ? userData : [userData])
  } catch (error) {
    console.error("[v0] API Route: Error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
