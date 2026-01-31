"use client"

import { useEffect, useState } from "react"
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

const categoryColors: Record<string, string> = {
  groceries: "bg-green-100 text-green-800",
  transport: "bg-orange-100 text-orange-800",
  entertainment: "bg-purple-100 text-purple-800",
  dining: "bg-pink-100 text-pink-800",
  utilities: "bg-blue-100 text-blue-800",
  health: "bg-red-100 text-red-800",
  shopping: "bg-yellow-100 text-yellow-800",
  other: "bg-gray-100 text-gray-800",
}

export function RecentExpenses() {
  const [recent, setRecent] = useState<RecentExpense[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch('/api/families')
        if (!r.ok) return
        const d = await r.json()
        const fams = d.families || []
        if (!fams[0]) return
        const fam = fams[0]
        const memberMap: Record<string, string> = {}
        ;(fam.members || []).forEach((m: any) => {
          memberMap[m.id] = (m.user && (m.user.name || m.user.email)) || 'Member'
        })

        const re = await fetch(`/api/expenses?familyId=${fam.id}`)
        if (!re.ok) return
        const ed = await re.json()
        const mapped = (ed.expenses || []).slice(0, 5).map((e: any) => ({
          id: e.id,
          description: e.description,
          amount: Number(e.amount),
          category: e.category.charAt(0).toUpperCase() + e.category.slice(1),
          member: memberMap[e.familyMemberId] || e.familyMemberId,
          date: new Date(e.date).toLocaleDateString(),
          categoryColor: categoryColors[e.category] || 'bg-gray-100 text-gray-800',
        }))
        setRecent(mapped)
      } catch (err) {
        // ignore
      }
    })()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
        <CardDescription>Latest transactions from your family</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recent.map((expense) => (
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
          {recent.length === 0 && <p className="text-sm text-muted-foreground">No recent expenses</p>}
        </div>
      </CardContent>
    </Card>
  )
}
