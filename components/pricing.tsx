import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Starter",
    price: "29",
    description: "Perfect for small teams getting started",
    features: ["Up to 5 team members", "10 GB storage", "Basic analytics", "Email support", "Core integrations"],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: "99",
    description: "For growing teams that need more power",
    features: [
      "Up to 25 team members",
      "100 GB storage",
      "Advanced analytics",
      "Priority support",
      "All integrations",
      "Custom workflows",
      "API access",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations with specific needs",
    features: [
      "Unlimited team members",
      "Unlimited storage",
      "Enterprise analytics",
      "Dedicated support",
      "Custom integrations",
      "Advanced security",
      "SLA guarantee",
      "Training & onboarding",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="border-b border-border/40 bg-background py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="text-balance text-lg leading-relaxed text-muted-foreground">
            Choose the plan that's right for your team. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative border-border bg-card ${
                plan.popular ? "border-2 border-primary shadow-lg shadow-primary/10" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="p-6 pb-4">
                <h3 className="text-2xl font-bold text-card-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  {plan.price !== "Custom" && (
                    <span className="text-4xl font-bold text-card-foreground">${plan.price}</span>
                  )}
                  {plan.price === "Custom" && (
                    <span className="text-4xl font-bold text-card-foreground">{plan.price}</span>
                  )}
                  {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm text-card-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
