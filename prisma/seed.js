import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'


const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Departments
  const depts = await Promise.all([
    prisma.department.upsert({ where: { name: 'Marketing' }, update: {}, create: { name: 'Marketing' } }),
    prisma.department.upsert({ where: { name: 'Construction' }, update: {}, create: { name: 'Construction' } }),
    prisma.department.upsert({ where: { name: 'IT & Technology' }, update: {}, create: { name: 'IT & Technology' } }),
    prisma.department.upsert({ where: { name: 'Admin & Facilities' }, update: {}, create: { name: 'Admin & Facilities' } }),
    prisma.department.upsert({ where: { name: 'Legal' }, update: {}, create: { name: 'Legal' } }),
    prisma.department.upsert({ where: { name: 'Finance' }, update: {}, create: { name: 'Finance' } }),
  ])

  // Companies
  const companies = await Promise.all([
    prisma.company.upsert({ where: { name: 'Omaxe Limited' }, update: {}, create: { name: 'Omaxe Limited' } }),
    prisma.company.upsert({ where: { name: 'Ludhiana Wholesale Market Pvt Ltd' }, update: {}, create: { name: 'Ludhiana Wholesale Market Pvt Ltd' } }),
    prisma.company.upsert({ where: { name: 'Bhanu Infrabuild Pvt Ltd' }, update: {}, create: { name: 'Bhanu Infrabuild Pvt Ltd' } }),
    prisma.company.upsert({ where: { name: 'Omaxe City Bareilly' }, update: {}, create: { name: 'Omaxe City Bareilly' } }),
  ])

  // Projects
  const projects = await Promise.all([
    prisma.project.upsert({ where: { name: 'Omaxe Chowk — Ludhiana' }, update: {}, create: { name: 'Omaxe Chowk — Ludhiana' } }),
    prisma.project.upsert({ where: { name: 'Omaxe City — Bareilly' }, update: {}, create: { name: 'Omaxe City — Bareilly' } }),
    prisma.project.upsert({ where: { name: 'New Chandigarh' }, update: {}, create: { name: 'New Chandigarh' } }),
    prisma.project.upsert({ where: { name: 'Omaxe State — Dwarka' }, update: {}, create: { name: 'Omaxe State — Dwarka' } }),
    prisma.project.upsert({ where: { name: 'Corporate Office' }, update: {}, create: { name: 'Corporate Office' } }),
  ])

  const deptMap = Object.fromEntries(depts.map(d => [d.name, d.id]))
  const coMap = Object.fromEntries(companies.map(c => [c.name, c.id]))
  const projMap = Object.fromEntries(projects.map(p => [p.name, p.id]))

  // Users
  const hash = async (pw) => bcrypt.hash(pw, 10)

  const users = await Promise.all([
    prisma.user.upsert({
      where: { username: 'sanket.mhapankar' }, update: {},
      create: { name: 'Sanket Mhapankar', username: 'sanket.mhapankar', password: await hash('password'), role: 'ADMIN', designation: 'VP Treasury', initials: 'SM' },
    }),
    prisma.user.upsert({
      where: { username: 'naveen.garg' }, update: {},
      create: { name: 'Naveen Garg', username: 'naveen.garg', password: await hash('password'), role: 'TEAM_C', designation: 'AGM Treasury', initials: 'NG' },
    }),
    prisma.user.upsert({
      where: { username: 'daleep.kumar' }, update: {},
      create: { name: 'Daleep Kumar', username: 'daleep.kumar', password: await hash('password'), role: 'TEAM_B', designation: 'Sr. Accounts Exec', initials: 'DK' },
    }),
    prisma.user.upsert({
      where: { username: 'sandeep.gupta' }, update: {},
      create: { name: 'Sandeep Gupta', username: 'sandeep.gupta', password: await hash('password'), role: 'TEAM_B', designation: 'Accounts Exec', initials: 'SG' },
    }),
    prisma.user.upsert({
      where: { username: 'karishma.dhingra' }, update: {},
      create: { name: 'Karishma Dhingra', username: 'karishma.dhingra', password: await hash('password'), role: 'TEAM_B', designation: 'Accounts Exec', initials: 'KD' },
    }),
    prisma.user.upsert({
      where: { username: 'kiran.kumari' }, update: {},
      create: { name: 'Kiran Kumari', username: 'kiran.kumari', password: await hash('password'), role: 'TEAM_B', designation: 'Jr. Accounts Exec', initials: 'KK' },
    }),
    prisma.user.upsert({
      where: { username: 'mahesh.kumar' }, update: {},
      create: { name: 'Mahesh Kumar', username: 'mahesh.kumar', password: await hash('password'), role: 'TEAM_B', designation: 'Jr. Accounts Exec', initials: 'MK' },
    }),
    prisma.user.upsert({
      where: { username: 'raghuvar.rawat' }, update: {},
      create: { name: 'Raghuvar Rawat', username: 'raghuvar.rawat', password: await hash('password'), role: 'TEAM_B', designation: 'Jr. Accounts Exec', initials: 'RR' },
    }),
    prisma.user.upsert({
      where: { username: 'nimit.jain' }, update: {},
      create: { name: 'Nimit Jain', username: 'nimit.jain', password: await hash('password'), role: 'TEAM_B', designation: 'Accounts Exec', initials: 'NJ' },
    }),
    prisma.user.upsert({
      where: { username: 'priya.nair' }, update: {},
      create: { name: 'Priya Nair', username: 'priya.nair', password: await hash('password'), role: 'TEAM_A', designation: 'Treasury Exec', initials: 'PN' },
    }),
    prisma.user.upsert({
      where: { username: 'arjun.singh' }, update: {},
      create: { name: 'Arjun Singh', username: 'arjun.singh', password: await hash('password'), role: 'TEAM_A', designation: 'Treasury Exec', initials: 'AS' },
    }),
  ])

  const userMap = Object.fromEntries(users.map(u => [u.username, u.id]))

  // Sample Invoices
  const invoiceData = [
    { invNo: 'INV-2026-0312', billNo: 'AFP/2026/347', billDate: new Date('2026-03-18'), vendor: 'Adfactors PR Pvt Ltd', dept: 'Marketing', co: 'Omaxe Limited', proj: 'Corporate Office', gross: 850000, tds: 85000, wct: 0, adv: 0, oth: 0, status: 'PAID', type: 'STANDARD', assignee: 'daleep.kumar', hod: 'Rajiv Sharma', expense: 'PR & Communications', erpAt: new Date('2026-03-19'), payAt: new Date('2026-03-22') },
    { invNo: 'INV-2026-0311', billNo: 'HCC/MAR/1102', billDate: new Date('2026-03-15'), vendor: 'Hindustan Construction Co.', dept: 'Construction', co: 'Ludhiana Wholesale Market Pvt Ltd', proj: 'Omaxe Chowk — Ludhiana', gross: 4200000, tds: 210000, wct: 126000, adv: 0, oth: 0, status: 'PAID', type: 'STANDARD', assignee: 'daleep.kumar', hod: 'Manish Verma', expense: 'Civil Work', erpAt: new Date('2026-03-16'), payAt: new Date('2026-03-20') },
    { invNo: 'INV-2026-0310', billNo: 'ORC/2026/89', billDate: new Date('2026-03-10'), vendor: 'Oracle India Pvt Ltd', dept: 'IT & Technology', co: 'Omaxe Limited', proj: 'Corporate Office', gross: 2100000, tds: 210000, wct: 0, adv: 0, oth: 0, status: 'PAID', type: 'PREPAYMENT', assignee: 'sandeep.gupta', hod: 'Ankit Mehta', expense: 'Software License', erpAt: new Date('2026-03-11'), payAt: new Date('2026-03-14') },
    { invNo: 'INV-2026-0309', billNo: 'AF/2026/211', billDate: new Date('2026-03-08'), vendor: 'M/s Ashok Facilities', dept: 'Admin & Facilities', co: 'Omaxe Limited', proj: 'Corporate Office', gross: 340000, tds: 34000, wct: 0, adv: 0, oth: 0, status: 'PAID', type: 'STANDARD', assignee: 'kiran.kumari', hod: 'Preeti Joshi', expense: 'Facility Management', erpAt: new Date('2026-03-09'), payAt: new Date('2026-03-12') },
    { invNo: 'INV-2026-0308', billNo: 'LP/2026/44', billDate: new Date('2026-03-05'), vendor: 'Lall & Partners LLP', dept: 'Legal', co: 'Bhanu Infrabuild Pvt Ltd', proj: 'New Chandigarh', gross: 550000, tds: 55000, wct: 0, adv: 0, oth: 0, status: 'PAID', type: 'STANDARD', assignee: 'nimit.jain', hod: 'Suresh Lal', expense: 'Legal Retainer', erpAt: new Date('2026-03-06'), payAt: new Date('2026-03-10') },
    { invNo: 'INV-2026-0307', billNo: 'SIL/2026/778', billDate: new Date('2026-03-02'), vendor: 'Simplex Infra Ltd', dept: 'Construction', co: 'Omaxe City Bareilly', proj: 'Omaxe City — Bareilly', gross: 6800000, tds: 340000, wct: 204000, adv: 500000, oth: 0, status: 'PAID', type: 'STANDARD', assignee: 'daleep.kumar', hod: 'Manish Verma', expense: 'Civil Construction', erpAt: new Date('2026-03-03'), payAt: new Date('2026-03-07') },
    { invNo: 'INV-2026-0306', billNo: 'TOOH/2026/156', billDate: new Date('2026-02-28'), vendor: 'Times OOH', dept: 'Marketing', co: 'Omaxe Limited', proj: 'Omaxe State — Dwarka', gross: 1200000, tds: 120000, wct: 0, adv: 0, oth: 0, status: 'PAID', type: 'STANDARD', assignee: 'daleep.kumar', hod: 'Rajiv Sharma', expense: 'Outdoor Advertising', erpAt: new Date('2026-03-01'), payAt: new Date('2026-03-04') },
    { invNo: 'INV-2026-0305', billNo: 'WIP/2026/334', billDate: new Date('2026-02-25'), vendor: 'Wipro Ltd', dept: 'IT & Technology', co: 'Omaxe Limited', proj: 'Corporate Office', gross: 3600000, tds: 360000, wct: 0, adv: 0, oth: 0, status: 'PAID', type: 'PREPAYMENT', assignee: 'sandeep.gupta', hod: 'Ankit Mehta', expense: 'IT Services', erpAt: new Date('2026-02-26'), payAt: new Date('2026-03-01') },
    { invNo: 'INV-2026-0304', billNo: 'SE/2026/89', billDate: new Date('2026-02-20'), vendor: 'Shivam Electricals', dept: 'Construction', co: 'Ludhiana Wholesale Market Pvt Ltd', proj: 'Omaxe Chowk — Ludhiana', gross: 980000, tds: 49000, wct: 29400, adv: 0, oth: 0, status: 'PAYMENT_HOLD', type: 'STANDARD', assignee: 'mahesh.kumar', hod: 'Manish Verma', expense: 'Electrical Work', holdReason: 'GST mismatch — pending rectification', erpAt: new Date('2026-02-21') },
    { invNo: 'INV-2026-0303', billNo: 'EM/2026/211', billDate: new Date('2026-02-18'), vendor: 'Excellent Media', dept: 'Marketing', co: 'Omaxe Limited', proj: 'Omaxe State — Dwarka', gross: 750000, tds: 75000, wct: 0, adv: 0, oth: 0, status: 'MOVED_TO_AP', type: 'STANDARD', assignee: 'daleep.kumar', hod: 'Rajiv Sharma', expense: 'Digital Marketing', erpAt: new Date('2026-02-19') },
    { invNo: 'INV-2026-0302', billNo: 'VC/2026/445', billDate: new Date('2026-02-15'), vendor: 'Vardhman Contractors', dept: 'Construction', co: 'Bhanu Infrabuild Pvt Ltd', proj: 'New Chandigarh', gross: 2800000, tds: 140000, wct: 84000, adv: 0, oth: 0, status: 'PROCESSING', type: 'STANDARD', assignee: 'raghuvar.rawat', hod: 'Manish Verma', expense: 'Civil Work' },
    { invNo: 'INV-2026-0301', billNo: 'TM/2026/123', billDate: new Date('2026-02-10'), vendor: 'Tech Mahindra', dept: 'IT & Technology', co: 'Omaxe Limited', proj: 'Corporate Office', gross: 4500000, tds: 450000, wct: 0, adv: 0, oth: 0, status: 'HOLD', type: 'PREPAYMENT', assignee: 'sandeep.gupta', hod: 'Ankit Mehta', expense: 'IT Development', holdReason: 'PO not approved by HOD' },
    { invNo: 'INV-2026-0300', billNo: 'CP/2026/88', billDate: new Date('2026-02-05'), vendor: 'Classic Paints', dept: 'Construction', co: 'Omaxe City Bareilly', proj: 'Omaxe City — Bareilly', gross: 620000, tds: 31000, wct: 0, adv: 0, oth: 0, status: 'MOVED_TO_AP', type: 'STANDARD', assignee: 'karishma.dhingra', hod: 'Manish Verma', expense: 'Paints & Finishes', erpAt: new Date('2026-02-06') },
    { invNo: 'INV-2026-0299', billNo: 'NAB/2026/67', billDate: new Date('2026-02-01'), vendor: 'National Ad Bureau', dept: 'Marketing', co: 'Omaxe Limited', proj: 'Omaxe Chowk — Ludhiana', gross: 1650000, tds: 165000, wct: 0, adv: 0, oth: 0, status: 'PAID', type: 'STANDARD', assignee: 'daleep.kumar', hod: 'Rajiv Sharma', expense: 'Print Advertising', erpAt: new Date('2026-02-02'), payAt: new Date('2026-02-05') },
    { invNo: 'INV-2026-0298', billNo: 'GVL/2026/33', billDate: new Date('2026-01-28'), vendor: 'Green Valley Landscaping', dept: 'Construction', co: 'Omaxe Limited', proj: 'Omaxe State — Dwarka', gross: 890000, tds: 44500, wct: 26700, adv: 0, oth: 0, status: 'PROCESSING', type: 'STANDARD', assignee: 'mahesh.kumar', hod: 'Manish Verma', expense: 'Landscaping' },
    { invNo: 'INV-2026-0297', billNo: 'DNB/2026/19', billDate: new Date('2026-01-25'), vendor: 'D&B India', dept: 'Legal', co: 'Omaxe Limited', proj: 'Corporate Office', gross: 420000, tds: 42000, wct: 0, adv: 0, oth: 0, status: 'ENTERED', type: 'STANDARD', assignee: 'nimit.jain', hod: 'Suresh Lal', expense: 'Legal Advisory' },
    { invNo: 'INV-2026-0296', billNo: 'BI/2026/56', billDate: new Date('2026-01-20'), vendor: 'Bharti Infratel', dept: 'IT & Technology', co: 'Ludhiana Wholesale Market Pvt Ltd', proj: 'Omaxe Chowk — Ludhiana', gross: 1100000, tds: 110000, wct: 0, adv: 0, oth: 0, status: 'ENTERED', type: 'PREPAYMENT', assignee: 'sandeep.gupta', hod: 'Ankit Mehta', expense: 'Telecom Infrastructure' },
    { invNo: 'INV-2026-0295', billNo: 'OV/2026/11', billDate: new Date('2026-01-15'), vendor: 'Omaxe Vendors LLC', dept: 'Admin & Facilities', co: 'Omaxe Limited', proj: 'Corporate Office', gross: 310000, tds: 31000, wct: 0, adv: 0, oth: 0, status: 'HOLD', type: 'STANDARD', assignee: 'kiran.kumari', hod: 'Preeti Joshi', expense: 'Office Supplies', holdReason: 'Duplicate invoice detected' },
  ]

  for (const inv of invoiceData) {
    const net = inv.gross - inv.tds - inv.wct - inv.adv - inv.oth
    await prisma.invoice.upsert({
      where: { invoiceNumber: inv.invNo },
      update: {},
      create: {
        invoiceNumber: inv.invNo,
        billNo: inv.billNo,
        billDate: inv.billDate,
        billType: inv.type,
        status: inv.status,
        holdReason: inv.holdReason || null,
        vendorName: inv.vendor,
        hod: inv.hod,
        expenseNature: inv.expense,
        grossAmount: inv.gross,
        tds: inv.tds,
        wct: inv.wct,
        advanceAdj: inv.adv,
        otherDeductions: inv.oth,
        netPayable: net,
        departmentId: deptMap[inv.dept] || null,
        companyId: coMap[inv.co] || null,
        projectId: projMap[inv.proj] || null,
        assignedToId: userMap[inv.assignee] || null,
        enteredById: userMap['priya.nair'] || null,
        erpPostedAt: inv.erpAt || null,
        paymentDoneAt: inv.payAt || null,
        entryDate: new Date(inv.billDate.getTime() + 86400000 * 2),
      },
    })
  }

  console.log('Seed complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
