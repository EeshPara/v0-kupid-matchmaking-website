"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { X, Heart } from "lucide-react"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface OnboardingData {
  uid: string
  email: string
  display_name: string
  class_year: string
  gender: string
  sexual_orientation: string[]
  age: string
  race: string
  religion: string
  interests: string[]
  dream_date: string
  budget: string
  instagram_handle: string
  pref_gender: string
  pref_sexual_orientation: string[]
  pref_age: string
  pref_class_year: string
  pref_race: string
  pref_religion: string
  pref_budget: string
}

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

const TOTAL_STEPS = 17

const interestOptions = [
  "art",
  "gaming",
  "yoga",
  "music",
  "sports",
  "reading",
  "cooking",
  "travel",
  "photography",
  "dancing",
]

const orientationOptions = ["straight", "gay", "lesbian", "bisexual", "pansexual", "asexual", "other"]

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string>("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string>("")
  const router = useRouter()

  const [data, setData] = useState<OnboardingData>({
    uid: "",
    email: "",
    display_name: "",
    class_year: "",
    gender: "",
    sexual_orientation: [],
    age: "",
    race: "",
    religion: "",
    interests: [],
    dream_date: "",
    budget: "",
    instagram_handle: "",
    pref_gender: "",
    pref_sexual_orientation: [],
    pref_age: "",
    pref_class_year: "",
    pref_race: "",
    pref_religion: "",
    pref_budget: "",
  })

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleArrayItem = (field: "interests" | "sexual_orientation" | "pref_sexual_orientation", item: string) => {
    setData((prev) => ({
      ...prev,
      [field]: prev[field].includes(item) ? prev[field].filter((i) => i !== item) : [...prev[field], item],
    }))
  }

  const handleNext = async () => {
    if (step === 1 && isAuthenticated) {
      console.log("[v0] User is authenticated on step 1, checking onboarding status...")
      try {
        const response = await fetch("/api/check-onboarding")
        const data = await response.json()

        console.log("[v0] Onboarding check result:", data)

        if (data.onboardingComplete) {
          console.log("[v0] Onboarding complete, redirecting to matches...")
          router.push("/matches")
          handleClose()
          return
        } else {
          console.log("[v0] Onboarding incomplete, proceeding to step 2...")
          setStep(step + 1)
          return
        }
      } catch (error) {
        console.error("[v0] Error checking onboarding status:", error)
        setStep(step + 1)
        return
      }
    }

    if (step < TOTAL_STEPS) {
      setStep(step + 1)
    } else {
      console.log(
        "[v0] Last onboarding slide completed (step 17), calling handleSubmit to add user and update preferences...",
      )
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleOAUTH = async () => {
    console.log("[v0] Starting Google OAuth flow...")
    setError("")

    try {
      const supabase = createBrowserSupabaseClient()
      console.log("[v0] Supabase client created successfully")

      const redirectUrl = `${window.location.origin}/auth/callback`
      console.log("[v0] Redirect URL:", redirectUrl)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      })

      if (error) {
        console.error("[v0] Google sign-in failed:", error.message)
        setError(error.message)
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
    }
  }

  const handleSubmit = async () => {
    console.log("[v0] ========== STARTING ONBOARDING SUBMISSION ==========")
    console.log("[v0] Step 17 completed - Now adding user and updating preferences")
    setIsLoading(true)
    setError("")

    try {
      const uid = userId || crypto.randomUUID()
      console.log("[v0] Using user UID:", uid)

      console.log("[v0] STEP 1/2: Adding user to database...")
      const addUserPayload = {
        uid: uid,
        email: data.email,
        display_name: data.display_name,
        class_year: Number.parseInt(data.class_year),
        gender: data.gender,
        sexual_orientation: data.sexual_orientation.join(", "),
        age: Number.parseInt(data.age),
        race: data.race,
        religion: data.religion,
        interests: data.interests.join(", "),
        dream_date: data.dream_date,
        budget: data.budget,
        instagram_handle: data.instagram_handle,
      }
      console.log("[v0] Add user payload:", JSON.stringify(addUserPayload, null, 2))

      const addUserResponse = await fetch("/api/add-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addUserPayload),
      })

      console.log("[v0] Add user response status:", addUserResponse.status)
      if (!addUserResponse.ok) {
        const errorData = await addUserResponse.json()
        console.error("[v0] Add user failed:", errorData)
        throw new Error(`Failed to add user: ${errorData.error || "Unknown error"}`)
      }

      const addUserResult = await addUserResponse.json()
      console.log("[v0] ✓ User added successfully:", addUserResult)

      console.log("[v0] STEP 2/2: UPDATING USER PREFERENCES (CRITICAL)...")
      const updatePreferencesPayload = {
        user_uid: uid,
        pref_class_year: Number.parseInt(data.pref_class_year) || Number.parseInt(data.class_year),
        pref_gender: data.pref_gender || "any",
        pref_sexual_orientation:
          data.pref_sexual_orientation.length > 0 ? data.pref_sexual_orientation.join(", ") : "any",
        pref_age: data.pref_age || data.age,
        pref_race: data.pref_race || "Any",
        pref_religion: data.pref_religion || "Any",
        pref_budget: data.pref_budget || data.budget || "$0-30",
      }
      console.log("[v0] ========== CALLING UPDATE PREFERENCES ==========")
      console.log("[v0] Update preferences payload:", JSON.stringify(updatePreferencesPayload, null, 2))
      console.log("[v0] CRITICAL: This call MUST succeed for matching to work")

      const updatePreferencesResponse = await fetch("/api/update-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePreferencesPayload),
      })

      console.log("[v0] Update preferences response status:", updatePreferencesResponse.status)

      if (!updatePreferencesResponse.ok) {
        const errorData = await updatePreferencesResponse.json()
        console.error("[v0] ========== CRITICAL ERROR: PREFERENCES UPDATE FAILED ==========")
        console.error("[v0] Error details:", errorData)
        console.error("[v0] Payload that failed:", updatePreferencesPayload)
        throw new Error(`CRITICAL: Failed to update preferences: ${errorData.error || "Unknown error"}`)
      }

      const updatePreferencesResult = await updatePreferencesResponse.json()
      console.log("[v0] ========== SUCCESS: PREFERENCES UPDATED ==========")
      console.log("[v0] Update preferences result:", updatePreferencesResult)
      console.log("[v0] ✓ Preferences have been successfully saved for user:", uid)

      updateData("uid", uid)
      console.log("[v0] ========== ONBOARDING COMPLETED SUCCESSFULLY ==========")

      setIsLoading(false)
      setIsComplete(true)

      setTimeout(() => {
        router.push("/matches")
      }, 2000)
    } catch (err) {
      console.error("[v0] ========== CRITICAL ERROR DURING ONBOARDING ==========")
      console.error("[v0] Error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsLoading(false)

      if (err instanceof Error && err.message.includes("preferences")) {
        alert("CRITICAL ERROR: Failed to save your preferences. Please try again or contact support.")
      }
    }
  }

  const handleSearchMatches = async () => {
    console.log("[v0] Starting match search...")
    setIsLoading(true)
    setError("")

    try {
      const searchPayload = {
        user_uid: data.uid,
      }
      console.log("[v0] Search matches payload:", JSON.stringify(searchPayload, null, 2))

      const searchResponse = await fetch("/api/search-matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchPayload),
      })

      console.log("[v0] Search matches response status:", searchResponse.status)
      if (!searchResponse.ok) {
        const errorData = await searchResponse.json()
        console.error("[v0] Search matches failed:", errorData)
        throw new Error(`Failed to search matches: ${errorData.error || "Unknown error"}`)
      }

      const matches = await searchResponse.json()
      console.log("[v0] Search matches result:", matches)

      console.log("[v0] Calling sendinvite webhook with hardcoded data...")
      const invitePayload = {
        user_id_1: "3c04ba3b-8253-43a1-a7ba-2668e90ff0a7",
        user_id_2: "e188a8ef-b3f8-4510-999a-5f6e3924f8c5",
      }

      const inviteResponse = await fetch("https://graysonlee.app.n8n.cloud/webhook/sendinvite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invitePayload),
      })

      console.log("[v0] Sendinvite webhook response status:", inviteResponse.status)
      if (!inviteResponse.ok) {
        console.error("[v0] Sendinvite webhook failed, but continuing...")
      } else {
        console.log("[v0] Sendinvite webhook called successfully")
      }

      setIsLoading(false)
      router.push("/matches")
      handleClose()
    } catch (err) {
      console.error("[v0] Error during match search:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep(1)
    setIsComplete(false)
    setIsLoading(false)
    setError("")
    onClose()
  }

  useEffect(() => {
    const checkAuth = async () => {
      if (!isOpen) return

      const supabase = createBrowserSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        console.log("[v0] User is authenticated:", user.email)
        setIsAuthenticated(true)
        setUserId(user.id)
        updateData("email", user.email || "")

        console.log("[v0] Checking if onboarding is complete...")
        try {
          const response = await fetch("/api/check-onboarding")
          const data = await response.json()

          console.log("[v0] Onboarding check result:", data)

          if (data.onboardingComplete) {
            console.log("[v0] Onboarding already complete, redirecting to matches...")
            router.push("/matches")
            onClose()
          } else {
            console.log("[v0] Onboarding incomplete, starting at step 2 to skip OAuth slide")
            setStep(2)
          }
        } catch (error) {
          console.error("[v0] Error checking onboarding status:", error)
          setStep(2)
        }
      } else {
        console.log("[v0] User is not authenticated")
        setIsAuthenticated(false)
        setUserId("")
        setStep(1)
      }
    }

    checkAuth()
  }, [isOpen, router, onClose])

  if (!isOpen) return null

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="relative rounded-3xl bg-white/95 p-12 shadow-2xl">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <Heart className="h-16 w-16 animate-pulse text-[#F58DAA]" fill="#F58DAA" />
              <Heart className="absolute -right-4 -top-2 h-8 w-8 animate-bounce text-[#F9A6BD]" fill="#F9A6BD" />
              <Heart className="absolute -left-4 top-4 h-6 w-6 animate-pulse text-[#ee81a8]" fill="#ee81a8" />
            </div>
            <p className="text-2xl font-semibold text-[#222222]">Cupid is matching you...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="relative w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl">
          <button onClick={handleClose} className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>

          <div className="space-y-6">
            <div className="text-center">
              <Heart className="mx-auto mb-4 h-12 w-12 text-[#F58DAA]" fill="#F58DAA" />
              <h2 className="text-3xl font-bold text-[#222222]">Welcome to Kupid!</h2>
              <p className="mt-2 text-gray-600">Your profile is ready</p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-center">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-3 rounded-2xl bg-gradient-to-br from-[#F58DAA]/10 to-[#F9A6BD]/10 p-6">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Name:</span>
                <span className="text-gray-900">{data.display_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Email:</span>
                <span className="text-gray-900">{data.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Class Year:</span>
                <span className="text-gray-900">{data.class_year}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Age:</span>
                <span className="text-gray-900">{data.age}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Interests:</span>
                <span className="text-gray-900">{data.interests.join(", ")}</span>
              </div>
              <div className="mt-4 border-t border-gray-200 pt-3">
                <p className="mb-2 text-sm font-semibold text-gray-700">Looking for:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="text-gray-900">{data.pref_gender}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Age:</span>
                    <span className="text-gray-900">{data.pref_age}</span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSearchMatches}
              disabled={isLoading}
              className="w-full rounded-full bg-[#F58DAA] py-6 text-lg font-semibold text-white hover:bg-[#F9A6BD] disabled:opacity-50"
            >
              Find Perfect Match
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl bg-white/95 p-8 shadow-2xl">
        <button onClick={handleClose} className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100">
          <X className="h-5 w-5" />
        </button>

        <Heart className="absolute -right-3 -top-3 h-8 w-8 rotate-12 text-[#F58DAA]" fill="#F58DAA" />

        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
            <span>
              Step {step} of {TOTAL_STEPS}
            </span>
            <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#F58DAA] to-[#F9A6BD] transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        <div className="min-h-[300px]">
          {step === 1 && (
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
                  className="w-full rounded-full border-2 border-gray-300 bg-white py-6 text-lg font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-3"
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
                  Continue with Google
                </Button>

                {isAuthenticated && (
                  <Button
                    onClick={handleNext}
                    className="w-full rounded-full bg-[#F58DAA] py-6 text-lg font-semibold text-white hover:bg-[#F9A6BD]"
                  >
                    Next
                  </Button>
                )}

                <p className="text-center text-sm text-gray-500">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#222222]">Let's start with the basics</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-base font-medium">
                    What's your name?
                  </Label>
                  <Input
                    id="name"
                    value={data.display_name}
                    onChange={(e) => updateData("display_name", e.target.value)}
                    placeholder="Enter your name"
                    className="mt-2 rounded-xl border-2 py-6 text-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="year" className="text-base font-medium">
                    Class Year
                  </Label>
                  <Input
                    id="year"
                    value={data.class_year}
                    onChange={(e) => updateData("class_year", e.target.value)}
                    placeholder="e.g., 2025"
                    className="mt-2 rounded-xl border-2 py-6 text-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram" className="text-base font-medium">
                    Instagram Handle
                  </Label>
                  <Input
                    id="instagram"
                    value={data.instagram_handle}
                    onChange={(e) => updateData("instagram_handle", e.target.value)}
                    placeholder="e.g., saatvik.barla"
                    className="mt-2 rounded-xl border-2 py-6 text-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#222222]">What's your email?</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-base font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => updateData("email", e.target.value)}
                    placeholder="your.email@example.com"
                    className="mt-2 rounded-xl border-2 py-6 text-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#222222]">How do you identify?</h2>
              <div className="grid grid-cols-2 gap-3">
                {["male", "female", "non-binary", "other"].map((option) => (
                  <button
                    key={option}
                    onClick={() => updateData("gender", option)}
                    className={`rounded-full border-2 py-4 text-lg font-medium transition-all ${
                      data.gender === option
                        ? "border-[#F58DAA] bg-[#F58DAA] text-white"
                        : "border-gray-300 hover:border-[#F58DAA]"
                    }`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#222222]">Sexual Orientation</h2>
              <p className="text-gray-600">Select all that apply</p>
              <div className="flex flex-wrap gap-3">
                {orientationOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleArrayItem("sexual_orientation", option)}
                    className={`rounded-full border-2 px-6 py-3 text-base font-medium transition-all ${
                      data.sexual_orientation.includes(option)
                        ? "border-[#F58DAA] bg-[#F58DAA] text-white"
                        : "border-gray-300 hover:border-[#F58DAA]"
                    }`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#222222]">What's your age?</h2>
              <Input
                type="number"
                value={data.age}
                onChange={(e) => updateData("age", e.target.value)}
                placeholder="Enter your age"
                className="rounded-xl border-2 py-6 text-lg"
                min="18"
                max="100"
              />
            </div>
          )}

          {step === 7 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#222222]">Race / Ethnicity</h2>
              <Select value={data.race} onValueChange={(value) => updateData("race", value)}>
                <SelectTrigger className="rounded-xl border-2 py-6 text-lg">
                  <SelectValue placeholder="Select your race/ethnicity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asian">Asian</SelectItem>
                  <SelectItem value="Black">Black</SelectItem>
                  <SelectItem value="Latinx">Latinx</SelectItem>
                  <SelectItem value="White">White</SelectItem>
                  <SelectItem value="Middle Eastern">Middle Eastern</SelectItem>
                  <SelectItem value="Native American">Native American</SelectItem>
                  <SelectItem value="Pacific Islander">Pacific Islander</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#222222]">Religion</h2>
              <Select value={data.religion} onValueChange={(value) => updateData("religion", value)}>
                <SelectTrigger className="rounded-xl border-2 py-6 text-lg">
                  <SelectValue placeholder="Select your religion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="Christian">Christian</SelectItem>
                  <SelectItem value="Muslim">Muslim</SelectItem>
                  <SelectItem value="Jewish">Jewish</SelectItem>
                  <SelectItem value="Hindu">Hindu</SelectItem>
                  <SelectItem value="Buddhist">Buddhist</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 9 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#222222]">What are your interests?</h2>
              <p className="text-gray-600">Select all that apply</p>
              <div className="flex flex-wrap gap-3">
                {interestOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleArrayItem("interests", option)}
                    className={`rounded-full border-2 px-6 py-3 text-base font-medium transition-all ${
                      data.interests.includes(option)
                        ? "border-[#F58DAA] bg-[#F58DAA] text-white"
                        : "border-gray-300 hover:border-[#F58DAA]"
                    }`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 10 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#222222]">Describe your dream date</h2>
              <Textarea
                value={data.dream_date}
                onChange={(e) => updateData("dream_date", e.target.value)}
                placeholder="e.g., Art gallery followed by sushi"
                className="min-h-[150px] rounded-xl border-2 text-lg"
              />
            </div>
          )}

          {step === 11 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#222222]">What's your budget?</h2>
              <div className="space-y-3">
                {["$0-30", "$30-60", "$60+"].map((option) => (
                  <button
                    key={option}
                    onClick={() => updateData("budget", option)}
                    className={`w-full rounded-full border-2 py-4 text-lg font-medium transition-all ${
                      data.budget === option
                        ? "border-[#F58DAA] bg-[#F58DAA] text-white"
                        : "border-gray-300 hover:border-[#F58DAA]"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 12 && (
            <div className="space-y-6">
              <div className="rounded-xl bg-gradient-to-r from-[#F58DAA]/10 to-[#F9A6BD]/10 p-4">
                <p className="text-center text-sm font-medium text-[#222222]">Now let's find your perfect match! 💕</p>
              </div>
              <h2 className="text-2xl font-bold text-[#222222]">What gender are you interested in?</h2>
              <div className="grid grid-cols-2 gap-3">
                {["male", "female", "non-binary", "any"].map((option) => (
                  <button
                    key={option}
                    onClick={() => updateData("pref_gender", option)}
                    className={`rounded-full border-2 py-4 text-lg font-medium transition-all ${
                      data.pref_gender === option
                        ? "border-[#F58DAA] bg-[#F58DAA] text-white"
                        : "border-gray-300 hover:border-[#F58DAA]"
                    }`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 13 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#222222]">Preferred Sexual Orientation</h2>
              <p className="text-gray-600">Select all that apply</p>
              <div className="flex flex-wrap gap-3">
                {[...orientationOptions, "any"].map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleArrayItem("pref_sexual_orientation", option)}
                    className={`rounded-full border-2 px-6 py-3 text-base font-medium transition-all ${
                      data.pref_sexual_orientation.includes(option)
                        ? "border-[#F58DAA] bg-[#F58DAA] text-white"
                        : "border-gray-300 hover:border-[#F58DAA]"
                    }`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 14 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#222222]">Preferred Age Range</h2>
              <Input
                type="text"
                value={data.pref_age}
                onChange={(e) => updateData("pref_age", e.target.value)}
                placeholder="e.g., 21-25 or 22"
                className="rounded-xl border-2 py-6 text-lg"
              />
              <p className="text-sm text-gray-500">Enter an age range or specific age</p>
            </div>
          )}

          {step === 15 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#222222]">Preferred Class Year</h2>
              <Input
                type="text"
                value={data.pref_class_year}
                onChange={(e) => updateData("pref_class_year", e.target.value)}
                placeholder="e.g., 2025 or 2024-2026"
                className="rounded-xl border-2 py-6 text-lg"
              />
              <p className="text-sm text-gray-500">Enter a specific year or range</p>
            </div>
          )}

          {step === 16 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#222222]">Preferred Race / Ethnicity</h2>
              <Select value={data.pref_race} onValueChange={(value) => updateData("pref_race", value)}>
                <SelectTrigger className="rounded-xl border-2 py-6 text-lg">
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any">Any</SelectItem>
                  <SelectItem value="Asian">Asian</SelectItem>
                  <SelectItem value="Black">Black</SelectItem>
                  <SelectItem value="Latinx">Latinx</SelectItem>
                  <SelectItem value="White">White</SelectItem>
                  <SelectItem value="Middle Eastern">Middle Eastern</SelectItem>
                  <SelectItem value="Native American">Native American</SelectItem>
                  <SelectItem value="Pacific Islander">Pacific Islander</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 17 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#222222]">Preferred Religion</h2>
              <Select value={data.pref_religion} onValueChange={(value) => updateData("pref_religion", value)}>
                <SelectTrigger className="rounded-xl border-2 py-6 text-lg">
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any">Any</SelectItem>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="Christian">Christian</SelectItem>
                  <SelectItem value="Muslim">Muslim</SelectItem>
                  <SelectItem value="Jewish">Jewish</SelectItem>
                  <SelectItem value="Hindu">Hindu</SelectItem>
                  <SelectItem value="Buddhist">Buddhist</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {step !== 1 && (
          <div className="mt-8 flex gap-4">
            {step > 1 && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 rounded-full border-2 border-[#F58DAA] bg-transparent py-6 text-lg font-semibold text-[#F58DAA] hover:bg-[#F58DAA]/10"
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1 rounded-full bg-[#F58DAA] py-6 text-lg font-semibold text-white hover:bg-[#F9A6BD]"
            >
              {step === TOTAL_STEPS ? "Complete" : "Next"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
