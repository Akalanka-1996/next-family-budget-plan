"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface RecentExpense {
  id: string
  description: string
  amount: number
  category: string
  member: string
  date: string
  categoryColor: string
}

const recentExpenses: RecentExpense[] = [
  {
    id: "1",
    description: "Grocery Shopping",
    amount: 85.5,
    category: "Groceries",
    member: "Jane Doe",
    date: "Today",
    categoryColor: "bg-green-100 text-green-800",
  },
  {
    id: "2",
    description: "Gas Station",
    amount: 52.0,
    category: "Transport",
    member: "John Doe",
    date: "Yesterday",
    categoryColor: "bg-orange-100 text-orange-800",
  },
  {
    id: "3",
    description: "Movie Tickets",
    amount: 45.0,
    category: "Entertainment",
    member: "Tom Doe",
    date: "2 days ago",
    categoryColor: "bg-purple-100 text-purple-800",
  },
  {
    id: "4",
    description: "Restaurant Dinner",
    amount: 65.0,
    category: "Dining",
    member: "Jane Doe",
    date: "3 days ago",
    categoryColor: "bg-pink-100 text-pink-800",
  },
]

export function RecentExpenses() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
        <CardDescription>Latest transactions from your family</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentExpenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
            >
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="h-9 w-9 bg-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                    {expense.member
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{expense.description}</p>
                    <Badge className={expense.categoryColor} variant="outline">
                      {expense.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {expense.member} • {expense.date}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">${expense.amount.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
