"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, Calendar } from "lucide-react"

function currencySymbol(currency?: string) {
  switch ((currency || "").toUpperCase()) {
    case "EUR":
      return "€"
    case "GBP":
      return "£"
    case "CAD":
      return "$"
    default:
      return "$"
  }
}

export function ExpenseOverview() {
  const [total, setTotal] = useState<number | null>(null)
  const [average, setAverage] = useState<number | null>(null)
  const [daysTracked, setDaysTracked] = useState<number | null>(null)
  const [trend, setTrend] = useState<string | null>(null)
  const [currency, setCurrency] = useState<string | undefined>("USD")

  useEffect(() => {
    ;(async () => {
      try {
        const rf = await fetch('/api/families')
        if (!rf.ok) return
        const df = await rf.json()
        const fams = df.families || []
        if (!fams[0]) return
        const fam = fams[0]
        setCurrency(fam.currency || 'USD')

        const r = await fetch(`/api/expenses?familyId=${fam.id}`)
        if (!r.ok) return
        const d = await r.json()
        const expenses = (d.expenses || []).map((e: any) => ({ ...e, date: new Date(e.date) }))

        const now = new Date()
        const monthExpenses = expenses.filter((e: any) => e.date.getMonth() === now.getMonth() && e.date.getFullYear() === now.getFullYear())
        const totalThisMonth = monthExpenses.reduce((s: number, e: any) => s + Number(e.amount), 0)

        const memberCount = (fam.members || []).length || 1
        const avg = memberCount > 0 ? totalThisMonth / memberCount : 0

        const uniqueDays = new Set(monthExpenses.map((e: any) => e.date.getDate()))

        setTotal(Math.round(totalThisMonth * 100) / 100)
        setAverage(Math.round(avg * 100) / 100)
        setDaysTracked(uniqueDays.size)

        // compute month-over-month trend using stats endpoint
        const rs = await fetch(`/api/stats?familyId=${fam.id}`)
        if (rs.ok) {
          const sd = await rs.json()
          const months = sd.monthly || []
          const labels = months.map((m: any) => m.label)
          const thisLabel = now.toLocaleString('default', { month: 'short' })
          const idx = labels.indexOf(thisLabel)
          if (idx !== -1) {
            const thisAmt = months[idx].amount || 0
            const prevAmt = idx > 0 ? months[idx - 1].amount || 0 : 0
            if (prevAmt > 0) {
              const pct = Math.round(((thisAmt - prevAmt) / prevAmt) * 100)
              setTrend((pct >= 0 ? `+${pct}%` : `${pct}%`) + ' from last month')
            }
          }
        }
      } catch (err) {
        // ignore errors silently
      }
    })()
  }, [])

  const symbol = currencySymbol(currency)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses (This Month)</CardTitle>
          <div className="text-primary">
            <TrendingUp className="w-5 h-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{total !== null ? `${symbol}${total.toFixed(2)}` : '—'}</div>
          <p className="text-xs text-muted-foreground mt-1">Current month spending</p>
          {trend && <p className="text-xs text-accent mt-2 font-medium">{trend}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Average per Member</CardTitle>
          <div className="text-primary">
            <Users className="w-5 h-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{average !== null ? `${symbol}${average.toFixed(2)}` : '—'}</div>
          <p className="text-xs text-muted-foreground mt-1">Per person this month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Days Tracked</CardTitle>
          <div className="text-primary">
            <Calendar className="w-5 h-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{daysTracked !== null ? daysTracked : '—'}</div>
          <p className="text-xs text-muted-foreground mt-1">Expenses recorded this month</p>
        </CardContent>
      </Card>
    </div>
  )
}
