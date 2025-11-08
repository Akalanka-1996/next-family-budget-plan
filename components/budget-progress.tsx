"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle2, TrendingDown } from "lucide-react"

interface BudgetItem {
  name: string
  spent: number
  budget: number
  icon: React.ReactNode
}

const budgetItems: BudgetItem[] = [
  {
    name: "Monthly Budget",
    spent: 1245.5,
    budget: 5000,
    icon: <TrendingDown className="w-4 h-4" />,
  },
  {
    name: "Groceries",
    spent: 420,
    budget: 800,
    icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
  },
  {
    name: "Dining Out",
    spent: 185,
    budget: 300,
    icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
  },
  {
    name: "Entertainment",
    spent: 145,
    budget: 150,
    icon: <AlertCircle className="w-4 h-4 text-orange-600" />,
  },
]

export function BudgetProgress() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Progress</CardTitle>
        <CardDescription>Track spending against your budgets</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {budgetItems.map((item, index) => {
          const percentage = (item.spent / item.budget) * 100
          const isWarning = percentage > 80
          const isOver = percentage > 100

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                <span className="text-sm font-semibold">
                  ${item.spent.toFixed(2)} / ${item.budget.toFixed(2)}
                </span>
              </div>
              <Progress value={Math.min(percentage, 100)} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {isOver
                  ? `Over budget by $${(item.spent - item.budget).toFixed(2)}`
                  : `${(percentage).toFixed(0)}% of budget used`}
              </p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
