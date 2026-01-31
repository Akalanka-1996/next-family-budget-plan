"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

const COLORS = ['var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-3)']

export function MemberExpensesChart() {
  const [data, setData] = useState<Array<{ name: string; value: number }>>([])

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
        setData((stats.byMember || []).map((b: any) => ({ name: b.name || b.memberId, value: b.amount })))
      } catch (e) {
        toast({ title: 'Failed to load stats', description: 'Could not load member statistics', variant: 'destructive' })
      }
    })()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by Member</CardTitle>
        <CardDescription>Current month breakdown by family member</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: $${value.toFixed(2)}`} outerRadius={100} fill="#8884d8" dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'var(--color-foreground)' }}
              formatter={(value: number) => `$${value.toFixed(2)}`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
