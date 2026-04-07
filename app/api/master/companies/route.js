import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, unauthorizedResponse } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return unauthorizedResponse()
  const companies = await prisma.company.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json({ companies })
}
