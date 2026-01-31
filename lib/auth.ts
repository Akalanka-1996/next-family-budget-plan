import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-please'
const TOKEN_NAME = 'fb_token'

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function signToken(payload: any, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (e) {
    return null
  }
}

export function setTokenCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set({
    name: TOKEN_NAME,
    value: token,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export function clearTokenCookie() {
  const cookieStore = cookies()
  cookieStore.set({ name: TOKEN_NAME, value: '', path: '/', maxAge: 0 })
}

export function getTokenFromCookies() {
  const cookieStore = cookies()
  const c = cookieStore.get(TOKEN_NAME)
  return c?.value ?? null
}
