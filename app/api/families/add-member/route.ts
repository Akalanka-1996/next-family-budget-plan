import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { z } from 'zod'

const BodySchema = z.object({
  familyId: z.string().min(1, "Family ID is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member"]).optional().default("member"),
  monthlyLimit: z.number().min(0, "Monthly limit must be 0 or greater").optional().default(0),
})

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = BodySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid member data' },
        { status: 400 }
      )
    }

    // Only allow if user is admin of the family
    const member = await prisma.familyMember.findUnique({ where: { userId_familyId: { userId: user.id, familyId: parsed.data.familyId } } })
    if (!member || member.role !== 'admin') return NextResponse.json({ error: 'You must be an admin to add members' }, { status: 403 })

    const invited = await prisma.user.findUnique({ where: { email: parsed.data.email } })
    if (!invited) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Check if user is already a member
    const existing = await prisma.familyMember.findUnique({ where: { userId_familyId: { userId: invited.id, familyId: parsed.data.familyId } } })
    if (existing) return NextResponse.json({ error: 'User is already a member of this family' }, { status: 400 })

    const fm = await prisma.familyMember.create({
      data: {
        userId: invited.id,
        familyId: parsed.data.familyId,
        role: parsed.data.role,
        monthlyLimit: parsed.data.monthlyLimit,
      },
    })

    return NextResponse.json({ member: fm })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
