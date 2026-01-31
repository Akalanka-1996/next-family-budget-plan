import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { z } from 'zod'

const BodySchema = z.object({
  familyId: z.string(),
  email: z.string().email(),
  role: z.string().optional(),
  monthlyLimit: z.number().optional(),
})

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = BodySchema.parse(body)

    // Only allow if user is admin of the family
    const member = await prisma.familyMember.findUnique({ where: { userId_familyId: { userId: user.id, familyId: parsed.familyId } } })
    if (!member || member.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const invited = await prisma.user.findUnique({ where: { email: parsed.email } })
    if (!invited) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const fm = await prisma.familyMember.create({
      data: {
        userId: invited.id,
        familyId: parsed.familyId,
        role: parsed.role ?? 'member',
        monthlyLimit: parsed.monthlyLimit ?? 0,
      },
    })

    return NextResponse.json({ member: fm })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
