"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

export default function ProfilesPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createBrowserSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          console.log("[Profiles] No session found, redirecting to home")
          router.push("/")
          return
        }

        setUserEmail(session.user.email || null)
        setIsLoading(false)
      } catch (error) {
        console.error("[Profiles] Error checking auth:", error)
        router.push("/")
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#F58DAA] border-r-transparent"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-4 text-4xl font-bold text-[#222222]">Welcome to Kupid!</h1>
          <p className="mb-8 text-xl text-gray-600">
            You're all set! We'll be in touch soon with your matches.
          </p>

          {userEmail && (
            <div className="rounded-2xl bg-gray-50 p-6">
              <p className="text-sm text-gray-500">Signed in as</p>
              <p className="text-lg font-semibold text-[#222222]">{userEmail}</p>
            </div>
          )}

          <div className="mt-12 rounded-2xl border-2 border-gray-200 bg-white p-8 text-center">
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
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-[#222222]">Your profile is complete</h2>
            <p className="text-gray-600">
              Our matchmakers are working on finding your perfect match. Check your email and phone for updates!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
