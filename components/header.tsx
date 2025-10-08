"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { OnboardingModal } from "./onboarding-modal"

export function Header() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)

  return (
    <>
      <header className="w-full bg-white py-6">
        <div className="container mx-auto flex items-center justify-between px-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/design-mode/image%2019.png"
              alt="Kupid Logo"
              width={90}
              height={90}
              className="h-[90px] w-[90px]"
            />
          </Link>

          <nav className="flex items-center gap-12">
            <Link href="#home" className="text-base font-normal text-black transition-colors hover:text-[#ee81a8]">
              Home
            </Link>
            <Link href="#features" className="text-base font-normal text-black transition-colors hover:text-[#ee81a8]">
              Features
            </Link>
            <Link href="#contact" className="text-base font-normal text-black transition-colors hover:text-[#ee81a8]">
              Contact
            </Link>
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="text-base font-normal text-black transition-colors hover:text-[#ee81a8]"
            >
              Login
            </button>
          </nav>
        </div>
      </header>

      <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
    </>
  )
}
