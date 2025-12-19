"use client"

import { useEffect, useState } from "react"
import { Heart, CheckCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function CompletePage() {
  const router = useRouter()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Animate content in
    setTimeout(() => setShowContent(true), 100)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FFF5F8] to-white flex items-center justify-center p-4">
      <div
        className={`w-full max-w-2xl transition-all duration-700 ${
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Floating hearts decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Heart
            className="absolute left-[10%] top-[15%] h-8 w-8 animate-bounce text-[#F9A6BD] opacity-40"
            fill="#F9A6BD"
            style={{ animationDelay: "0s", animationDuration: "3s" }}
          />
          <Heart
            className="absolute right-[15%] top-[25%] h-6 w-6 animate-bounce text-[#F58DAA] opacity-30"
            fill="#F58DAA"
            style={{ animationDelay: "0.5s", animationDuration: "2.5s" }}
          />
          <Heart
            className="absolute left-[20%] bottom-[20%] h-7 w-7 animate-bounce text-[#ee81a8] opacity-35"
            fill="#ee81a8"
            style={{ animationDelay: "1s", animationDuration: "2.8s" }}
          />
          <Heart
            className="absolute right-[10%] bottom-[30%] h-5 w-5 animate-bounce text-[#F9A6BD] opacity-25"
            fill="#F9A6BD"
            style={{ animationDelay: "0.3s", animationDuration: "3.2s" }}
          />
        </div>

        {/* Main card */}
        <div className="relative bg-white rounded-3xl shadow-2xl p-12 text-center">
          {/* Success icon with animated ring */}
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 animate-ping rounded-full bg-[#F58DAA] opacity-20" />
            <div className="relative flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-[#F58DAA] to-[#F9A6BD]">
              <CheckCircle className="h-16 w-16 text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Main heading */}
          <div className="space-y-4 mb-8">
            <h1 className="text-4xl font-bold text-[#222222] flex items-center justify-center gap-3">
              <Sparkles className="h-8 w-8 text-[#F58DAA]" />
              You're All Set!
              <Sparkles className="h-8 w-8 text-[#F58DAA]" />
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Thank you for completing your Kupid profile!
            </p>
          </div>

          {/* Info box */}
          <div className="bg-gradient-to-br from-[#F58DAA]/10 to-[#F9A6BD]/10 rounded-2xl p-8 mb-8">
            <Heart className="h-12 w-12 text-[#F58DAA] mx-auto mb-4 animate-pulse" fill="#F58DAA" />
            <h2 className="text-2xl font-semibold text-[#222222] mb-4">What happens next?</h2>
            <div className="text-left space-y-3 max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <div className="min-w-[24px] h-6 w-6 rounded-full bg-[#F58DAA] flex items-center justify-center text-white text-sm font-bold mt-0.5">
                  1
                </div>
                <p className="text-gray-700">
                  Our AI cupid is finding your perfect match based on your preferences
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="min-w-[24px] h-6 w-6 rounded-full bg-[#F58DAA] flex items-center justify-center text-white text-sm font-bold mt-0.5">
                  2
                </div>
                <p className="text-gray-700">
                  We'll notify you via email when your match is ready
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="min-w-[24px] h-6 w-6 rounded-full bg-[#F58DAA] flex items-center justify-center text-white text-sm font-bold mt-0.5">
                  3
                </div>
                <p className="text-gray-700">Check your inbox for your dream date opportunity!</p>
              </div>
            </div>
          </div>

          {/* Action button */}
          <Button
            onClick={() => router.push("/")}
            className="rounded-full bg-[#F58DAA] px-10 py-6 text-lg font-semibold text-white hover:bg-[#F9A6BD] transition-all hover:scale-105 shadow-lg"
          >
            Back to Home
          </Button>

          {/* Footer note */}
          <p className="mt-8 text-sm text-gray-500">
            Matching usually takes 24-48 hours. Keep an eye on your email!
          </p>
        </div>

        {/* Additional hearts at bottom */}
        <div className="flex justify-center gap-3 mt-8">
          <Heart className="h-4 w-4 text-[#F58DAA] animate-pulse" fill="#F58DAA" />
          <Heart className="h-5 w-5 text-[#F9A6BD] animate-pulse" fill="#F9A6BD" style={{ animationDelay: "0.2s" }} />
          <Heart className="h-4 w-4 text-[#ee81a8] animate-pulse" fill="#ee81a8" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>
    </div>
  )
}
