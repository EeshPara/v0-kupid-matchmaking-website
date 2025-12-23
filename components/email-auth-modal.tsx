"use client"

import { useState } from "react"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EmailAuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EmailAuthModal({ isOpen, onClose }: EmailAuthModalProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createBrowserSupabaseClient()

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("[EmailAuthModal] Error sending magic link:", error)
        setError(error.message)
        setIsLoading(false)
        return
      }

      console.log("[EmailAuthModal] Magic link sent successfully to:", email)
      setMagicLinkSent(true)
      setIsLoading(false)
    } catch (err) {
      console.error("[EmailAuthModal] Unexpected error:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-gray-600"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {!magicLinkSent ? (
          <>
            <h2 className="mb-2 text-2xl font-bold text-[#222222]">Join/Login Kupid Matchmaker</h2>
            <p className="mb-6 text-gray-600">Enter your email to log back in or get started with a magic link</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-base font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                  className="mt-2 rounded-xl border-2 py-6 text-lg"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-[#F58DAA] py-6 text-lg font-semibold text-white shadow-[0_4px_12px_rgba(245,141,170,0.3)] transition-all hover:scale-105 hover:bg-[#F9A6BD] disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? "Sending..." : "Send Magic Link"}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <svg
                className="h-16 w-16 text-[#F58DAA]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-[#222222]">Check your email!</h2>
            <p className="mb-4 text-gray-600">
              We've sent a magic link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Click the link in your email to sign in. You can close this window.
            </p>
            <Button
              onClick={onClose}
              className="mt-6 rounded-full bg-gray-100 px-8 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-200"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
