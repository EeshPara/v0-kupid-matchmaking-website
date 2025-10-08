import Link from "next/link"
import { Zap, Twitter, Github, Linkedin, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">StreamLine</span>
            </Link>
            <p className="mb-6 max-w-sm text-balance text-sm leading-relaxed text-muted-foreground">
              The complete platform for modern teams. Streamline your workflow and ship faster with powerful
              collaboration tools.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Youtube className="h-4 w-4" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Product</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  Changelog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  Customers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  Community
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                  Status
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row">
          <p>© 2025 StreamLine. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
