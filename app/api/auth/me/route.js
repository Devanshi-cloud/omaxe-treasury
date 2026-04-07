import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, unauthorizedResponse } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return unauthorizedResponse()

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, username: true, role: true, designation: true, initials: true },
  })
  if (!user) return unauthorizedResponse()
  return NextResponse.json({ user })
}
