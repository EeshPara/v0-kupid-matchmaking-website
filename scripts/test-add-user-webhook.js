// Test script to verify the addnewuser webhook works correctly

const testData = {
  uid: "9d7ebaad-4daf-4b55-9198-081e9f5142d3",
  email: "eeshpara@gmail.com",
  display_name: "Eeshwar Parasuramuni",
  class_year: 2028,
  gender: "male",
  sexual_orientation: "straight",
  age: 19,
  race: "Asian",
  religion: "Hindu",
  interests: "art, sports, travel",
  dream_date: "Walking in Zilker park get some coffee and then dinner",
  budget: "$0-30",
  instagram_handle: "eesh_para",
}

console.log("[v0] Testing addnewuser webhook...")
console.log("[v0] Sending payload:", JSON.stringify(testData, null, 2))

async function testWebhook() {
  try {
    const response = await fetch("https://graysonlee.app.n8n.cloud/webhook/addnewuser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    })

    console.log("[v0] Response status:", response.status)
    console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log("[v0] Response body (raw):", responseText)

    if (response.ok) {
      try {
        const jsonData = JSON.parse(responseText)
        console.log("[v0] Response body (parsed):", JSON.stringify(jsonData, null, 2))
        console.log("[v0] ✅ Webhook test PASSED!")
      } catch (e) {
        console.log("[v0] Response is not JSON, but request succeeded")
        console.log("[v0] ✅ Webhook test PASSED!")
      }
    } else {
      console.error("[v0] ❌ Webhook test FAILED!")
      console.error("[v0] Error response:", responseText)
    }
  } catch (error) {
    console.error("[v0] ❌ Webhook test FAILED with exception!")
    console.error("[v0] Error:", error.message)
    console.error("[v0] Full error:", error)
  }
}

testWebhook()
