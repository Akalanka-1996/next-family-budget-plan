"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, TrendingUp, Users, BarChart3 } from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Family Management",
    description: "Add family members and manage accounts for everyone in one place.",
  },
  {
    icon: TrendingUp,
    title: "Track Expenses",
    description: "Log expenses easily with categories and real-time tracking.",
  },
  {
    icon: BarChart3,
    title: "Visual Analytics",
    description: "See spending patterns with beautiful charts and detailed reports.",
  },
  {
    icon: PieChart,
    title: "Budget Insights",
    description: "Understand where your money goes by member and category.",
  },
]

export function LandingFeatures() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
          <p className="text-lg text-muted-foreground">Everything you need to manage your family finances</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <feature.icon className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
