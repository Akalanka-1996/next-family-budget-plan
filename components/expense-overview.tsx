"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, Calendar } from "lucide-react"

interface OverviewCard {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  trend?: string
}

const overviewCards: OverviewCard[] = [
  {
    title: "Total Expenses (Nov)",
    value: "$1,245.50",
    description: "Current month spending",
    icon: <TrendingUp className="w-5 h-5" />,
    trend: "+12% from last month",
  },
  {
    title: "Average per Member",
    value: "$311.38",
    description: "Per person this month",
    icon: <Users className="w-5 h-5" />,
  },
  {
    title: "Days Tracked",
    value: "23",
    description: "Expenses recorded this month",
    icon: <Calendar className="w-5 h-5" />,
  },
]

export function ExpenseOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {overviewCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <div className="text-primary">{card.icon}</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            {card.trend && <p className="text-xs text-accent mt-2 font-medium">{card.trend}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
