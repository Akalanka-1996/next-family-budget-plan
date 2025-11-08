"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function LandingHero() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 leading-tight">
          Manage Your Family Budget Together
        </h1>
        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
          Track expenses, share budgets, and achieve your financial goals as a family. Simple, transparent, and built
          for everyone.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Start Free Today
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Already have an account?
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
