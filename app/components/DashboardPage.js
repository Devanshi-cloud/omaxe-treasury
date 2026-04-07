'use client'
import { useState, useEffect, useCallback } from 'react'

export default function DashboardPage({ period, navTo }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    fetch(`/api/dashboard/summary?period=${period}`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [period])

  useEffect(() => { load() }, [load])

  if (loading || !data) return <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>Loading dashboard...</div>

  const { pipeline, kpi, pending, topDepartments, agingERP, agingPayment, employeePostings } = data
  const maxDept = Math.max(...(topDepartments || []).map(d => Number(d.amount)), 1)

  const agingERPBuckets = [
    { label: '0–7 days',   val: agingERP?.['0-7']   || 0, color: '#059669' },
    { label: '8–15 days',  val: agingERP?.['8-15']  || 0, color: '#d97706' },
    { label: '16–30 days', val: agingERP?.['16-30'] || 0, color: '#f59e0b' },
    { label: '31–60 days', val: agingERP?.['31-60'] || 0, color: '#dc2626' },
    { label: '>60 days',   val: agingERP?.['>60']   || 0, color: '#7c2020' },
  ]
  const agingPayBuckets = [
    { label: '0–7 days',   val: agingPayment?.['0-7']   || 0, color: '#059669' },
    { label: '8–15 days',  val: agingPayment?.['8-15']  || 0, color: '#d97706' },
    { label: '16–30 days', val: agingPayment?.['16-30'] || 0, color: '#f59e0b' },
    { label: '31–60 days', val: agingPayment?.['31-60'] || 0, color: '#dc2626' },
    { label: '>60 days',   val: agingPayment?.['>60']   || 0, color: '#7c2020' },
  ]

  const topEmpPending = [...(employeePostings || [])].sort((a, b) => b.pending - a.pending).slice(0, 3)

  function formatAmt(n) {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`
    if (n >= 100000)  return `₹${(n / 100000).toFixed(1)} L`
    return `₹${Number(n).toLocaleString('en-IN')}`
  }

  return (
    <div className="page">
      {/* Pipeline */}
      <div className="pipeline">
        <PipeStage label="Received"      val={pipeline.received}      sub="Total invoices"    active onClick={() => navTo('invoices')} />
        <PipeStage label="In Processing" val={pipeline.inProcessing}  sub="With Team B" />
        <PipeStage label="Moved to AP"   val={pipeline.movedToAP}     sub="ERP posted" />
        <PipeStage label="Payment Queue" val={pipeline.paymentQueue}  sub="Pending payment" />
        <PipeStage label="Paid"          val={pipeline.paid}          sub={formatAmt(kpi.paidAmount)} />
      </div>

      {/* KPIs */}
      <div className="kpi-row">
        <div className="kpi-card navy">
          <div className="kpi-label">Invoices Received at Treasury</div>
          <div className="kpi-value">{kpi.received}</div>
          <div className="kpi-sub">↑ 8% vs last month</div>
        </div>
        <div className="kpi-card gold">
          <div className="kpi-label">Invoices ERP Posted (Moved to AP)</div>
          <div className="kpi-value">{kpi.erpPosted}</div>
          <div className="kpi-sub">{kpi.received ? ((kpi.erpPosted / kpi.received) * 100).toFixed(1) : 0}% conversion rate</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-label">Invoices Payment Done</div>
          <div className="kpi-value">{kpi.paid}</div>
          <div className="kpi-sub">{formatAmt(kpi.paidAmount)} total paid</div>
        </div>
      </div>

      {/* Pending */}
      <div className="pending-boxes">
        <div className="pending-box">
          <div className="pb-label">ERP Posting Pending</div>
          <div className="pb-main">
            <div className="pb-count" style={{ color: 'var(--amber)' }}>{pending.erpCount}</div>
            <div className="pb-amt">invoices</div>
          </div>
        </div>
        <div className="pending-box">
          <div className="pb-label">Payment Pending</div>
          <div className="pb-main">
            <div className="pb-count" style={{ color: 'var(--blue)' }}>{pending.paymentCount}</div>
            <div className="pb-amt">invoices</div>
          </div>
        </div>
        <div className="pending-box">
          <div className="pb-label">Invoices On Hold</div>
          <div className="pb-hold-row">
            <div className="pb-hold-item"><div className="pb-hold-val">{pending.holdMTD}</div><div className="pb-hold-lbl">MTD</div></div>
            <div className="pb-hold-item"><div className="pb-hold-val">{pending.holdYTD}</div><div className="pb-hold-lbl">YTD</div></div>
            <div className="pb-hold-item"><div className="pb-hold-val">{pending.holdLTD}</div><div className="pb-hold-lbl">LTD</div></div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">Top 5 Departments</div><div className="card-sub">By invoice amount received</div></div>
          </div>
          <div className="bar-chart">
            {(topDepartments || []).map(d => (
              <div key={d.id || d.name} className="bar-row">
                <div className="bar-label">{d.name}</div>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${(Number(d.amount) / maxDept) * 100}%`, background: 'var(--navy)' }} /></div>
                <div className="bar-val">{formatAmt(d.amount)}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">Aging — ERP Pending</div><div className="card-sub">Always LTD · All pending invoices</div></div>
            <span style={{ fontSize: 10, background: 'var(--amber-bg)', color: 'var(--amber)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{pending.erpCount} inv</span>
          </div>
          <AgingChart data={agingERPBuckets} />
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">Aging — Payment Pending</div><div className="card-sub">Always LTD · All pending payments</div></div>
            <span style={{ fontSize: 10, background: 'var(--red-bg)', color: 'var(--red)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{pending.paymentCount} inv</span>
          </div>
          <AgingChart data={agingPayBuckets} />
        </div>
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">Employee-wise ERP Postings</div><div className="card-sub">Team B performance</div></div>
          </div>
          <table className="emp-table">
            <thead><tr><th>User</th><th>Posted</th><th>Pending</th></tr></thead>
            <tbody>
              {(employeePostings || []).map(e => (
                <tr key={e.user.id}>
                  <td>
                    <span className="emp-av-sm" style={{ background: '#FFFBEB', color: '#d97706' }}>{e.user.initials}</span>
                    {e.user.name}
                  </td>
                  <td><span className="mono-val" style={{ color: 'var(--green)' }}>{e.posted}</span></td>
                  <td><span className="mono-val" style={{ color: e.pending > 5 ? 'var(--red)' : 'var(--amber)' }}>{e.pending}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {topEmpPending.length > 0 && (
        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <div><div className="card-title">Top 3 — Pending ERP Postings</div><div className="card-sub">Highest backlog in Team B</div></div>
            </div>
            {topEmpPending.map((e, i) => (
              <div key={e.user.id} className="top3-card">
                <div className="top3-rank">#{i + 1}</div>
                <div className="top3-name">{e.user.name}</div>
                <div className="top3-count">{e.pending} inv</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'none' }} />
        </div>
      )}
    </div>
  )
}

function PipeStage({ label, val, sub, active, onClick }) {
  return (
    <div className={`pipe-stage${active ? ' active' : ''}`} onClick={onClick}>
      <div className="ps-label">{label}</div>
      <div className="ps-val">{val}</div>
      <div className="ps-sub">{sub}</div>
    </div>
  )
}

function AgingChart({ data }) {
  const max = Math.max(...data.map(d => d.val), 1)
  return (
    <div className="aging-chart">
      {data.map(d => (
        <div key={d.label} className="aging-bar-wrap">
          <div className="aging-bar-val">{d.val}</div>
          <div className="aging-bar-space">
            <div className="aging-bar" style={{ height: `${(d.val / max) * 100}%`, background: d.color }} />
          </div>
          <div className="aging-bar-lbl">{d.label}</div>
        </div>
      ))}
    </div>
  )
}
