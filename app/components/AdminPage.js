'use client'
import { useState, useEffect, useCallback } from 'react'

const TEAM_CLASS = { ADMIN: 'team-admin', TEAM_A: 'team-a', TEAM_B: 'team-b', TEAM_C: 'team-c' }
const TEAM_LABEL = { ADMIN: 'Admin', TEAM_A: 'Team A', TEAM_B: 'Team B', TEAM_C: 'Team C' }

export default function AdminPage({ showToast }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'TEAM_A', designation: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/users')
      .then(r => r.ok ? r.json() : { users: [] })
      .then(d => setUsers(d.users || []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function createUser() {
    if (!form.name || !form.username || !form.password) {
      showToast('Name, username and password are required', '!', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Failed to create user', '✗', 'error'); return }
      showToast(`User ${data.user.name} created successfully`, '✓', 'success')
      setModal(false)
      setForm({ name: '', username: '', password: '', role: 'TEAM_A', designation: '' })
      load()
    } catch {
      showToast('Network error', '✗', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <div className="grid-2">
        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header">
              <div><div className="card-title">👥 User Management</div><div className="card-sub">All platform users</div></div>
              <button className="btn btn-navy btn-sm" onClick={() => setModal(true)}>＋ Add User</button>
            </div>
            {loading ? (
              <div style={{ color: 'var(--text-3)', fontSize: 11, textAlign: 'center', padding: 16 }}>Loading...</div>
            ) : users.map(u => (
              <div key={u.id} className="user-card">
                <div className="uc-av" style={{ background: '#FFFBEB', color: '#d97706' }}>{u.initials || u.name.slice(0, 2).toUpperCase()}</div>
                <div className="uc-info">
                  <div className="uc-name">{u.name}</div>
                  <div className="uc-role">{u.username} · {u.designation}</div>
                </div>
                <span className={`team-badge ${TEAM_CLASS[u.role] || ''}`}>{TEAM_LABEL[u.role] || u.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header"><div><div className="card-title">🔀 Routing Rules</div><div className="card-sub">Category → Team B assignment</div></div></div>
            <table className="data-table">
              <thead><tr><th>Invoice Category</th><th>ERP User</th><th>Payment</th></tr></thead>
              <tbody>
                <tr><td>Media &amp; Marketing</td><td style={{ color: 'var(--gold)', fontWeight: 600 }}>Daleep Kumar</td><td style={{ color: 'var(--green)', fontWeight: 600 }}>Naveen Garg</td></tr>
                <tr><td>Construction</td><td style={{ color: 'var(--gold)', fontWeight: 600 }}>Daleep Kumar</td><td style={{ color: 'var(--green)', fontWeight: 600 }}>Naveen Garg</td></tr>
                <tr><td>IT &amp; Technology</td><td style={{ color: 'var(--blue)', fontWeight: 600 }}>Sandeep Gupta</td><td style={{ color: 'var(--green)', fontWeight: 600 }}>Naveen Garg</td></tr>
                <tr><td>Admin &amp; Facilities</td><td style={{ color: 'var(--blue)', fontWeight: 600 }}>Kiran Kumari</td><td style={{ color: 'var(--green)', fontWeight: 600 }}>Naveen Garg</td></tr>
                <tr><td>Legal</td><td style={{ color: 'var(--blue)', fontWeight: 600 }}>Nimit Jain</td><td style={{ color: 'var(--green)', fontWeight: 600 }}>Naveen Garg</td></tr>
              </tbody>
            </table>
          </div>
          <div className="card">
            <div className="card-header"><div><div className="card-title">📋 Master Data</div><div className="card-sub">Dropdown values configuration</div></div></div>
            {['🏢 Company Master', '🏗️ Department Master', '📍 Project Master'].map((label, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)' }}>{label}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => showToast('Master data editor coming soon', 'ℹ', 'info')}>Manage</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Add New User</div>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="fg" style={{ marginBottom: 12 }}>
                <label>Full Name <span className="req">*</span></label>
                <input type="text" placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="fg" style={{ marginBottom: 12 }}>
                <label>Username <span className="req">*</span></label>
                <input type="text" placeholder="e.g. daleep.kumar" value={form.username} onChange={e => set('username', e.target.value)} />
              </div>
              <div className="fg" style={{ marginBottom: 12 }}>
                <label>Designation</label>
                <input type="text" placeholder="e.g. Sr. Accounts Exec" value={form.designation} onChange={e => set('designation', e.target.value)} />
              </div>
              <div className="fg" style={{ marginBottom: 12 }}>
                <label>Role / Team <span className="req">*</span></label>
                <select value={form.role} onChange={e => set('role', e.target.value)}>
                  <option value="TEAM_A">Team A — Invoice Entry</option>
                  <option value="TEAM_B">Team B — ERP Processing</option>
                  <option value="TEAM_C">Team C — Payment</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="fg">
                <label>Password <span className="req">*</span></label>
                <input type="password" placeholder="Set initial password" value={form.password} onChange={e => set('password', e.target.value)} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-navy" onClick={createUser} disabled={saving}>{saving ? 'Creating...' : 'Create User'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
