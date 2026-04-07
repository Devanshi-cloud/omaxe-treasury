'use client'
import { useEffect } from 'react'

export default function Toast({ toast, onHide }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onHide, 3000)
    return () => clearTimeout(t)
  }, [toast, onHide])

  if (!toast) return null
  return (
    <div className={`toast ${toast.type}`}>
      <span>{toast.icon}</span>
      <span>{toast.msg}</span>
    </div>
  )
}
