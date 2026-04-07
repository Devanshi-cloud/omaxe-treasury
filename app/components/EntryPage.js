'use client'
import { useState, useEffect } from 'react'

export default function EntryPage({ showToast, navTo }) {
  const [form, setForm] = useState({
    billDate: new Date().toISOString().split('T')[0],
    billType: 'STANDARD',
    vendorName: '', hod: '', expenseNature: '',
    departmentId: '', companyId: '', projectId: '', assignedToId: '',
    grossAmount: '', tds: '', wct: '', advanceAdj: '', otherDeductions: '',
    billNo: '',
  })
  const [departments, setDepartments] = useState([])
  const [companies, setCompanies] = useState([])
  const [projects, setProjects] = useState([])
  const [teamB, setTeamB] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Load master data
    Promise.all([
      fetch('/api/master/departments').then(r => r.ok ? r.json() : { departments: [] }),
      fetch('/api/master/companies').then(r => r.ok ? r.json() : { companies: [] }),
      fetch('/api/master/projects').then(r => r.ok ? r.json() : { projects: [] }),
      fetch('/api/admin/users').then(r => r.ok ? r.json() : { users: [] }),
    ]).then(([d, c, p, u]) => {
      setDepartments(d.departments || [])
      setCompanies(c.companies || [])
      setProjects(p.projects || [])
      setTeamB((u.users || []).filter(usr => usr.role === 'TEAM_B'))
    })
  }, [])

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  const gross = parseFloat(form.grossAmount) || 0
  const tds   = parseFloat(form.tds)         || 0
  const wct   = parseFloat(form.wct)         || 0
  const adv   = parseFloat(form.advanceAdj)  || 0
  const oth   = parseFloat(form.otherDeductions) || 0
  const deductions = tds + wct + adv + oth
  const net   = gross - deductions

  function fmt(n) { return n ? `₹ ${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹ 0.00' }

  async function handleSubmit() {
    if (!form.vendorName || !form.grossAmount || !form.billDate) {
      showToast('Vendor name, gross amount and bill date are required', '!', 'error')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Submission failed', '✗', 'error'); return }
      showToast(`Invoice ${data.invoice.invoiceNumber} submitted successfully`, '✓', 'success')
      navTo('invoices')
    } catch {
      showToast('Network error', '✗', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  function clearForm() {
    setForm(f => ({ ...f, vendorName: '', hod: '', expenseNature: '', billNo: '', grossAmount: '', tds: '', wct: '', advanceAdj: '', otherDeductions: '', departmentId: '', companyId: '', projectId: '', assignedToId: '' }))
  }

  return (
    <div className="page">
      <div style={{ maxWidth: 820 }}>
        <div className="form-card">
          <div className="form-card-title">📋 Invoice Details</div>
          <div className="form-row">
            <div className="fg">
              <label>Entry Date (Treasury Receipt) <span className="req">*</span></label>
              <input type="text" className="auto-field" value={new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} readOnly />
            </div>
            <div className="fg">
              <label>Bill Date <span className="req">*</span></label>
              <input type="date" value={form.billDate} onChange={e => set('billDate', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="fg">
              <label>Bill No</label>
              <input type="text" placeholder="e.g. AFP/2026/347" value={form.billNo} onChange={e => set('billNo', e.target.value)} />
            </div>
            <div className="fg">
              <label>Bill Type <span className="req">*</span></label>
              <select value={form.billType} onChange={e => set('billType', e.target.value)}>
                <option value="STANDARD">Standard — Invoice (Work Done)</option>
                <option value="PREPAYMENT">Prepayment — PO/WO (Advance)</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="fg">
              <label>Department <span className="req">*</span></label>
              <select value={form.departmentId} onChange={e => set('departmentId', e.target.value)}>
                <option value="">— Select Department —</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="fg">
              <label>Company <span className="req">*</span></label>
              <select value={form.companyId} onChange={e => set('companyId', e.target.value)}>
                <option value="">— Select Company —</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="fg">
              <label>Vendor Name <span className="req">*</span></label>
              <input type="text" placeholder="Enter vendor / party name" value={form.vendorName} onChange={e => set('vendorName', e.target.value)} />
            </div>
            <div className="fg">
              <label>Project</label>
              <select value={form.projectId} onChange={e => set('projectId', e.target.value)}>
                <option value="">— Select Project —</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="fg">
              <label>HOD</label>
              <input type="text" placeholder="Head of Department name" value={form.hod} onChange={e => set('hod', e.target.value)} />
            </div>
            <div className="fg">
              <label>Expense Nature</label>
              <input type="text" placeholder="e.g. Branding, Civil Work, Software..." value={form.expenseNature} onChange={e => set('expenseNature', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="fg">
              <label>Gross Amount (₹) <span className="req">*</span></label>
              <input type="number" placeholder="0.00" value={form.grossAmount} onChange={e => set('grossAmount', e.target.value)} />
            </div>
            <div className="fg">
              <label>Assigned To (Team B Member)</label>
              <select value={form.assignedToId} onChange={e => set('assignedToId', e.target.value)}>
                <option value="">— Select Team B Member —</option>
                {teamB.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="form-card">
          <div className="form-card-title">💰 Net Payable Calculation</div>
          <div className="form-row">
            <div className="fg"><label>TDS (₹)</label><input type="number" placeholder="0.00" value={form.tds} onChange={e => set('tds', e.target.value)} /></div>
            <div className="fg"><label>WCT (₹)</label><input type="number" placeholder="0.00" value={form.wct} onChange={e => set('wct', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="fg"><label>Advance Adjustment (₹)</label><input type="number" placeholder="0.00" value={form.advanceAdj} onChange={e => set('advanceAdj', e.target.value)} /></div>
            <div className="fg"><label>Other Deductions (₹)</label><input type="number" placeholder="0.00" value={form.otherDeductions} onChange={e => set('otherDeductions', e.target.value)} /></div>
          </div>
          <div className="calc-box">
            <div className="calc-row"><span style={{ color: 'var(--text-2)' }}>Gross Amount</span><span>{fmt(gross)}</span></div>
            <div className="calc-row"><span style={{ color: 'var(--text-2)' }}>Total Deductions</span><span style={{ color: 'var(--red)' }}>— {fmt(deductions)}</span></div>
            <div className="calc-row total"><span>Net Payable Amount</span><span style={{ color: 'var(--green)' }}>{fmt(net)}</span></div>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-ghost" onClick={clearForm}>✕ Clear</button>
          <button className="btn btn-ghost" onClick={() => showToast('Invoice saved as draft', '💾', 'info')}>◻ Save Draft</button>
          <button className="btn btn-navy" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : '→ Submit Invoice'}
          </button>
        </div>
      </div>
    </div>
  )
}
