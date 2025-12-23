"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"

interface OnboardingData {
  uid: string
  phone_number: string
  display_name: string
  class_year: string
  gender: string
  sexual_orientation: string
  age: string
  race: string
  religion: string
  interests: string[]
  dream_date: string
  instagram_handle: string
  pref_gender: string
  pref_sexual_orientation: string
  pref_age: string
  pref_class_year: string
  pref_race: string
  pref_religion: string
  agreed_to_terms: boolean
}

const TOTAL_STEPS = 15 // Removed budget step

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

const orientationOptions = ["heterosexual", "homosexual", "bisexual"]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string>("")
  const [authChecked, setAuthChecked] = useState(false)
  const [userEmail, setUserEmail] = useState<string>("")
  const [userId, setUserId] = useState<string>("")
  const router = useRouter()

  const [data, setData] = useState<OnboardingData>({
    uid: "",
    phone_number: "",
    display_name: "",
    class_year: "",
    gender: "",
    sexual_orientation: "",
    age: "",
    race: "",
    religion: "",
    interests: [],
    dream_date: "",
    instagram_handle: "",
    pref_gender: "",
    pref_sexual_orientation: "",
    pref_age: "",
    pref_class_year: "",
    pref_race: "",
    pref_religion: "",
    agreed_to_terms: false,
  })

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("[Onboarding] Checking authentication...")
        const supabase = createBrowserSupabaseClient()
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error("[Onboarding] Session error:", error)
          router.push("/")
          return
        }

        if (!session) {
          console.log("[Onboarding] No session found, redirecting to home")
          router.push("/")
          return
        }

        console.log("[Onboarding] Session found for user:", session.user.id)
        console.log("[Onboarding] User email:", session.user.email)

        setUserId(session.user.id)
        setUserEmail(session.user.email || "")
        setAuthChecked(true)
      } catch (error) {
        console.error("[Onboarding] Error checking auth:", error)
        router.push("/")
      }
    }

    checkAuth()
  }, [router])

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleArrayItem = (field: "interests", item: string) => {
    setData((prev) => ({
      ...prev,
      [field]: prev[field].includes(item) ? prev[field].filter((i) => i !== item) : [...prev[field], item],
    }))
  }

  const validateStep = (currentStep: number): string | null => {
    switch (currentStep) {
      case 1: // Name, Class Year, Instagram
        if (!data.display_name || data.display_name.trim() === "") return "Name is required"
        if (data.display_name.length < 2) return "Name must be at least 2 characters"

        if (!data.class_year) return "Class year is required"
        if (!/^\d{4}$/.test(data.class_year)) return "Class year must be a 4-digit number"
        if (!data.class_year.startsWith("20")) return "Class year must start with 20"
        const year = parseInt(data.class_year)
        if (year < 2000 || year > 2050) return "Class year must be between 2000 and 2050"

        if (data.instagram_handle && data.instagram_handle.includes(" ")) {
          return "Instagram handle cannot contain spaces"
        }
        return null

      case 2: // Phone Number and TOS
        const phoneRegex = /^\+?1?\d{10,14}$/
        if (!data.phone_number) return "Phone number is required"
        if (!phoneRegex.test(data.phone_number.replace(/[\s\-\(\)]/g, ""))) {
          return "Please enter a valid phone number"
        }
        if (!data.agreed_to_terms) return "You must agree to the Terms of Service and Privacy Policy"
        return null

      case 3: // Gender
        if (!data.gender) return "Please select your gender"
        return null

      case 4: // Sexual Orientation
        if (!data.sexual_orientation) return "Please select your sexual orientation"
        return null

      case 5: // Age
        if (!data.age) return "Age is required"
        if (!/^\d+$/.test(data.age)) return "Age must be a number"
        const age = parseInt(data.age)
        if (age < 18 || age > 100) return "Age must be between 18 and 100"
        return null

      case 6: // Race
        if (!data.race) return "Please select your race/ethnicity"
        return null

      case 7: // Religion
        if (!data.religion) return "Please select your religion"
        return null

      case 8: // Interests
        if (data.interests.length === 0) return "Please select at least one interest"
        return null

      case 9: // Dream Date
        if (!data.dream_date || data.dream_date.trim() === "") return "Dream date description is required"
        if (data.dream_date.length < 10) return "Please provide at least 10 characters describing your dream date"
        return null

      case 10: // Preferred Gender
        if (!data.pref_gender) return "Please select preferred gender"
        return null

      case 11: // Preferred Sexual Orientation
        if (!data.pref_sexual_orientation) return "Please select preferred sexual orientation"
        return null

      case 12: // Preferred Age Range (optional with validation if provided)
        if (!data.pref_age) return null // Optional field
        // Check if it's a single number or a range (e.g., "20-25")
        if (/^\d+$/.test(data.pref_age)) {
          const ageVal = parseInt(data.pref_age)
          if (ageVal < 18 || ageVal > 100) return "Age must be between 18 and 100"
        } else if (/^\d+-\d+$/.test(data.pref_age)) {
          const [min, max] = data.pref_age.split("-").map(Number)
          if (min < 18 || max > 100) return "Age range must be between 18 and 100"
          if (min >= max) return "Minimum age must be less than maximum age"
        } else {
          return "Age must be a number or a range (e.g., 20-25)"
        }
        return null

      case 13: // Preferred Class Year (optional with validation if provided)
        if (!data.pref_class_year) return null // Optional field
        // Check if it's a single year or a range (e.g., "2024-2026")
        if (/^\d{4}$/.test(data.pref_class_year)) {
          if (!data.pref_class_year.startsWith("20")) return "Class year must start with 20"
          const yearVal = parseInt(data.pref_class_year)
          if (yearVal < 2000 || yearVal > 2050) return "Class year must be between 2000 and 2050"
        } else if (/^\d{4}-\d{4}$/.test(data.pref_class_year)) {
          const [min, max] = data.pref_class_year.split("-")
          if (!min.startsWith("20") || !max.startsWith("20")) return "Class years must start with 20"
          if (parseInt(min) >= parseInt(max)) return "Start year must be less than end year"
          if (parseInt(min) < 2000 || parseInt(max) > 2050) return "Class years must be between 2000 and 2050"
        } else {
          return "Class year must be a 4-digit year or a range (e.g., 2024-2026)"
        }
        return null

      case 14: // Preferred Race (no validation, optional)
        return null

      case 15: // Preferred Religion (no validation, optional)
        return null

      default:
        return null
    }
  }

  const handleNext = async () => {
    // Validate current step before proceeding
    const validationError = validateStep(step)
    if (validationError) {
      setError(validationError)
      return
    }

    // Clear error if validation passes
    setError("")

    if (step < TOTAL_STEPS) {
      setStep(step + 1)
    } else {
      console.log("[v0] Last onboarding slide completed, calling handleSubmit...")
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    console.log("[v0] ========== STARTING ONBOARDING SUBMISSION ==========")
    setIsLoading(true)
    setError("")

    try {
      console.log("[v0] Using authenticated user ID:", userId)
      console.log("[v0] Using authenticated email:", userEmail)

      console.log("[v0] STEP 1/2: Adding user to database...")
      console.log("[v0] Current form data:", JSON.stringify(data, null, 2))

      const addUserPayload = {
        uid: userId, // Use authenticated user ID
        email: userEmail, // Use authenticated email
        phone_number: data.phone_number,
        display_name: data.display_name,
        class_year: data.class_year,
        gender: data.gender,
        sexual_orientation: data.sexual_orientation,
        age: Number.parseInt(data.age),
        race: data.race,
        religion: data.religion,
        interests: data.interests.join(", "),
        dream_date: data.dream_date,
        instagram_handle: data.instagram_handle,
        onboarding_completed: true,
      }

      console.log("[v0] Payload being sent:", JSON.stringify(addUserPayload, null, 2))

      const addUserResponse = await fetch("/api/add-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addUserPayload),
      })

      if (!addUserResponse.ok) {
        const errorData = await addUserResponse.json()
        throw new Error(`Failed to add user: ${errorData.error || "Unknown error"}`)
      }

      console.log("[v0] ✓ User added successfully")

      console.log("[v0] STEP 2/2: UPDATING USER PREFERENCES...")
      const updatePreferencesPayload = {
        user_uid: userId,
        pref_class_year: data.pref_class_year || data.class_year,
        pref_gender: data.pref_gender || "any",
        pref_sexual_orientation: data.pref_sexual_orientation || "any",
        pref_age: data.pref_age || data.age,
        pref_race: data.pref_race || "Any",
        pref_religion: data.pref_religion || "Any",
      }

      const updatePreferencesResponse = await fetch("/api/update-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePreferencesPayload),
      })

      if (!updatePreferencesResponse.ok) {
        const errorData = await updatePreferencesResponse.json()
        throw new Error(`Failed to update preferences: ${errorData.error || "Unknown error"}`)
      }

      console.log("[v0] ✓ Preferences updated successfully")

      updateData("uid", userId)
      setIsLoading(false)
      setIsComplete(true)

      setTimeout(() => {
        router.push("/complete")
      }, 2000)
    } catch (err) {
      console.error("[v0] Error during onboarding:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsLoading(false)
    }
  }

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Heart className="h-16 w-16 animate-pulse text-[#F58DAA]" fill="#F58DAA" />
            <Heart className="absolute -right-4 -top-2 h-8 w-8 animate-bounce text-[#F9A6BD]" fill="#F9A6BD" />
            <Heart className="absolute -left-4 top-4 h-6 w-6 animate-pulse text-[#ee81a8]" fill="#ee81a8" />
          </div>
          <p className="text-2xl font-semibold text-[#222222]">Loading...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Heart className="h-16 w-16 animate-pulse text-[#F58DAA]" fill="#F58DAA" />
            <Heart className="absolute -right-4 -top-2 h-8 w-8 animate-bounce text-[#F9A6BD]" fill="#F9A6BD" />
            <Heart className="absolute -left-4 top-4 h-6 w-6 animate-pulse text-[#ee81a8]" fill="#ee81a8" />
          </div>
          <p className="text-2xl font-semibold text-[#222222]">Cupid is matching you...</p>
        </div>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="w-full max-w-md space-y-6 p-8">
          <div className="text-center">
            <Heart className="mx-auto mb-4 h-12 w-12 text-[#F58DAA]" fill="#F58DAA" />
            <h2 className="text-3xl font-bold text-[#222222]">Welcome to Kupid!</h2>
            <p className="mt-2 text-gray-600">Your profile is ready</p>
          </div>

          <div className="space-y-3 rounded-2xl bg-gradient-to-br from-[#F58DAA]/10 to-[#F9A6BD]/10 p-6">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Name:</span>
              <span className="text-gray-900">{data.display_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Phone:</span>
              <span className="text-gray-900">{data.phone_number}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Class Year:</span>
              <span className="text-gray-900">{data.class_year}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white p-4">
      <Link href="/" className="absolute left-6 top-6 transition-all hover:scale-105">
        <Image
          src="/images/design-mode/image-19.png"
          alt="Kupid Logo"
          width={90}
          height={90}
          className="h-[90px] w-[90px]"
        />
      </Link>

      <div className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
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

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#222222]">What's your phone number?</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone_number" className="text-base font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    value={data.phone_number}
                    onChange={(e) => updateData("phone_number", e.target.value)}
                    placeholder="(555) 123-4567"
                    className="mt-2 rounded-xl border-2 py-6 text-lg"
                  />
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={data.agreed_to_terms}
                    onChange={(e) => updateData("agreed_to_terms", e.target.checked)}
                    className="mt-1 h-5 w-5 cursor-pointer rounded border-2 border-gray-300 text-[#F58DAA] focus:ring-2 focus:ring-[#F58DAA] focus:ring-offset-2"
                  />
                  <label htmlFor="terms" className="cursor-pointer text-sm text-gray-700">
                    I agree to the{" "}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#F58DAA] underline hover:text-[#F9A6BD]"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#F58DAA] underline hover:text-[#F9A6BD]"
                    >
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#222222]">How do you identify?</h2>
              <div className="grid grid-cols-2 gap-3">
                {["male", "female"].map((option) => (
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

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#222222]">Sexual Orientation</h2>
              <div className="flex flex-wrap gap-3">
                {orientationOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => updateData("sexual_orientation", option)}
                    className={`rounded-full border-2 px-6 py-3 text-base font-medium transition-all ${
                      data.sexual_orientation === option
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

          {step === 6 && (
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

          {step === 7 && (
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

          {step === 8 && (
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

          {step === 9 && (
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

          {step === 10 && (
            <div className="space-y-6">
              <div className="rounded-xl bg-gradient-to-r from-[#F58DAA]/10 to-[#F9A6BD]/10 p-4">
                <p className="text-center text-sm font-medium text-[#222222]">Now let's find your perfect match! 💕</p>
              </div>
              <h2 className="text-2xl font-bold text-[#222222]">What gender are you interested in?</h2>
              <div className="grid grid-cols-3 gap-3">
                {["male", "female", "both"].map((option) => (
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

          {step === 11 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#222222]">Preferred Sexual Orientation</h2>
              <div className="flex flex-wrap gap-3">
                {[...orientationOptions, "any"].map((option) => (
                  <button
                    key={option}
                    onClick={() => updateData("pref_sexual_orientation", option)}
                    className={`rounded-full border-2 px-6 py-3 text-base font-medium transition-all ${
                      data.pref_sexual_orientation === option
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

          {step === 12 && (
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

          {step === 13 && (
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

          {step === 14 && (
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

          {step === 15 && (
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

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

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
      </div>
    </div>
  )
}
