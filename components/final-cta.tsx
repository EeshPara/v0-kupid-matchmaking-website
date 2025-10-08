import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-b border-border/40 bg-background py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Ready to streamline your workflow?
          </h2>
          <p className="mb-10 text-balance text-lg leading-relaxed text-muted-foreground md:text-xl">
            Join over 10,000 teams already using StreamLine to build better products faster. Start your free trial
            today—no credit card required.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-12 gap-2 bg-[#ffffff] px-8 text-base font-semibold text-[#000000] hover:bg-[#ffffff]/90"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-border px-8 text-base font-semibold hover:bg-muted bg-transparent"
            >
              Schedule a Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl"></div>
      </div>
    </section>
  )
}
