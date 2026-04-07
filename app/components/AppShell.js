'use client'
import { useState, useCallback } from 'react'
import Toast from './Toast'
import DashboardPage from './DashboardPage'
import InvoicesPage from './InvoicesPage'
import EntryPage from './EntryPage'
import AnalyticsPage from './AnalyticsPage'
import AdminPage from './AdminPage'

const PAGE_META = {
  dashboard: { title: 'Dashboard', sub: 'Corporate Treasury · March 2026' },
  invoices:  { title: 'Invoices',  sub: 'All invoices in the system' },
  entry:     { title: 'New Invoice', sub: 'Submit a new invoice for processing' },
  analytics: { title: 'Analytics', sub: 'Spend, flow & performance insights' },
  admin:     { title: 'Admin Panel', sub: 'Users, routing & master data' },
}

export default function AppShell({ user, onLogout }) {
  const [page, setPage] = useState('dashboard')
  const [period, setPeriod] = useState('MTD')
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg, icon = '✓', type = 'success') => {
    setToast({ msg, icon, type })
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    onLogout()
  }

  const meta = PAGE_META[page]

  return (
    <div className="screen-app">
      <div className="sidebar">
        <div className="sb-brand">
          <div className="sb-org">Omaxe Limited</div>
          <div className="sb-title">Treasury<br />Platform</div>
          <div className="sb-ver">v1.0 · 2026</div>
        </div>
        <div className="sb-section">Main</div>
        <NavItem icon="⬡" label="Dashboard"   active={page === 'dashboard'} onClick={() => setPage('dashboard')} />
        <NavItem icon="≡" label="Invoices"    active={page === 'invoices'}  onClick={() => setPage('invoices')}  badge="·" />
        <NavItem icon="＋" label="New Invoice" active={page === 'entry'}     onClick={() => setPage('entry')} />
        <div className="sb-section">Insights</div>
        <NavItem icon="◈" label="Analytics"   active={page === 'analytics'} onClick={() => setPage('analytics')} />
        {user.role === 'ADMIN' && <>
          <div className="sb-section">System</div>
          <NavItem icon="⊛" label="Admin Panel" active={page === 'admin'} onClick={() => setPage('admin')} />
        </>}
        <div className="sb-footer">
          <div className="user-pill">
            <div className="user-av" style={{ background: 'linear-gradient(135deg,#B8860B,#e8b347)', color: '#fff' }}>
              {user.initials || user.name?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="user-name-sb">{user.name}</div>
              <div className="user-role-tag">{user.role?.replace('_', ' ')} · {user.designation}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>↩ Sign Out</button>
        </div>
      </div>

      <div className="main">
        <div className="topbar">
          <div className="topbar-info">
            <div className="topbar-title">{meta.title}</div>
            <div className="topbar-sub">{meta.sub}</div>
          </div>
          <select className="period-select" value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="MTD">MTD — March 2026</option>
            <option value="YTD">YTD — FY 2025-26</option>
            <option value="LTD">LTD — All Time</option>
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => showToast('Data refreshed', '✓', 'success')}>⟳ Refresh</button>
          <button className="btn btn-navy btn-sm" onClick={() => setPage('entry')}>＋ New Invoice</button>
        </div>

        {page === 'dashboard' && <DashboardPage period={period} navTo={setPage} showToast={showToast} />}
        {page === 'invoices'  && <InvoicesPage showToast={showToast} user={user} />}
        {page === 'entry'     && <EntryPage showToast={showToast} navTo={setPage} />}
        {page === 'analytics' && <AnalyticsPage period={period} />}
        {page === 'admin'     && <AdminPage showToast={showToast} />}
      </div>

      <Toast toast={toast} onHide={() => setToast(null)} />
    </div>
  )
}

function NavItem({ icon, label, active, onClick, badge }) {
  return (
    <div className={`nav-item${active ? ' active' : ''}`} onClick={onClick}>
      <span className="nav-icon">{icon}</span>
      {label}
      {badge && <span className="nav-badge">{badge}</span>}
    </div>
  )
}
