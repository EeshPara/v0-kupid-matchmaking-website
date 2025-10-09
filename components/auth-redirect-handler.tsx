"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

export function AuthRedirectHandler() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthRedirect = async () => {
      // Check if we have a hash fragment with auth tokens
      const hash = window.location.hash
      if (hash && hash.includes("access_token")) {
        console.log("[v0] Hash-based auth detected, processing...")

        const supabase = createBrowserSupabaseClient()

        // Supabase will automatically handle the hash and set the session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (session && !error) {
          console.log("[v0] Session established, redirecting to onboarding...")
          // Clear the hash from URL
          window.location.hash = ""
          // Redirect to onboarding
          router.push("/onboarding")
        }
      }
    }

    handleAuthRedirect()
  }, [router])

  return null
}
