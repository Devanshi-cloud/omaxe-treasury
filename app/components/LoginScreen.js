'use client'
import { useState } from 'react'

const ROLES = [
  { id: 'ADMIN',  icon: '🛡️', name: 'Admin',  sub: 'Full Access' },
  { id: 'TEAM_A', icon: '📥', name: 'Team A', sub: 'Invoice Entry' },
  { id: 'TEAM_B', icon: '⚙️', name: 'Team B', sub: 'ERP Processing' },
  { id: 'TEAM_C', icon: '💸', name: 'Team C', sub: 'Payment' },
]

const ROLE_USERS = {
  ADMIN:  'sanket.mhapankar',
  TEAM_A: 'priya.nair',
  TEAM_B: 'daleep.kumar',
  TEAM_C: 'naveen.garg',
}

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('sanket.mhapankar')
  const [password, setPassword] = useState('password')
  const [role, setRole] = useState('ADMIN')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function selectRole(r) {
    setRole(r)
    setUsername(ROLE_USERS[r])
  }

  async function handleLogin() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login failed'); return }
      onLogin(data.user)
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen-login">
      <div className="login-wrap">
        <div className="login-left">
          <div className="ll-brand">
            <div className="org">Omaxe Limited</div>
            <div className="title">Treasury Invoice<br />Processing Platform</div>
            <div className="sub">Corporate Treasury &amp; Outflow Management</div>
          </div>
          <div className="ll-desc">
            <div className="ll-feature">
              <div className="icon">📋</div>
              <div className="text"><strong>Invoice Tracking</strong>Track every invoice from receipt to payment in real time</div>
            </div>
            <div className="ll-feature">
              <div className="icon">📊</div>
              <div className="text"><strong>Live Dashboard</strong>Aging analysis, team performance &amp; spend analytics</div>
            </div>
            <div className="ll-feature">
              <div className="icon">🔒</div>
              <div className="text"><strong>Role-based Access</strong>Team A, B, C and Admin — each sees only their work</div>
            </div>
          </div>
        </div>
        <div className="login-right">
          <div className="lr-title">Sign in to your account</div>
          <div className="lr-sub">Enter your credentials and select your role to continue</div>
          {error && <div style={{ background: '#FEF2F2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 7, padding: '8px 12px', marginBottom: 14, fontSize: 12 }}>{error}</div>}
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" type="text" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <div className="form-group">
            <label className="form-label">Select Role</label>
            <div className="role-grid">
              {ROLES.map(r => (
                <div key={r.id} className={`role-opt${role === r.id ? ' selected' : ''}`} onClick={() => selectRole(r.id)}>
                  <div className="ro-icon">{r.icon}</div>
                  <div className="ro-name">{r.name}</div>
                  <div className="ro-sub">{r.sub}</div>
                </div>
              ))}
            </div>
          </div>
          <button className="login-btn" onClick={handleLogin} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </div>
      </div>
    </div>
  )
}
