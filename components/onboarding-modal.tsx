"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Heart } from "lucide-react"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const handleOAUTH = async () => {
    console.log("[v0] Starting Google OAuth flow...")
    setError("")
    setIsLoading(true)

    try {
      const supabase = createBrowserSupabaseClient()
      console.log("[v0] Supabase client created successfully")

      const redirectUrl = `${window.location.origin}/onboarding`
      console.log("[v0] Redirect URL:", redirectUrl)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error("[v0] Google sign-in failed:", error.message)
        setError(error.message)
        setIsLoading(false)
      } else {
        console.log("[v0] Google sign-in redirect started")
        if (data?.url) {
          console.log("[v0] Redirecting to:", data.url)
          window.location.href = data.url
        }
      }
    } catch (err) {
      console.error("[v0] OAuth error:", err)
      setError(err instanceof Error ? err.message : "Failed to start OAuth flow")
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl bg-white/95 p-8 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100">
          <X className="h-5 w-5" />
        </button>

        <Heart className="absolute -right-3 -top-3 h-8 w-8 rotate-12 text-[#F58DAA]" fill="#F58DAA" />

        <div className="space-y-6">
          <div className="text-center">
            <Heart className="mx-auto mb-4 h-16 w-16 text-[#F58DAA]" fill="#F58DAA" />
            <h2 className="text-3xl font-bold text-[#222222]">Welcome to Kupid</h2>
            <p className="mt-2 text-gray-600">Find your perfect match</p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-center">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <Button
              onClick={handleOAUTH}
              disabled={isLoading}
              className="w-full rounded-full border-2 border-gray-300 bg-white py-6 text-lg font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 8.55 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66 2.84.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoading ? "Signing in..." : "Continue with Google"}
            </Button>

            <p className="text-center text-sm text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
