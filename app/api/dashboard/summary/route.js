import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, unauthorizedResponse } from '@/lib/auth'

// GET /api/dashboard/summary?period=MTD|YTD|LTD
export async function GET(req) {
  const session = await getSession()
  if (!session) return unauthorizedResponse()

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') || 'MTD'

  const now = new Date()
  let since = null
  if (period === 'MTD') {
    since = new Date(now.getFullYear(), now.getMonth(), 1)
  } else if (period === 'YTD') {
    since = now.getMonth() >= 3
      ? new Date(now.getFullYear(), 3, 1)
      : new Date(now.getFullYear() - 1, 3, 1)
  }
  const dateFilter = since ? { entryDate: { gte: since } } : {}

  const [
    totalReceived,
    totalERPPosted,
    totalPaid,
    erpPending,
    paymentPending,
    holdMTD,
    holdYTD,
    holdLTD,
    topDepartments,
    agingERPRows,
    agingPaymentRows,
    empPostings,
    paidAmountAgg,
    monthlyFlow,
  ] = await Promise.all([
    prisma.invoice.count({ where: { ...dateFilter } }),
    prisma.invoice.count({ where: { ...dateFilter, status: { in: ['MOVED_TO_AP', 'PAYMENT_HOLD', 'PAID'] } } }),
    prisma.invoice.count({ where: { ...dateFilter, status: 'PAID' } }),
    prisma.invoice.count({ where: { status: { in: ['ENTERED', 'PROCESSING'] } } }),
    prisma.invoice.count({ where: { status: { in: ['MOVED_TO_AP', 'PAYMENT_HOLD'] } } }),
    prisma.invoice.count({ where: { status: 'HOLD', entryDate: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } } }),
    prisma.invoice.count({ where: { status: 'HOLD', entryDate: { gte: now.getMonth() >= 3 ? new Date(now.getFullYear(), 3, 1) : new Date(now.getFullYear() - 1, 3, 1) } } }),
    prisma.invoice.count({ where: { status: 'HOLD' } }),
    prisma.invoice.groupBy({ by: ['departmentId'], where: { ...dateFilter, departmentId: { not: null } }, _sum: { grossAmount: true }, orderBy: { _sum: { grossAmount: 'desc' } }, take: 5 }),
    prisma.invoice.findMany({ where: { status: { in: ['ENTERED', 'PROCESSING'] } }, select: { entryDate: true } }),
    prisma.invoice.findMany({ where: { status: { in: ['MOVED_TO_AP', 'PAYMENT_HOLD'] } }, select: { erpPostedAt: true, entryDate: true } }),
    prisma.invoice.groupBy({ by: ['assignedToId'], where: { assignedToId: { not: null } }, _count: { id: true } }),
    prisma.invoice.aggregate({ where: { ...dateFilter, status: 'PAID' }, _sum: { netPayable: true } }),
    prisma.$queryRaw`
      SELECT DATE_TRUNC('month', "entryDate") AS month,
             COUNT(*) AS received,
             COUNT(*) FILTER (WHERE "erpPostedAt" IS NOT NULL) AS erp_posted,
             COUNT(*) FILTER (WHERE status = 'PAID') AS paid
      FROM "Invoice"
      WHERE "entryDate" >= NOW() - INTERVAL '12 months'
      GROUP BY 1 ORDER BY 1
    `,
  ])

  const deptIds = topDepartments.map(d => d.departmentId).filter(Boolean)
  const depts = deptIds.length ? await prisma.department.findMany({ where: { id: { in: deptIds } } }) : []
  const deptMap = Object.fromEntries(depts.map(d => [d.id, d.name]))

  function agingBuckets(rows, field) {
    const b = { '0-7': 0, '8-15': 0, '16-30': 0, '31-60': 0, '>60': 0 }
    rows.forEach(inv => {
      const ref = inv[field] || inv.entryDate
      const days = Math.floor((now - new Date(ref)) / 86400000)
      if (days <= 7) b['0-7']++
      else if (days <= 15) b['8-15']++
      else if (days <= 30) b['16-30']++
      else if (days <= 60) b['31-60']++
      else b['>60']++
    })
    return b
  }

  const teamBIds = empPostings.map(e => e.assignedToId).filter(Boolean)
  const teamBUsers = teamBIds.length ? await prisma.user.findMany({ where: { id: { in: teamBIds }, role: 'TEAM_B' }, select: { id: true, name: true, initials: true } }) : []
  const userMap = Object.fromEntries(teamBUsers.map(u => [u.id, u]))
  const pendingPerUser = await prisma.invoice.groupBy({ by: ['assignedToId'], where: { assignedToId: { in: teamBIds }, status: { in: ['ENTERED', 'PROCESSING'] } }, _count: { id: true } })
  const pendingMap = Object.fromEntries(pendingPerUser.map(e => [e.assignedToId, e._count.id]))

  return NextResponse.json({
    period,
    pipeline: { received: totalReceived, inProcessing: erpPending, movedToAP: totalERPPosted, paymentQueue: paymentPending, paid: totalPaid },
    kpi: { received: totalReceived, erpPosted: totalERPPosted, paid: totalPaid, paidAmount: Number(paidAmountAgg._sum.netPayable ?? 0) },
    pending: { erpCount: erpPending, paymentCount: paymentPending, holdMTD, holdYTD, holdLTD },
    topDepartments: topDepartments.map(d => ({ id: d.departmentId, name: deptMap[d.departmentId] || 'Unknown', amount: Number(d._sum.grossAmount ?? 0) })),
    agingERP:       agingBuckets(agingERPRows, 'entryDate'),
    agingPayment:   agingBuckets(agingPaymentRows, 'erpPostedAt'),
    employeePostings: empPostings.filter(e => userMap[e.assignedToId]).map(e => ({ user: userMap[e.assignedToId], posted: e._count.id, pending: pendingMap[e.assignedToId] || 0 })),
    monthlyFlow: monthlyFlow.map(r => ({ month: r.month, received: Number(r.received), erpPosted: Number(r.erp_posted), paid: Number(r.paid) })),
  })
}
