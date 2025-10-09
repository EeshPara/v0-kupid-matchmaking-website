import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { AuthRedirectHandler } from "@/components/auth-redirect-handler"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <AuthRedirectHandler />
      <Header />
      <main>
        <Hero />
        <Features />
      </main>
    </div>
  )
}
