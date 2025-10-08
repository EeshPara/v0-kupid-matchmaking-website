"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { Heart, Loader2, Sparkles, Instagram, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Match {
  uid: string
  display_name: string
  gender: string
  sexual_orientation: string
  age: number
  race: string
  religion: string
  interests: string
  dream_date: string
  instagram_handle?: string
  score_breakdown: {
    race_religion: number
    cosine_similarity: number
    interests: number
    dream_date: number
    class_year: number
    age: number
  }
  final_score: number
}

export default function MatchesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [matches, setMatches] = useState<Match[]>([])
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      console.log("[v0] Checking authentication...")
      const supabase = createBrowserSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.log("[v0] No user found, redirecting to home")
        router.push("/")
        return
      }

      console.log("[v0] User authenticated:", user.id)
      setUser(user)
      setLoading(false)

      // Fetch matches
      await fetchMatches(user.id)
    }

    checkAuth()
  }, [router])

  const fetchMatches = async (userId: string) => {
    setLoadingMatches(true)
    console.log("[v0] Fetching matches for user:", userId)

    try {
      const response = await fetch("/api/search-matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_uid: userId }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch matches")
      }

      const data = await response.json()
      console.log("[v0] Matches received:", data)

      if (data.matches && Array.isArray(data.matches)) {
        setMatches(data.matches)
      }
    } catch (error) {
      console.error("[v0] Error fetching matches:", error)
    } finally {
      setLoadingMatches(false)
    }
  }

  const handleNextMatch = () => {
    if (currentMatchIndex < matches.length - 1) {
      setCurrentMatchIndex(currentMatchIndex + 1)
    }
  }

  const handlePreviousMatch = () => {
    if (currentMatchIndex > 0) {
      setCurrentMatchIndex(currentMatchIndex - 1)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Heart className="h-12 w-12 animate-pulse text-[#F58DAA]" fill="#F58DAA" />
          <Loader2 className="h-8 w-8 animate-spin text-[#F58DAA]" />
        </div>
      </div>
    )
  }

  const currentMatch = matches[currentMatchIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#F58DAA]/5 to-[#fcc02d]/5">
      <Header />
      <main className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="relative inline-block">
              <Heart className="mx-auto mb-4 h-16 w-16 text-[#F58DAA]" fill="#F58DAA" />
              <Sparkles className="absolute -right-2 -top-1 h-6 w-6 text-[#fcc02d]" fill="#fcc02d" />
            </div>
            <h1 className="text-4xl font-bold text-[#222222]">
              Your <span className="text-[#F58DAA]">Perfect Matches</span>
            </h1>
            <p className="mt-2 text-lg text-[#666666]">
              {matches.length > 0 ? `${matches.length} matches found` : "Finding your matches..."}
            </p>
          </div>

          {/* Loading State */}
          {loadingMatches && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-[#F58DAA]" />
              <p className="text-lg text-[#666666]">Finding your perfect matches...</p>
            </div>
          )}

          {/* No Matches State */}
          {!loadingMatches && matches.length === 0 && (
            <Card className="border-2 border-[#F58DAA]/20 p-12 text-center">
              <Heart className="mx-auto mb-4 h-16 w-16 text-[#F58DAA]/30" />
              <h2 className="mb-2 text-2xl font-bold text-[#222222]">No Matches Yet</h2>
              <p className="mb-6 text-lg text-[#666666]">
                We're still searching for your perfect matches. Check back soon!
              </p>
              <Button
                onClick={() => fetchMatches(user.id)}
                className="rounded-full bg-[#F58DAA] px-8 py-3 text-white hover:bg-[#F9A6BD]"
              >
                Refresh Matches
              </Button>
            </Card>
          )}

          {/* Match Display */}
          {!loadingMatches && matches.length > 0 && currentMatch && (
            <div className="space-y-6">
              {/* Match Card */}
              <Card className="overflow-hidden border-2 border-[#F58DAA]/20 shadow-xl">
                {/* Match Score Banner */}
                <div className="bg-gradient-to-r from-[#F58DAA] to-[#fcc02d] p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Star className="h-6 w-6 text-white" fill="white" />
                    <span className="text-2xl font-bold text-white">
                      {Math.round(currentMatch.final_score * 100)}% Match
                    </span>
                    <Star className="h-6 w-6 text-white" fill="white" />
                  </div>
                </div>

                <div className="p-8">
                  {/* Profile Header */}
                  <div className="mb-6 text-center">
                    <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#F58DAA] to-[#fcc02d] mx-auto">
                      <span className="text-4xl font-bold text-white">
                        {currentMatch.display_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold text-[#222222]">{currentMatch.display_name}</h2>
                    <p className="mt-1 text-lg text-[#666666]">
                      {currentMatch.age} • {currentMatch.gender}
                    </p>
                  </div>

                  {/* Instagram Handle - Prominent Display */}
                  {currentMatch.instagram_handle && (
                    <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#F58DAA]/10 to-[#fcc02d]/10 p-6 text-center">
                      <Instagram className="mx-auto mb-2 h-8 w-8 text-[#F58DAA]" />
                      <a
                        href={`https://instagram.com/${currentMatch.instagram_handle.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xl font-bold text-[#F58DAA] hover:underline"
                      >
                        @{currentMatch.instagram_handle.replace("@", "")}
                      </a>
                      <p className="mt-1 text-sm text-[#666666]">Connect on Instagram</p>
                    </div>
                  )}

                  {/* Profile Details */}
                  <div className="space-y-4">
                    <div className="rounded-xl bg-white p-4 shadow-sm border border-[#F58DAA]/10">
                      <h3 className="mb-2 font-semibold text-[#222222]">About</h3>
                      <div className="space-y-2 text-[#666666]">
                        <p>
                          <span className="font-medium">Race:</span> {currentMatch.race}
                        </p>
                        <p>
                          <span className="font-medium">Religion:</span> {currentMatch.religion}
                        </p>
                        <p>
                          <span className="font-medium">Orientation:</span> {currentMatch.sexual_orientation}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-white p-4 shadow-sm border border-[#F58DAA]/10">
                      <h3 className="mb-2 font-semibold text-[#222222]">Interests</h3>
                      <p className="text-[#666666]">{currentMatch.interests}</p>
                    </div>

                    <div className="rounded-xl bg-white p-4 shadow-sm border border-[#F58DAA]/10">
                      <h3 className="mb-2 font-semibold text-[#222222]">Dream Date</h3>
                      <p className="text-[#666666]">{currentMatch.dream_date}</p>
                    </div>

                    {/* Score Breakdown */}
                    <div className="rounded-xl bg-gradient-to-br from-[#F58DAA]/5 to-[#fcc02d]/5 p-4">
                      <h3 className="mb-3 font-semibold text-[#222222]">Compatibility Breakdown</h3>
                      <div className="space-y-2">
                        {Object.entries(currentMatch.score_breakdown).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm capitalize text-[#666666]">{key.replace(/_/g, " ")}</span>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-white">
                                <div
                                  className="h-full bg-gradient-to-r from-[#F58DAA] to-[#fcc02d]"
                                  style={{ width: `${value * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-[#222222]">{Math.round(value * 100)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  onClick={handlePreviousMatch}
                  disabled={currentMatchIndex === 0}
                  variant="outline"
                  className="rounded-full border-2 border-[#F58DAA] px-8 py-3 text-[#F58DAA] hover:bg-[#F58DAA]/10 disabled:opacity-50 bg-transparent"
                >
                  ← Previous
                </Button>

                <div className="text-center">
                  <p className="text-sm text-[#666666]">
                    Match {currentMatchIndex + 1} of {matches.length}
                  </p>
                </div>

                <Button
                  onClick={handleNextMatch}
                  disabled={currentMatchIndex === matches.length - 1}
                  className="rounded-full bg-[#F58DAA] px-8 py-3 text-white hover:bg-[#F9A6BD] disabled:opacity-50"
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
