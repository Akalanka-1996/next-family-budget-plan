"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function CategoryExpensesChart() {
  const [data, setData] = useState<Array<{ category: string; amount: number }>>([])

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
        setData((stats.byCategory || []).map((b: any) => ({ category: b.category, amount: b.amount })))
      } catch (e) {
        toast({ title: 'Failed to load stats', description: 'Could not load category statistics', variant: 'destructive' })
      }
    })()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
        <CardDescription>Current month spending breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="category" stroke="var(--color-muted-foreground)" />
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
            <Bar dataKey="amount" fill="var(--color-accent)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
