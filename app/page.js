'use client'
import { useEffect, useState } from 'react'
import LoginScreen from './components/LoginScreen'
import AppShell from './components/AppShell'

export default function Home() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) setUser(data.user)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F4F6F9', fontFamily: 'DM Sans, sans-serif', color: '#1B2F4E', fontSize: 14 }}>
      Loading...
    </div>
  )

  if (!user) return <LoginScreen onLogin={setUser} />
  return <AppShell user={user} onLogout={() => setUser(null)} />
}
