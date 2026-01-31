import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { z } from 'zod'

const BodySchema = z.object({
  description: z.string(),
  amount: z.number(),
  category: z.string(),
  date: z.string().optional(),
  familyId: z.string(),
})

function round2(n: number) {
  return Math.round(n * 100) / 100
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = BodySchema.parse(body)

    const fm = await prisma.familyMember.findUnique({ where: { userId_familyId: { userId: user.id, familyId: parsed.familyId } } })
    if (!fm) return NextResponse.json({ error: 'Not a family member' }, { status: 403 })

    const amt = round2(parsed.amount)

    const expense = await prisma.expense.create({
      data: {
        description: parsed.description,
        amount: amt,
        category: parsed.category,
        date: parsed.date ? new Date(parsed.date) : undefined,
        userId: user.id,
        familyId: parsed.familyId,
        familyMemberId: fm.id,
      },
    })

    return NextResponse.json({ expense })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const familyId = url.searchParams.get('familyId')
  if (!familyId) return NextResponse.json({ error: 'familyId required' }, { status: 400 })

  const expenses = await prisma.expense.findMany({ where: { familyId }, orderBy: { date: 'desc' } })
  // round amounts
  const mapped = expenses.map((e) => ({ ...e, amount: Math.round(e.amount * 100) / 100 }))
  return NextResponse.json({ expenses: mapped })
}
