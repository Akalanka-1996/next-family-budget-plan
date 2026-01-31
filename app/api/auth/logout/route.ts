import { NextResponse } from 'next/server'
import { serialize } from 'cookie'

export async function POST() {
  const cookie = serialize('fb_token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  })

  return NextResponse.json({ ok: true }, { status: 200, headers: { 'Set-Cookie': cookie } })
}
