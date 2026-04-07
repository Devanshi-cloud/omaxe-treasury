import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, unauthorizedResponse } from '@/lib/auth'

// GET /api/invoices — list invoices with filtering
export async function GET(req) {
  const session = await getSession()
  if (!session) return unauthorizedResponse()

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')       // e.g. ENTERED,PROCESSING
  const deptId = searchParams.get('departmentId')
  const type   = searchParams.get('billType')
  const search = searchParams.get('search')
  const tab    = searchParams.get('tab')          // all | erp | pay

  const where = {}

  // Tab shorthand filters
  if (tab === 'erp')  where.status = { in: ['ENTERED', 'PROCESSING', 'HOLD'] }
  if (tab === 'pay')  where.status = { in: ['MOVED_TO_AP', 'PAYMENT_HOLD'] }

  // Manual filters override tab
  if (status)  where.status = { in: status.split(',') }
  if (deptId)  where.departmentId = deptId
  if (type)    where.billType = type

  // Role-based scoping: Team B only sees invoices assigned to them
  if (session.role === 'TEAM_B') where.assignedToId = session.id
  if (session.role === 'TEAM_A') where.enteredById  = session.id

  if (search) {
    where.OR = [
      { vendorName: { contains: search, mode: 'insensitive' } },
      { invoiceNumber: { contains: search, mode: 'insensitive' } },
      { billNo: { contains: search, mode: 'insensitive' } },
    ]
  }

  const invoices = await prisma.invoice.findMany({
    where,
    include: {
      department: { select: { id: true, name: true } },
      company:    { select: { id: true, name: true } },
      project:    { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true, initials: true } },
      enteredBy:  { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ invoices })
}

// POST /api/invoices — create new invoice
export async function POST(req) {
  const session = await getSession()
  if (!session) return unauthorizedResponse()
  if (!['ADMIN', 'TEAM_A'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const {
      billDate, billType, billNo, vendorName, hod, expenseNature,
      departmentId, companyId, projectId, assignedToId,
      grossAmount, tds = 0, wct = 0, advanceAdj = 0, otherDeductions = 0,
    } = body

    // Validate required fields
    if (!vendorName || !grossAmount || !billDate) {
      return NextResponse.json({ error: 'vendorName, grossAmount, and billDate are required' }, { status: 400 })
    }

    const net = Number(grossAmount) - Number(tds) - Number(wct) - Number(advanceAdj) - Number(otherDeductions)

    // Generate invoice number
    const count = await prisma.invoice.count()
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        billDate:    new Date(billDate),
        billType:    billType || 'STANDARD',
        billNo,
        vendorName,
        hod,
        expenseNature,
        grossAmount: Number(grossAmount),
        tds:         Number(tds),
        wct:         Number(wct),
        advanceAdj:  Number(advanceAdj),
        otherDeductions: Number(otherDeductions),
        netPayable:  net,
        departmentId: departmentId || undefined,
        companyId:   companyId    || undefined,
        projectId:   projectId    || undefined,
        assignedToId: assignedToId || undefined,
        enteredById: session.id,
      },
      include: {
        department: true, company: true, project: true, assignedTo: true,
      },
    })

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (error) {
    console.error('Create invoice error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
