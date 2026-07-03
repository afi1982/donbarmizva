'use client'
import { useEffect, useState } from 'react'

function calc(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
  }
}

export default function CountdownTimer({ eventDate, childName }: { eventDate: string; childName?: string }) {
  const [t, setT] = useState(calc(eventDate))
  useEffect(() => {
    const id = setInterval(() => setT(calc(eventDate)), 30000)
    return () => clearInterval(id)
  }, [eventDate])
  if (!t) return null
  return (
    <div
      className="rounded-2xl p-4 text-white flex items-center justify-between border border-amber-500/30 shadow-lg shadow-amber-950/40"
      style={{ background: 'linear-gradient(270deg, #92600d, #b8963e 55%, #8a5a10)' }}
      dir="rtl"
    >
      <p className="text-sm font-bold opacity-90">הבר מצווה של {childName || 'דון'}</p>
      <div className="flex items-baseline gap-3 font-black text-2xl">
        <span>{t.days}<span className="text-xs font-normal mr-0.5">ימים</span></span>
        <span className="opacity-40">:</span>
        <span>{String(t.hours).padStart(2,'0')}<span className="text-xs font-normal mr-0.5">שע׳</span></span>
        <span className="opacity-40">:</span>
        <span>{String(t.minutes).padStart(2,'0')}<span className="text-xs font-normal mr-0.5">דק׳</span></span>
      </div>
    </div>
  )
}
