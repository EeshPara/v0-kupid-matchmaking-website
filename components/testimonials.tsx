import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CTO at TechFlow",
    content:
      "StreamLine transformed how our team collaborates. We've reduced deployment time by 70% and our developers are happier than ever.",
    avatar: "/professional-woman-diverse.png",
  },
  {
    name: "Marcus Rodriguez",
    role: "Product Manager at InnovateCo",
    content:
      "The analytics dashboard gives us insights we never had before. Making data-driven decisions has never been easier.",
    avatar: "/professional-man.jpg",
  },
  {
    name: "Emily Watson",
    role: "CEO at StartupHub",
    content:
      "Best investment we've made this year. The ROI was clear within the first month. Highly recommend to any growing team.",
    avatar: "/professional-woman-executive.png",
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="border-b border-border/40 bg-muted/30 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Loved by teams worldwide
          </h2>
          <p className="text-balance text-lg leading-relaxed text-muted-foreground">
            Join thousands of companies that trust StreamLine to power their workflows.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border bg-card">
              <CardContent className="p-6">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#fcc02d] text-[#fcc02d]" />
                  ))}
                </div>
                <p className="mb-6 text-balance leading-relaxed text-card-foreground">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-card-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
