import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, unauthorizedResponse } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return unauthorizedResponse()
  const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json({ departments })
}

export async function POST(req) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return unauthorizedResponse()
  const { name } = await req.json()
  const dept = await prisma.department.create({ data: { name } })
  return NextResponse.json({ department: dept }, { status: 201 })
}
