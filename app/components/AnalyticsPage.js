'use client'
import { useState, useEffect, useCallback } from 'react'

export default function AnalyticsPage({ period }) {
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

  if (loading || !data) return <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>Loading analytics...</div>

  const monthly = data.monthlyFlow || []
  const maxMonthly = Math.max(...monthly.flatMap(m => [m.received, m.erpPosted, m.paid]), 1)

  const depts = data.topDepartments || []
  const maxDept = Math.max(...depts.map(d => Number(d.amount)), 1)

  function formatAmt(n) {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`
    if (n >= 100000)  return `₹${(n / 100000).toFixed(1)} L`
    return `₹${Number(n).toLocaleString('en-IN')}`
  }

  function monthLabel(d) {
    if (!d) return ''
    return new Date(d).toLocaleDateString('en-IN', { month: 'short' })
  }

  return (
    <div className="page">
      <div className="grid-2" style={{ marginBottom: 14 }}>
        <div className="card">
          <div className="chart-title">Last 12 Months — Invoice Flow</div>
          <div className="chart-sub">Invoices Received vs ERP Posted vs Paid</div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
            <div className="legend-row"><div className="legend-dot" style={{ background: 'var(--navy)' }} /><span className="legend-label">Received</span></div>
            <div className="legend-row"><div className="legend-dot" style={{ background: 'var(--gold)' }} /><span className="legend-label">ERP Posted</span></div>
            <div className="legend-row"><div className="legend-dot" style={{ background: 'var(--green)' }} /><span className="legend-label">Paid</span></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 130, paddingTop: 10 }}>
            {monthly.length === 0 ? (
              <div style={{ color: 'var(--text-3)', fontSize: 11, margin: 'auto' }}>No data yet</div>
            ) : monthly.map((m, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, height: '100%' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 1, width: '100%' }}>
                  <div style={{ flex: 1, height: `${(m.received / maxMonthly) * 100}%`, background: 'var(--navy)', borderRadius: '2px 2px 0 0', minHeight: 2 }} />
                  <div style={{ flex: 1, height: `${(m.erpPosted / maxMonthly) * 100}%`, background: 'var(--gold)', borderRadius: '2px 2px 0 0', minHeight: 2 }} />
                  <div style={{ flex: 1, height: `${(m.paid / maxMonthly) * 100}%`, background: 'var(--green)', borderRadius: '2px 2px 0 0', minHeight: 2 }} />
                </div>
                <div style={{ fontSize: 8, color: 'var(--text-3)', marginTop: 3 }}>{monthLabel(m.month)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="chart-title">Top 5 Departments — Received</div>
          <div className="chart-sub">By gross invoice amount</div>
          <div style={{ marginTop: 12 }}>
            {depts.length === 0 ? (
              <div style={{ color: 'var(--text-3)', fontSize: 11 }}>No data yet</div>
            ) : depts.map(d => (
              <div key={d.id || d.name} className="bar-row" style={{ marginBottom: 8 }}>
                <div className="bar-label">{d.name}</div>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${(Number(d.amount) / maxDept) * 100}%`, background: 'var(--navy)' }} /></div>
                <div className="bar-val">{formatAmt(d.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="chart-title">Platform Summary</div>
        <div className="chart-sub">Key metrics for {period}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 14 }}>
          {[
            { label: 'Total Received',    val: data.kpi.received,  color: 'var(--navy)' },
            { label: 'ERP Posted',        val: data.kpi.erpPosted, color: 'var(--gold)' },
            { label: 'Paid',              val: data.kpi.paid,      color: 'var(--green)' },
            { label: 'On Hold / Pending', val: (data.pending?.holdLTD || 0) + (data.pending?.erpCount || 0), color: 'var(--red)' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '12px', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 28, fontWeight: 500, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
