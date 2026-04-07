import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getSession, unauthorizedResponse } from '@/lib/auth'

// GET /api/admin/users
export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return unauthorizedResponse()

  const users = await prisma.user.findMany({
    select: { id: true, name: true, username: true, role: true, designation: true, initials: true, createdAt: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json({ users })
}

// POST /api/admin/users — create user
export async function POST(req) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return unauthorizedResponse()

  try {
    const { name, username, password, role, designation } = await req.json()
    if (!name || !username || !password || !role) {
      return NextResponse.json({ error: 'name, username, password and role are required' }, { status: 400 })
    }
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, username, password: hashed, role, designation, initials },
      select: { id: true, name: true, username: true, role: true, designation: true, initials: true },
    })
    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 })
    }
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
