"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { OnboardingModal } from "./onboarding-modal"

export function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleJoinClick = () => {
    setIsModalOpen(true)
  }

  return (
    <>
      <section className="relative overflow-hidden bg-white py-2 lg:py-4">
        <div className="container mx-auto px-6">
          <div className="grid items-center gap-12 lg:grid-cols-[40%_60%]">
            {/* Left side - Text content */}
            <div className="flex flex-col">
              <p className="text-lg font-medium leading-relaxed text-[#555555]">Find your love on</p>

              <h1 className="mt-2 text-[62px] font-bold leading-[1.1] text-[#222222]">
                Your Dream
                <br />
                <span className="whitespace-nowrap">Date Come True</span>
              </h1>

              <p className="mt-4 max-w-[520px] text-[21px] font-normal leading-relaxed text-[#666666]">
                Kupid matchmaker lets anyone find their perfect date without the hassle
              </p>

              <Button
                onClick={handleJoinClick}
                className="mt-6 h-auto w-fit rounded-full bg-[#F58DAA] px-12 py-4.5 text-[22px] font-semibold text-white shadow-[0_4px_12px_rgba(245,141,170,0.3)] transition-all hover:scale-105 hover:bg-[#F9A6BD]"
              >
                Join Kupid Matchmaker
              </Button>
            </div>

            {/* Right side - Polaroid photos */}
            <div className="relative h-[650px]">
              <Image
                src="/images/design-mode/image%2020.png"
                alt=""
                width={210}
                height={105}
                className="absolute left-[-190px] top-[480px] z-40 h-[168px] w-[336px] rotate-[12deg] drop-shadow-[0_4px_4px_rgba(0,0,0,0.1)]"
              />

              <div className="absolute left-0 top-4 z-30 w-[350px] -translate-y-2 rotate-[-5deg] transform rounded-[24px] bg-[#ee81a8] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.15)]">
                <div className="overflow-hidden rounded-2xl bg-white p-3">
                  <Image
                    src="/images/design-mode/image%2026.png"
                    alt="Friends socializing at Kupid event"
                    width={350}
                    height={350}
                    className="h-[320px] w-full rounded-xl object-cover"
                  />
                </div>
                <p className="mt-4 text-center text-xl font-medium text-white">Find your love</p>
              </div>

              <div className="absolute left-[180px] top-24 z-20 w-[350px] rotate-[5deg] transform rounded-[24px] bg-[#f8a5c2] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.15)]">
                <div className="overflow-hidden rounded-2xl bg-white p-3">
                  <Image
                    src="/images/design-mode/image%2025.png"
                    alt="People meeting at event"
                    width={350}
                    height={350}
                    className="h-[320px] w-full rounded-xl object-cover"
                  />
                </div>
                <p className="mt-4 text-center text-xl font-medium text-white">Meet People</p>
              </div>

              <div className="absolute left-[340px] top-52 z-10 w-[350px] rotate-[10deg] transform rounded-[24px] bg-[#fcc02d] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.15)]">
                <div className="overflow-hidden rounded-2xl bg-white p-3">
                  <Image
                    src="/images/design-mode/image%2028.png"
                    alt="Happy person celebrating"
                    width={350}
                    height={350}
                    className="h-[320px] w-full rounded-xl object-cover"
                  />
                </div>
                <p className="mt-4 text-center text-xl font-medium text-white">Hassle Free</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <OnboardingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
