"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Heart, LogOut, Sparkles, CheckCircle2, User, Settings } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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

export default function ProfilesPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>("")
  const [accessToken, setAccessToken] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    display_name: "",
    phone_number: "",
    class_year: "",
    gender: "",
    sexual_orientation: "",
    age: "",
    race: "",
    religion: "",
    interests: [] as string[],
    dream_date: "",
    instagram_handle: "",
    pref_gender: "",
    pref_sexual_orientation: "",
    pref_age: "",
    pref_class_year: "",
    pref_race: "",
    pref_religion: "",
  })

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const supabase = createBrowserSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          console.log("[Profiles] No session found, redirecting to home")
          router.push("/")
          return
        }

        setUserEmail(session.user.email || null)
        setUserId(session.user.id)
        setAccessToken(session.access_token)

        // Fetch user data
        console.log("[Profiles] Fetching user data...")
        const userResponse = await fetch("/api/get-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ user_uid: session.user.id }),
        })

        if (userResponse.ok) {
          const userDataResponse = await userResponse.json()
          const user = Array.isArray(userDataResponse) ? userDataResponse[0] : userDataResponse
          console.log("[Profiles] User data received:", user)

          // Fetch preferences data
          console.log("[Profiles] Fetching preferences data...")
          const preferencesResponse = await fetch("/api/get-preferences", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ user_uid: session.user.id }),
          })

          if (preferencesResponse.ok) {
            const prefsData = await preferencesResponse.json()
            console.log("[Profiles] Preferences data received:", prefsData)

            // Populate form with fetched data
            setFormData({
              display_name: user.display_name || "",
              phone_number: user.phone_number || "",
              class_year: user.class_year || "",
              gender: user.gender || "",
              sexual_orientation: user.sexual_orientation || "",
              age: user.age?.toString() || "",
              race: user.race || "",
              religion: user.religion || "",
              interests: user.interests ? user.interests.split(", ") : [],
              dream_date: user.dream_date || "",
              instagram_handle: user.instagram_handle || "",
              pref_gender: prefsData.pref_gender || "",
              pref_sexual_orientation: prefsData.pref_sexual_orientation || "",
              pref_age: prefsData.pref_age || "",
              pref_class_year: prefsData.pref_class_year || "",
              pref_race: prefsData.pref_race || "",
              pref_religion: prefsData.pref_religion || "",
            })
          } else {
            console.error("[Profiles] Failed to fetch preferences")
          }
        } else {
          console.error("[Profiles] Failed to fetch user data")
          setError("Failed to load your profile data")
        }

        setIsLoading(false)
      } catch (error) {
        console.error("[Profiles] Error checking auth:", error)
        router.push("/")
      }
    }

    checkAuthAndFetchData()
  }, [router])

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleSignOut = async () => {
    try {
      const supabase = createBrowserSupabaseClient()
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("[Profiles] Error signing out:", error)
    }
  }

  const handleSubmit = async () => {
    setIsSaving(true)
    setError("")
    setSuccessMessage("")
    setShowSuccessAnimation(false)

    try {
      console.log("[Profiles] Updating user data...")

      // Update user data
      const updateUserPayload = {
        uid: userId,
        email: userEmail,
        phone_number: formData.phone_number,
        display_name: formData.display_name,
        class_year: formData.class_year,
        gender: formData.gender,
        sexual_orientation: formData.sexual_orientation,
        age: Number.parseInt(formData.age),
        race: formData.race,
        religion: formData.religion,
        interests: formData.interests.join(", "),
        dream_date: formData.dream_date,
        instagram_handle: formData.instagram_handle,
        onboarding_completed: true,
      }

      const userUpdateResponse = await fetch("/api/update-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updateUserPayload),
      })

      if (!userUpdateResponse.ok) {
        const errorData = await userUpdateResponse.json()
        throw new Error(`Failed to update user: ${errorData.error || "Unknown error"}`)
      }

      console.log("[Profiles] User data updated successfully")

      // Update preferences
      const updatePreferencesPayload = {
        user_uid: userId,
        pref_class_year: formData.pref_class_year || formData.class_year,
        pref_gender: formData.pref_gender || "any",
        pref_sexual_orientation: formData.pref_sexual_orientation || "any",
        pref_age: formData.pref_age || formData.age,
        pref_race: formData.pref_race || "Any",
        pref_religion: formData.pref_religion || "Any",
      }

      const preferencesUpdateResponse = await fetch("/api/update-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updatePreferencesPayload),
      })

      if (!preferencesUpdateResponse.ok) {
        const errorData = await preferencesUpdateResponse.json()
        throw new Error(`Failed to update preferences: ${errorData.error || "Unknown error"}`)
      }

      console.log("[Profiles] Preferences updated successfully")

      setSuccessMessage("Profile updated successfully!")
      setShowSuccessAnimation(true)
      setIsSaving(false)

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("")
        setShowSuccessAnimation(false)
      }, 5000)
    } catch (err) {
      console.error("[Profiles] Error updating profile:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-[#FFF5F8] to-white">
        <div className="text-center">
          <Heart className="mx-auto mb-4 h-16 w-16 animate-pulse text-[#F58DAA]" fill="#F58DAA" />
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#F58DAA] border-r-transparent"></div>
          <p className="text-lg text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FFF5F8] to-white">
      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-[#F58DAA] opacity-20" />
            <div className="relative flex flex-col items-center justify-center gap-6 rounded-3xl bg-white p-12 shadow-2xl">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-green-500 opacity-20" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600">
                  <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={3} />
                </div>
              </div>
              <div className="text-center">
                <h3 className="mb-2 text-3xl font-bold text-[#222222]">Success!</h3>
                <p className="text-lg text-gray-600">Your profile has been updated</p>
              </div>
              <div className="flex gap-2">
                <Heart className="h-6 w-6 animate-bounce text-[#F58DAA]" fill="#F58DAA" />
                <Heart className="h-6 w-6 animate-bounce text-[#F9A6BD]" fill="#F9A6BD" style={{ animationDelay: "0.1s" }} />
                <Heart className="h-6 w-6 animate-bounce text-[#ee81a8]" fill="#ee81a8" style={{ animationDelay: "0.2s" }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center transition-all hover:scale-105">
            <Image
              src="/images/design-mode/image-19.png"
              alt="Kupid Logo"
              width={90}
              height={90}
              className="h-[90px] w-[90px]"
            />
          </Link>

          <Button
            onClick={handleSignOut}
            variant="outline"
            className="flex items-center gap-2 rounded-full border-2 border-gray-300 px-6 py-3 text-base font-medium transition-all hover:border-[#F58DAA] hover:bg-[#F58DAA]/10 hover:text-[#F58DAA]"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-5xl">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <Sparkles className="h-10 w-10 text-[#F58DAA]" />
              <h1 className="text-5xl font-bold text-[#222222]">Your Profile</h1>
              <Sparkles className="h-10 w-10 text-[#F58DAA]" />
            </div>
            <p className="text-xl text-gray-600">
              Keep your information up to date to find your perfect match
            </p>
          </div>

          {userEmail && (
            <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#F58DAA]/10 to-[#F9A6BD]/10 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F58DAA]">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Signed in as</p>
                    <p className="text-lg font-semibold text-[#222222]">{userEmail}</p>
                  </div>
                </div>
                <Heart className="h-8 w-8 animate-pulse text-[#F58DAA]" fill="#F58DAA" />
              </div>
            </div>
          )}

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-center text-sm text-red-600 shadow-sm">
              {error}
            </div>
          )}

          {successMessage && !showSuccessAnimation && (
            <div className="mb-6 rounded-xl bg-green-50 p-4 text-center text-sm text-green-600 shadow-sm">
              {successMessage}
            </div>
          )}

          {/* User Information Section */}
          <div className="mb-8 rounded-3xl border-2 border-gray-100 bg-white p-10 shadow-xl">
            <div className="mb-8 flex items-center gap-3">
              <User className="h-7 w-7 text-[#F58DAA]" />
              <h2 className="text-3xl font-bold text-[#222222]">Personal Information</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="display_name" className="text-base font-semibold text-gray-700">
                    Name
                  </Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => updateFormData("display_name", e.target.value)}
                    placeholder="Enter your name"
                    className="mt-2 rounded-xl border-2 border-gray-200 py-6 text-lg transition-all focus:border-[#F58DAA] focus:ring-2 focus:ring-[#F58DAA]/20"
                  />
                </div>

                <div>
                  <Label htmlFor="phone_number" className="text-base font-semibold text-gray-700">
                    Phone Number
                  </Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => updateFormData("phone_number", e.target.value)}
                    placeholder="(555) 123-4567"
                    className="mt-2 rounded-xl border-2 border-gray-200 py-6 text-lg transition-all focus:border-[#F58DAA] focus:ring-2 focus:ring-[#F58DAA]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="class_year" className="text-base font-semibold text-gray-700">
                    Class Year
                  </Label>
                  <Input
                    id="class_year"
                    value={formData.class_year}
                    onChange={(e) => updateFormData("class_year", e.target.value)}
                    placeholder="e.g., 2025"
                    className="mt-2 rounded-xl border-2 border-gray-200 py-6 text-lg transition-all focus:border-[#F58DAA] focus:ring-2 focus:ring-[#F58DAA]/20"
                  />
                </div>

                <div>
                  <Label htmlFor="age" className="text-base font-semibold text-gray-700">
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => updateFormData("age", e.target.value)}
                    placeholder="Enter your age"
                    className="mt-2 rounded-xl border-2 border-gray-200 py-6 text-lg transition-all focus:border-[#F58DAA] focus:ring-2 focus:ring-[#F58DAA]/20"
                    min="18"
                    max="100"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="instagram_handle" className="text-base font-semibold text-gray-700">
                  Instagram Handle
                </Label>
                <Input
                  id="instagram_handle"
                  value={formData.instagram_handle}
                  onChange={(e) => updateFormData("instagram_handle", e.target.value)}
                  placeholder="e.g., your.username"
                  className="mt-2 rounded-xl border-2 border-gray-200 py-6 text-lg transition-all focus:border-[#F58DAA] focus:ring-2 focus:ring-[#F58DAA]/20"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label className="text-base font-semibold text-gray-700">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => updateFormData("gender", value)}>
                    <SelectTrigger className="mt-2 rounded-xl border-2 border-gray-200 py-6 text-lg transition-all focus:border-[#F58DAA] focus:ring-2 focus:ring-[#F58DAA]/20">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-semibold text-gray-700">Sexual Orientation</Label>
                  <Select
                    value={formData.sexual_orientation}
                    onValueChange={(value) => updateFormData("sexual_orientation", value)}
                  >
                    <SelectTrigger className="mt-2 rounded-xl border-2 border-gray-200 py-6 text-lg transition-all focus:border-[#F58DAA] focus:ring-2 focus:ring-[#F58DAA]/20">
                      <SelectValue placeholder="Select your orientation" />
                    </SelectTrigger>
                    <SelectContent>
                      {orientationOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label className="text-base font-semibold text-gray-700">Race / Ethnicity</Label>
                  <Select value={formData.race} onValueChange={(value) => updateFormData("race", value)}>
                    <SelectTrigger className="mt-2 rounded-xl border-2 border-gray-200 py-6 text-lg transition-all focus:border-[#F58DAA] focus:ring-2 focus:ring-[#F58DAA]/20">
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

                <div>
                  <Label className="text-base font-semibold text-gray-700">Religion</Label>
                  <Select value={formData.religion} onValueChange={(value) => updateFormData("religion", value)}>
                    <SelectTrigger className="mt-2 rounded-xl border-2 border-gray-200 py-6 text-lg transition-all focus:border-[#F58DAA] focus:ring-2 focus:ring-[#F58DAA]/20">
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
              </div>

              <div>
                <Label className="text-base font-semibold text-gray-700">Interests</Label>
                <p className="mb-3 mt-1 text-sm text-gray-500">Select all that apply</p>
                <div className="flex flex-wrap gap-3">
                  {interestOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleInterest(option)}
                      className={`rounded-full border-2 px-6 py-3 text-base font-medium transition-all ${
                        formData.interests.includes(option)
                          ? "border-[#F58DAA] bg-[#F58DAA] text-white shadow-lg shadow-[#F58DAA]/30"
                          : "border-gray-300 hover:border-[#F58DAA] hover:bg-[#F58DAA]/5"
                      }`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="dream_date" className="text-base font-semibold text-gray-700">
                  Dream Date Description
                </Label>
                <Textarea
                  id="dream_date"
                  value={formData.dream_date}
                  onChange={(e) => updateFormData("dream_date", e.target.value)}
                  placeholder="Describe your dream date..."
                  className="mt-2 min-h-[120px] rounded-xl border-2 border-gray-200 text-lg transition-all focus:border-[#F58DAA] focus:ring-2 focus:ring-[#F58DAA]/20"
                />
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="mb-8 rounded-3xl border-2 border-gray-100 bg-white p-10 shadow-xl">
            <div className="mb-8 flex items-center gap-3">
              <Settings className="h-7 w-7 text-[#F58DAA]" />
              <h2 className="text-3xl font-bold text-[#222222]">Match Preferences</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label className="text-base font-semibold text-gray-700">Preferred Gender</Label>
                  <Select
                    value={formData.pref_gender}
                    onValueChange={(value) => updateFormData("pref_gender", value)}
                  >
                    <SelectTrigger className="mt-2 rounded-xl border-2 border-gray-200 py-6 text-lg transition-all focus:border-[#F58DAA] focus:ring-2 focus:ring-[#F58DAA]/20">
                      <SelectValue placeholder="Select preferred gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-semibold text-gray-700">Preferred Sexual Orientation</Label>
                  <Select
                    value={formData.pref_sexual_orientation}
                    onValueChange={(value) => updateFormData("pref_sexual_orientation", value)}
                  >
                    <SelectTrigger className="mt-2 rounded-xl border-2 border-gray-200 py-6 text-lg transition-all focus:border-[#F58DAA] focus:ring-2 focus:ring-[#F58DAA]/20">
                      <SelectValue placeholder="Select preferred orientation" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...orientationOptions, "any"].map((option) => (
                        <SelectItem key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="pref_age" className="text-base font-semibold text-gray-700">
                    Preferred Age Range
                  </Label>
                  <Input
                    id="pref_age"
                    value={formData.pref_age}
                    onChange={(e) => updateFormData("pref_age", e.target.value)}
                    placeholder="e.g., 21-25 or 22"
                    className="mt-2 rounded-xl border-2 border-gray-200 py-6 text-lg transition-all focus:border-[#F58DAA] focus:ring-2 focus:ring-[#F58DAA]/20"
                  />
                  <p className="mt-1 text-sm text-gray-500">Enter an age range or specific age</p>
                </div>

                <div>
                  <Label htmlFor="pref_class_year" className="text-base font-semibold text-gray-700">
                    Preferred Class Year
                  </Label>
                  <Input
                    id="pref_class_year"
                    value={formData.pref_class_year}
                    onChange={(e) => updateFormData("pref_class_year", e.target.value)}
                    placeholder="e.g., 2025 or 2024-2026"
                    className="mt-2 rounded-xl border-2 border-gray-200 py-6 text-lg transition-all focus:border-[#F58DAA] focus:ring-2 focus:ring-[#F58DAA]/20"
                  />
                  <p className="mt-1 text-sm text-gray-500">Enter a specific year or range</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label className="text-base font-semibold text-gray-700">Preferred Race / Ethnicity</Label>
                  <Select value={formData.pref_race} onValueChange={(value) => updateFormData("pref_race", value)}>
                    <SelectTrigger className="mt-2 rounded-xl border-2 border-gray-200 py-6 text-lg transition-all focus:border-[#F58DAA] focus:ring-2 focus:ring-[#F58DAA]/20">
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

                <div>
                  <Label className="text-base font-semibold text-gray-700">Preferred Religion</Label>
                  <Select
                    value={formData.pref_religion}
                    onValueChange={(value) => updateFormData("pref_religion", value)}
                  >
                    <SelectTrigger className="mt-2 rounded-xl border-2 border-gray-200 py-6 text-lg transition-all focus:border-[#F58DAA] focus:ring-2 focus:ring-[#F58DAA]/20">
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
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#F58DAA] to-[#F9A6BD] px-16 py-7 text-xl font-bold text-white shadow-2xl shadow-[#F58DAA]/40 transition-all hover:scale-105 hover:shadow-[#F58DAA]/60 disabled:opacity-50 disabled:hover:scale-100"
            >
              <span className="relative z-10 flex items-center gap-3">
                {isSaving ? (
                  <>
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-white border-r-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Heart className="h-6 w-6" fill="white" />
                    Save Changes
                    <Sparkles className="h-6 w-6" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full"></div>
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <div className="flex items-center justify-center gap-2">
              <Heart className="h-5 w-5 animate-pulse text-[#F58DAA]" fill="#F58DAA" />
              <p className="text-sm text-gray-500">
                Your perfect match is waiting for you
              </p>
              <Heart className="h-5 w-5 animate-pulse text-[#F58DAA]" fill="#F58DAA" style={{ animationDelay: "0.5s" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
