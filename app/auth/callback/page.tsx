"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("[AuthCallback] Starting auth callback handler...")
        const supabase = createBrowserSupabaseClient()

        // Get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("[AuthCallback] Session error:", sessionError)
          router.push("/")
          return
        }

        if (!session) {
          console.log("[AuthCallback] No session found, redirecting to home")
          router.push("/")
          return
        }

        console.log("[AuthCallback] Session found for user:", session.user.id)
        console.log("[AuthCallback] User email:", session.user.email)

        // Check if user exists and has completed onboarding
        const response = await fetch("/api/get-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_uid: session.user.id }),
        })

        console.log("[AuthCallback] Get user response status:", response.status)

        if (response.ok) {
          const responseData = await response.json()
          console.log("[AuthCallback] API response:", responseData)

          // The API returns an array with user data
          const userData = Array.isArray(responseData) ? responseData[0] : responseData

          // Check if user exists and completed onboarding
          if (userData && userData.onboarding_completed) {
            console.log("[AuthCallback] User has completed onboarding, redirecting to /profiles")
            router.push("/profiles")
          } else {
            console.log("[AuthCallback] User exists but hasn't completed onboarding, redirecting to /onboarding")
            router.push("/onboarding")
          }
        } else {
          // User doesn't exist (404) - send to onboarding
          console.log("[AuthCallback] User doesn't exist (404), redirecting to /onboarding")
          router.push("/onboarding")
        }
      } catch (error) {
        console.error("[AuthCallback] Error:", error)
        router.push("/")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#F58DAA] border-r-transparent"></div>
        <p className="text-lg text-gray-600">Signing you in...</p>
      </div>
    </div>
  )
}
