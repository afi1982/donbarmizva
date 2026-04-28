'use client'
import { useEffect, useState } from 'react'
import { Guest } from '@/lib/types'

export default function LiveStats() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  async function load() {
    try {
      const res = await fetch('/api/guests', { cache: 'no-store' })
      if (res.ok) {
        setGuests(await res.json())
        setLastUpdated(new Date())
      }
    } catch { /* ignore */ }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 10000)
    return () => clearInterval(id)
  }, [])

  const coming = guests.filter(g => g.status === 'coming').length
  const maybe = guests.filter(g => g.status === 'maybe').length
  const notComing = guests.filter(g => g.status === 'not_coming').length
  const pending = guests.filter(g => g.status === 'pending').length

  const cards = [
    { count: coming,    label: 'מגיע בשמחה',     bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600', sub: 'text-emerald-500' },
    { count: maybe,     label: 'עדיין לא בטוח',   bg: 'bg-amber-50 border-amber-100',    text: 'text-amber-500',   sub: 'text-amber-400' },
    { count: notComing, label: 'לא אוכל להגיע',   bg: 'bg-red-50 border-red-100',        text: 'text-red-500',     sub: 'text-red-400' },
    { count: pending,   label: 'ממתין',            bg: 'bg-stone-50 border-stone-200',    text: 'text-stone-400',   sub: 'text-stone-400' },
  ]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map(c => (
          <div key={c.label} className={`${c.bg} border rounded-2xl p-4 text-center`}>
            <div className={`text-4xl font-black ${c.text}`}>{c.count}</div>
            <div className={`text-xs font-semibold ${c.sub} mt-1`}>{c.label}</div>
          </div>
        ))}
      </div>
      {lastUpdated && (
        <p className="text-xs text-stone-300 text-left">
          עודכן {lastUpdated.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      )}
    </div>
  )
}
