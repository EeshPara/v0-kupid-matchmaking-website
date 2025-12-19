"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

export function Header() {
  const router = useRouter()

  return (
    <header className="w-full bg-white py-6">
      <div className="container mx-auto flex items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/design-mode/image-19.png"
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
            onClick={() => router.push("/onboarding")}
            className="rounded-full bg-[#F58DAA] px-8 py-3 text-base font-semibold text-white shadow-[0_4px_12px_rgba(245,141,170,0.3)] transition-all hover:scale-105 hover:bg-[#F9A6BD]"
          >
            Join
          </button>
        </nav>
      </div>
    </header>
  )
}
