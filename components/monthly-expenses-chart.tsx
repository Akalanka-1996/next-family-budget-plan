"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function MonthlyExpensesChart() {
  const [data, setData] = useState<Array<{ month: string; amount: number }>>([])

  const { toast } = useToast()

  useEffect(() => {
    ;(async () => {
      try {
        const famRes = await fetch('/api/families')
        if (!famRes.ok) return
        const famData = await famRes.json()
        const familyId = famData.families?.[0]?.id
        if (!familyId) return
        const r = await fetch(`/api/stats?familyId=${familyId}`)
        if (!r.ok) return
        const stats = await r.json()
        setData(stats.monthly || [])
      } catch (e) {
        toast({ title: 'Failed to load stats', description: 'Could not load monthly statistics', variant: 'destructive' })
      }
    })()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Expenses Trend</CardTitle>
        <CardDescription>Your spending pattern over 12 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="label" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'var(--color-foreground)' }}
              formatter={(value: number) => `$${value.toFixed(2)}`}
            />
            <Line type="monotone" dataKey="amount" stroke="var(--color-primary)" strokeWidth={2} dot={{ fill: 'var(--color-primary)', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
