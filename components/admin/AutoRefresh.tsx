'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function AutoRefresh({ intervalMs = 15000 }: { intervalMs?: number }) {
  const router = useRouter()
  const [spinning, setSpinning] = useState(false)

  const refresh = useCallback(() => {
    setSpinning(true)
    router.refresh()
    setTimeout(() => setSpinning(false), 800)
  }, [router])

  useEffect(() => {
    const id = setInterval(refresh, intervalMs)
    return () => clearInterval(id)
  }, [refresh, intervalMs])

  return (
    <button
      onClick={refresh}
      title="רענן נתונים"
      className={`text-stone-400 hover:text-stone-600 transition-colors text-sm p-1 ${spinning ? 'animate-spin' : ''}`}
    >
      ↻
    </button>
  )
}
