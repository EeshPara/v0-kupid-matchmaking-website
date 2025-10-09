"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { Heart } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log("[v0] Auth callback page loaded")

      const hash = window.location.hash
      const searchParams = new URLSearchParams(window.location.search)

      // Check if we have a hash fragment with auth tokens (implicit flow)
      if (hash && hash.includes("access_token")) {
        console.log("[v0] Hash-based auth detected, processing...")

        const supabase = createBrowserSupabaseClient()

        // Supabase will automatically handle the hash and set the session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (session && !error) {
          console.log("[v0] Session established via hash, redirecting to onboarding...")
          // Clear the hash from URL and redirect
          router.replace("/onboarding")
        } else {
          console.error("[v0] Failed to establish session from hash:", error)
          router.replace("/?error=auth_failed")
        }
      } else {
        console.log("[v0] No hash tokens found, waiting for server-side code exchange...")
        // Server-side route will handle the code exchange and redirect
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <Heart className="h-16 w-16 animate-pulse text-[#F58DAA]" fill="#F58DAA" />
          <Heart className="absolute -right-4 -top-2 h-8 w-8 animate-bounce text-[#F9A6BD]" fill="#F9A6BD" />
          <Heart className="absolute -left-4 top-4 h-6 w-6 animate-pulse text-[#ee81a8]" fill="#ee81a8" />
        </div>
        <p className="text-2xl font-semibold text-[#222222]">Signing you in...</p>
      </div>
    </div>
  )
}
