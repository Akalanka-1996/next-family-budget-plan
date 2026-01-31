"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle2, TrendingDown } from "lucide-react"

export function BudgetProgress() {
  const [items, setItems] = useState<BudgetItem[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const rf = await fetch('/api/families')
        if (!rf.ok) return
        const df = await rf.json()
        const fams = df.families || []
        if (!fams[0]) return
        const fam = fams[0]

        const rs = await fetch(`/api/stats?familyId=${fam.id}`)
        if (!rs.ok) return
        const sd = await rs.json()

        const totalExpenses = sd.totalExpenses || 0

        const topCategories = (sd.byCategory || []).slice(0, 3)

        const mapped: BudgetItem[] = [
          { name: 'Monthly Budget', spent: Number(totalExpenses), budget: Number(fam.monthlyBudget || 0), icon: <TrendingDown className="w-4 h-4" /> },
          ...topCategories.map((c: any, i: number) => ({ name: c.category, spent: Number(c.amount || 0), icon: i === 0 ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-orange-600" /> })),
        ]

        setItems(mapped)
      } catch (e) {
        // ignore
      }
    })()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Progress</CardTitle>
        <CardDescription>Track spending against your budgets</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {items.map((item, index) => {
          const percentage = item.budget && item.budget > 0 ? (item.spent / item.budget) * 100 : 0
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
                  ${item.spent.toFixed(2)}{item.budget ? ` / $${item.budget.toFixed(2)}` : ''}
                </span>
              </div>
              {item.budget ? <Progress value={Math.min(percentage, 100)} className="h-2" /> : <div className="h-2" />}
              <p className="text-xs text-muted-foreground">
                {item.budget
                  ? isOver
                    ? `Over budget by $${(item.spent - (item.budget || 0)).toFixed(2)}`
                    : `${(percentage).toFixed(0)}% of budget used`
                  : 'No budget set'}
              </p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
