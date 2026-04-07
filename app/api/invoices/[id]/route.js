import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, unauthorizedResponse } from '@/lib/auth'

// GET /api/invoices/[id]
export async function GET(req, { params }) {
  const session = await getSession()
  if (!session) return unauthorizedResponse()

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      department: true, company: true, project: true,
      assignedTo: { select: { id: true, name: true, initials: true } },
      enteredBy:  { select: { id: true, name: true } },
    },
  })
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ invoice })
}

// PATCH /api/invoices/[id] — update status, assignee, hold reason, etc.
export async function PATCH(req, { params }) {
  const session = await getSession()
  if (!session) return unauthorizedResponse()

  try {
    const body = await req.json()
    const { status, holdReason, assignedToId, erpPostedAt, paymentDoneAt } = body

    // Role checks: only Team B can move to AP, only Team C can mark paid
    if (status === 'MOVED_TO_AP' && !['ADMIN', 'TEAM_B'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (status === 'PAID' && !['ADMIN', 'TEAM_C'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updateData = {}
    if (status)       updateData.status = status
    if (holdReason !== undefined) updateData.holdReason = holdReason
    if (assignedToId) updateData.assignedToId = assignedToId
    if (status === 'MOVED_TO_AP') updateData.erpPostedAt = new Date()
    if (status === 'PAID')        updateData.paymentDoneAt = new Date()
    if (erpPostedAt)  updateData.erpPostedAt = new Date(erpPostedAt)
    if (paymentDoneAt) updateData.paymentDoneAt = new Date(paymentDoneAt)

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: updateData,
      include: {
        department: true, company: true, project: true,
        assignedTo: { select: { id: true, name: true, initials: true } },
      },
    })
    return NextResponse.json({ invoice })
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    console.error('Update invoice error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/invoices/[id] — admin only
export async function DELETE(req, { params }) {
  const session = await getSession()
  if (!session) return unauthorizedResponse()
  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  await prisma.invoice.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
