'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  intervalMs?: number
  onRefresh?: () => void
}

export default function AutoRefresh({ intervalMs = 15000, onRefresh }: Props) {
  const router = useRouter()
  const [spinning, setSpinning] = useState(false)

  const refresh = useCallback(() => {
    setSpinning(true)
    if (onRefresh) {
      onRefresh()
    } else {
      router.refresh()
    }
    setTimeout(() => setSpinning(false), 600)
  }, [router, onRefresh])

  useEffect(() => {
    const id = setInterval(refresh, intervalMs)
    return () => clearInterval(id)
  }, [refresh, intervalMs])

  return (
    <button
      onClick={refresh}
      title="רענן"
      className={`text-stone-400 hover:text-stone-600 transition-all text-base leading-none ${spinning ? 'animate-spin' : ''}`}
    >
      ↻
    </button>
  )
}
