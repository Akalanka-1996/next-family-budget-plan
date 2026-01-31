import jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-please'

export async function getCurrentUser() {
  const cookieStore = cookies()
  const token = cookieStore.get('fb_token')?.value
  if (!token) return null

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    return user
  } catch (e) {
    return null
  }
}
