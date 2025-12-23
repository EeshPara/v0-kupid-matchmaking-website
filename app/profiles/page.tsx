"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

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

  const handleSubmit = async () => {
    setIsSaving(true)
    setError("")
    setSuccessMessage("")

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
      setIsSaving(false)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("[Profiles] Error updating profile:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#F58DAA] border-r-transparent"></div>
          <p className="text-lg text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-4 text-4xl font-bold text-[#222222]">Your Profile</h1>
          <p className="mb-8 text-xl text-gray-600">
            Update your information and preferences
          </p>

          {userEmail && (
            <div className="mb-8 rounded-2xl bg-gray-50 p-6">
              <p className="text-sm text-gray-500">Signed in as</p>
              <p className="text-lg font-semibold text-[#222222]">{userEmail}</p>
            </div>
          )}

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm text-green-600">
              {successMessage}
            </div>
          )}

          {/* User Information Section */}
          <div className="mb-8 rounded-2xl border-2 border-gray-200 bg-white p-8">
            <h2 className="mb-6 text-2xl font-bold text-[#222222]">Personal Information</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="display_name" className="text-base font-medium">
                    Name
                  </Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => updateFormData("display_name", e.target.value)}
                    placeholder="Enter your name"
                    className="mt-2 rounded-xl border-2 py-6 text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="phone_number" className="text-base font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => updateFormData("phone_number", e.target.value)}
                    placeholder="(555) 123-4567"
                    className="mt-2 rounded-xl border-2 py-6 text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="class_year" className="text-base font-medium">
                    Class Year
                  </Label>
                  <Input
                    id="class_year"
                    value={formData.class_year}
                    onChange={(e) => updateFormData("class_year", e.target.value)}
                    placeholder="e.g., 2025"
                    className="mt-2 rounded-xl border-2 py-6 text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="age" className="text-base font-medium">
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => updateFormData("age", e.target.value)}
                    placeholder="Enter your age"
                    className="mt-2 rounded-xl border-2 py-6 text-lg"
                    min="18"
                    max="100"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="instagram_handle" className="text-base font-medium">
                  Instagram Handle
                </Label>
                <Input
                  id="instagram_handle"
                  value={formData.instagram_handle}
                  onChange={(e) => updateFormData("instagram_handle", e.target.value)}
                  placeholder="e.g., your.username"
                  className="mt-2 rounded-xl border-2 py-6 text-lg"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label className="text-base font-medium">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => updateFormData("gender", value)}>
                    <SelectTrigger className="mt-2 rounded-xl border-2 py-6 text-lg">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-medium">Sexual Orientation</Label>
                  <Select
                    value={formData.sexual_orientation}
                    onValueChange={(value) => updateFormData("sexual_orientation", value)}
                  >
                    <SelectTrigger className="mt-2 rounded-xl border-2 py-6 text-lg">
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
                  <Label className="text-base font-medium">Race / Ethnicity</Label>
                  <Select value={formData.race} onValueChange={(value) => updateFormData("race", value)}>
                    <SelectTrigger className="mt-2 rounded-xl border-2 py-6 text-lg">
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
                  <Label className="text-base font-medium">Religion</Label>
                  <Select value={formData.religion} onValueChange={(value) => updateFormData("religion", value)}>
                    <SelectTrigger className="mt-2 rounded-xl border-2 py-6 text-lg">
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
                <Label className="text-base font-medium">Interests</Label>
                <p className="mb-3 mt-1 text-sm text-gray-500">Select all that apply</p>
                <div className="flex flex-wrap gap-3">
                  {interestOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleInterest(option)}
                      className={`rounded-full border-2 px-6 py-3 text-base font-medium transition-all ${
                        formData.interests.includes(option)
                          ? "border-[#F58DAA] bg-[#F58DAA] text-white"
                          : "border-gray-300 hover:border-[#F58DAA]"
                      }`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="dream_date" className="text-base font-medium">
                  Dream Date Description
                </Label>
                <Textarea
                  id="dream_date"
                  value={formData.dream_date}
                  onChange={(e) => updateFormData("dream_date", e.target.value)}
                  placeholder="Describe your dream date..."
                  className="mt-2 min-h-[120px] rounded-xl border-2 text-lg"
                />
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="mb-8 rounded-2xl border-2 border-gray-200 bg-white p-8">
            <h2 className="mb-6 text-2xl font-bold text-[#222222]">Match Preferences</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label className="text-base font-medium">Preferred Gender</Label>
                  <Select
                    value={formData.pref_gender}
                    onValueChange={(value) => updateFormData("pref_gender", value)}
                  >
                    <SelectTrigger className="mt-2 rounded-xl border-2 py-6 text-lg">
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
                  <Label className="text-base font-medium">Preferred Sexual Orientation</Label>
                  <Select
                    value={formData.pref_sexual_orientation}
                    onValueChange={(value) => updateFormData("pref_sexual_orientation", value)}
                  >
                    <SelectTrigger className="mt-2 rounded-xl border-2 py-6 text-lg">
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
                  <Label htmlFor="pref_age" className="text-base font-medium">
                    Preferred Age Range
                  </Label>
                  <Input
                    id="pref_age"
                    value={formData.pref_age}
                    onChange={(e) => updateFormData("pref_age", e.target.value)}
                    placeholder="e.g., 21-25 or 22"
                    className="mt-2 rounded-xl border-2 py-6 text-lg"
                  />
                  <p className="mt-1 text-sm text-gray-500">Enter an age range or specific age</p>
                </div>

                <div>
                  <Label htmlFor="pref_class_year" className="text-base font-medium">
                    Preferred Class Year
                  </Label>
                  <Input
                    id="pref_class_year"
                    value={formData.pref_class_year}
                    onChange={(e) => updateFormData("pref_class_year", e.target.value)}
                    placeholder="e.g., 2025 or 2024-2026"
                    className="mt-2 rounded-xl border-2 py-6 text-lg"
                  />
                  <p className="mt-1 text-sm text-gray-500">Enter a specific year or range</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label className="text-base font-medium">Preferred Race / Ethnicity</Label>
                  <Select value={formData.pref_race} onValueChange={(value) => updateFormData("pref_race", value)}>
                    <SelectTrigger className="mt-2 rounded-xl border-2 py-6 text-lg">
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
                  <Label className="text-base font-medium">Preferred Religion</Label>
                  <Select
                    value={formData.pref_religion}
                    onValueChange={(value) => updateFormData("pref_religion", value)}
                  >
                    <SelectTrigger className="mt-2 rounded-xl border-2 py-6 text-lg">
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
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="rounded-full bg-[#F58DAA] px-12 py-6 text-lg font-semibold text-white shadow-[0_4px_12px_rgba(245,141,170,0.3)] transition-all hover:scale-105 hover:bg-[#F9A6BD] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
