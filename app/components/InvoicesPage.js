'use client'
import { useState, useEffect, useCallback } from 'react'

const STATUS_LABELS = {
  ENTERED: 'Entered', PROCESSING: 'In Processing', HOLD: 'Hold',
  MOVED_TO_AP: 'Moved to AP', PAYMENT_HOLD: 'Payment Hold', PAID: 'Paid',
}

const STATUS_BADGE = {
  ENTERED: 'badge-entered', PROCESSING: 'badge-processing', HOLD: 'badge-hold',
  MOVED_TO_AP: 'badge-ap', PAYMENT_HOLD: 'badge-payhold', PAID: 'badge-paid',
}

export default function InvoicesPage({ showToast, user }) {
  const [tab, setTab] = useState('all')
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [holdModal, setHoldModal] = useState(null)
  const [holdReason, setHoldReason] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ tab })
    if (search)       params.set('search', search)
    if (deptFilter)   params.set('departmentId', deptFilter)
    if (statusFilter) params.set('status', statusFilter)
    if (typeFilter)   params.set('billType', typeFilter)

    fetch(`/api/invoices?${params}`)
      .then(r => r.json())
      .then(d => setInvoices(d.invoices || []))
      .finally(() => setLoading(false))
  }, [tab, search, deptFilter, statusFilter, typeFilter])

  useEffect(() => { load() }, [load])

  async function updateStatus(id, status, extra = {}) {
    const res = await fetch(`/api/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...extra }),
    })
    if (res.ok) {
      showToast(`Invoice ${status === 'PAID' ? 'marked as paid' : status === 'MOVED_TO_AP' ? 'moved to AP' : 'updated'}`, '✓', 'success')
      load()
    } else {
      const d = await res.json()
      showToast(d.error || 'Update failed', '✗', 'error')
    }
  }

  async function putOnHold(id) {
    await updateStatus(id, 'HOLD', { holdReason })
    setHoldModal(null)
    setHoldReason('')
  }

  function formatDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
  }

  function fmtAmt(n) {
    return `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  }

  const allCount  = invoices.length
  const erpCount  = invoices.filter(i => ['ENTERED', 'PROCESSING', 'HOLD'].includes(i.status)).length
  const payCount  = invoices.filter(i => ['MOVED_TO_AP', 'PAYMENT_HOLD'].includes(i.status)).length

  return (
    <div className="page">
      <div className="inv-tabs">
        <div className={`inv-tab${tab === 'all' ? ' active' : ''}`} onClick={() => setTab('all')}>
          All Invoices<span className="inv-tab-count">{allCount}</span>
        </div>
        <div className={`inv-tab${tab === 'erp' ? ' active' : ''}`} onClick={() => setTab('erp')}>
          ERP / AP Stage<span className="inv-tab-count">{erpCount}</span>
        </div>
        <div className={`inv-tab${tab === 'pay' ? ' active' : ''}`} onClick={() => setTab('pay')}>
          To Be Paid<span className="inv-tab-count">{payCount}</span>
        </div>
      </div>

      <div className="filter-row">
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Bill Types</option>
          <option value="STANDARD">Standard</option>
          <option value="PREPAYMENT">Prepayment</option>
        </select>
        <button className="btn btn-ghost btn-sm" onClick={() => {
          const rows = invoices.map(i => [i.invoiceNumber, i.vendorName, i.status, i.grossAmount, i.netPayable].join(','))
          const csv = ['Invoice No,Vendor,Status,Gross,Net', ...rows].join('\n')
          const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv); a.download = 'invoices.csv'; a.click()
          showToast('Export downloaded', '⬇', 'info')
        }}>⬇ Export CSV</button>
        <div className="search-box">
          <span style={{ color: 'var(--text-3)', fontSize: 13 }}>⌕</span>
          <input type="text" placeholder="Search vendor, bill no..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice No</th><th>Vendor</th><th>Department</th><th>Bill Date</th>
              <th>Gross</th><th>Net Payable</th><th>Status</th><th>Assigned To</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-3)', padding: 24 }}>Loading...</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-3)', padding: 24 }}>No invoices found</td></tr>
            ) : invoices.map(inv => (
              <tr key={inv.id}>
                <td>
                  <div className="td-bold">{inv.invoiceNumber}</div>
                  <div className="td-muted">{inv.billNo}</div>
                </td>
                <td>
                  <div className="td-bold" style={{ fontSize: 12 }}>{inv.vendorName}</div>
                  <div className="td-muted">{inv.company?.name}</div>
                </td>
                <td>{inv.department?.name || '—'}</td>
                <td className="td-mono">{formatDate(inv.billDate)}</td>
                <td className="td-mono">{fmtAmt(inv.grossAmount)}</td>
                <td className="td-green">{fmtAmt(inv.netPayable)}</td>
                <td><span className={`badge ${STATUS_BADGE[inv.status] || ''}`}>{STATUS_LABELS[inv.status]}</span></td>
                <td style={{ fontSize: 11 }}>{inv.assignedTo?.name || '—'}</td>
                <td>
                  {['ENTERED', 'PROCESSING'].includes(inv.status) && ['ADMIN', 'TEAM_B'].includes(user.role) && (
                    <button className="act-btn green" onClick={() => updateStatus(inv.id, 'MOVED_TO_AP')}>Post ERP</button>
                  )}
                  {['MOVED_TO_AP', 'PAYMENT_HOLD'].includes(inv.status) && ['ADMIN', 'TEAM_C'].includes(user.role) && (
                    <button className="act-btn green" onClick={() => updateStatus(inv.id, 'PAID')}>Mark Paid</button>
                  )}
                  {!['HOLD', 'PAYMENT_HOLD', 'PAID'].includes(inv.status) && ['ADMIN', 'TEAM_B'].includes(user.role) && (
                    <button className="act-btn red" onClick={() => { setHoldModal(inv.id); setHoldReason('') }}>Hold</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hold Modal */}
      {holdModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setHoldModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Put Invoice on Hold</div>
              <button className="modal-close" onClick={() => setHoldModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="fg">
                <label>Hold Reason <span className="req">*</span></label>
                <textarea rows={3} placeholder="Explain why this invoice is being put on hold..." value={holdReason} onChange={e => setHoldReason(e.target.value)} style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setHoldModal(null)}>Cancel</button>
              <button className="btn btn-red" onClick={() => holdReason.trim() && putOnHold(holdModal)} style={{ opacity: holdReason.trim() ? 1 : 0.5 }}>Confirm Hold</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
