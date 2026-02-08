import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { z } from 'zod'

const BodySchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  source: z.string().min(1, "Income source is required"),
  date: z.string().optional(),
  familyId: z.string().min(1, "Family ID is required"),
})

function round2(n: number) {
  return Math.round(n * 100) / 100
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = BodySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid income data' },
        { status: 400 }
      )
    }

    const fm = await prisma.familyMember.findUnique({ where: { userId_familyId: { userId: user.id, familyId: parsed.data.familyId } } })
    if (!fm) return NextResponse.json({ error: 'Not a family member' }, { status: 403 })

    const amt = round2(parsed.data.amount)

    const income = await prisma.income.create({
      data: {
        description: parsed.data.description,
        amount: amt,
        source: parsed.data.source,
        date: parsed.data.date ? new Date(parsed.data.date) : undefined,
        userId: user.id,
        familyId: parsed.data.familyId,
        familyMemberId: fm.id,
      },
    })

    return NextResponse.json({ income })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const familyId = url.searchParams.get('familyId')
  if (!familyId) return NextResponse.json({ error: 'familyId required' }, { status: 400 })

  const incomes = await prisma.income.findMany({ where: { familyId }, orderBy: { date: 'desc' } })
  const mapped = incomes.map((e) => ({ ...e, amount: Math.round(e.amount * 100) / 100 }))
  return NextResponse.json({ incomes: mapped })
}
