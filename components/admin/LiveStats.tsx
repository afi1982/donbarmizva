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

  const comingGuests = guests.filter(g => g.status === 'coming')
  const coming = comingGuests.length
  const headcount = comingGuests.reduce((sum, g) => sum + Math.max(g.party_size ?? 1, 1), 0)
  const maybe = guests.filter(g => g.status === 'maybe').length
  const notComing = guests.filter(g => g.status === 'not_coming').length
  const pending = guests.filter(g => g.status === 'pending').length

  const cards = [
    { count: coming,    label: headcount > coming ? `מגיע בשמחה · ${headcount} אנשים סה״כ` : 'מגיע בשמחה', bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', sub: 'text-emerald-400' },
    { count: maybe,     label: 'עדיין לא בטוח',   bg: 'bg-amber-500/10 border-amber-500/20',    text: 'text-amber-400',   sub: 'text-amber-400' },
    { count: notComing, label: 'לא אוכל להגיע',   bg: 'bg-red-500/10 border-red-500/20',        text: 'text-red-400',     sub: 'text-red-400' },
    { count: pending,   label: 'ממתין',            bg: 'bg-slate-800/40 border-slate-800',    text: 'text-slate-400',   sub: 'text-slate-400' },
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
        <p className="text-xs text-slate-500 text-left">
          עודכן {lastUpdated.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      )}
    </div>
  )
}
