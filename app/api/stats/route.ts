import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const familyId = url.searchParams.get('familyId')
  if (!familyId) return NextResponse.json({ error: 'familyId required' }, { status: 400 })

  // verify user is member
  const fm = await prisma.familyMember.findUnique({ where: { userId_familyId: { userId: user.id, familyId } } })
  if (!fm) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const totalExpenses = await prisma.expense.aggregate({ where: { familyId }, _sum: { amount: true } })
  const totalIncomes = await prisma.income.aggregate({ where: { familyId }, _sum: { amount: true } })

  const byCategory = await prisma.expense.groupBy({ by: ['category'], where: { familyId }, _sum: { amount: true } })

  const byMember = await prisma.expense.groupBy({ by: ['familyMemberId'], where: { familyId }, _sum: { amount: true } })

  // monthly totals for last 12 months
  const expensesList = await prisma.expense.findMany({ where: { familyId }, orderBy: { date: 'asc' } })
  const now = new Date()
  const months: { label: string; amount: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const month = d.getMonth()
    const year = d.getFullYear()
    const label = d.toLocaleString('default', { month: 'short' })
    const sum = expensesList
      .filter((e) => {
        const ed = new Date(e.date)
        return ed.getMonth() === month && ed.getFullYear() === year
      })
      .reduce((s, e) => s + e.amount, 0)
    months.push({ label, amount: Math.round(sum * 100) / 100 })
  }

  // map results and round
  const round = (n?: number) => (n ? Math.round(n * 100) / 100 : 0)

  const payload = {
    totalExpenses: round(totalExpenses._sum.amount),
    totalIncomes: round(totalIncomes._sum.amount),
    byCategory: byCategory.map((b) => ({ category: b.category, amount: round(b._sum.amount) })),
    byMember: await Promise.all(
      byMember.map(async (b) => {
        const member = await prisma.familyMember.findUnique({ where: { id: b.familyMemberId } })
        const user = member ? await prisma.user.findUnique({ where: { id: member.userId } }) : null
        return { memberId: b.familyMemberId, name: user?.name ?? null, amount: round(b._sum.amount) }
      })
    ),
    monthly: months,
  }

  return NextResponse.json(payload)
}
