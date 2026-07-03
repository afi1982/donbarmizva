'use client'
import { useEffect, useState, useCallback } from 'react'
import { Guest, GuestStatus } from '@/lib/types'
import GuestForm from '@/components/admin/GuestForm'
import GuestTable from '@/components/admin/GuestTable'

const FILTERS: { key: GuestStatus | 'all'; label: string }[] = [
  { key: 'all',        label: 'הכל' },
  { key: 'coming',     label: 'מגיעים' },
  { key: 'maybe',      label: 'לא בטוחים' },
  { key: 'not_coming', label: 'לא מגיעים' },
  { key: 'pending',    label: 'ממתינים' },
]

const STATUS_HEB: Record<string, string> = {
  coming: 'מגיע', not_coming: 'לא מגיע', maybe: 'לא בטוח', pending: 'ממתין',
}

function exportCsv(guests: Guest[]) {
  const header = ['שם', 'טלפון', 'סטטוס', 'מספר מגיעים', 'הערה', 'הוזמן בתאריך', 'הגיב בתאריך']
  const rows = guests.map(g => [
    g.name,
    g.phone.split('#')[0],
    STATUS_HEB[g.status] ?? g.status,
    g.status === 'coming' ? String(g.party_size ?? 1) : '',
    g.rsvp_note ?? '',
    g.invited_at ? new Date(g.invited_at).toLocaleDateString('he-IL') : '',
    g.responded_at ? new Date(g.responded_at).toLocaleDateString('he-IL') : '',
  ])
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
  const csv = [header, ...rows].map(r => r.map(escape).join(',')).join('\r\n')
  // BOM so Excel opens Hebrew correctly
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'guests.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editGuest, setEditGuest] = useState<Guest | undefined>()
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<GuestStatus | 'all'>('all')

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/guests')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setLoadError(body.error || `שגיאה בטעינת מוזמנים (${res.status})`)
        return
      }
      setGuests(await res.json())
      setLoadError('')
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'שגיאת חיבור לשרת')
    }
  }, [])

  useEffect(() => { load() }, [load])

  const [bulkUpdating, setBulkUpdating] = useState(false)

  async function handleSave(name: string, phone: string) {
    const url = editGuest ? `/api/guests/${editGuest.id}` : '/api/guests'
    const method = editGuest ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, phone }) })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || `שגיאה ${res.status}`)
    }
    await load(); setShowForm(false); setEditGuest(undefined)
  }

  async function handleDelete(id: string) {
    if (!confirm('למחוק את המוזמן?')) return
    await fetch(`/api/guests/${id}`, { method: 'DELETE' })
    await load()
  }

  async function handleBulkToInfo() {
    if (!confirm('האם אתה בטוח שברצונך להפוך את כל המוזמנים הקיימים לשליחת הזמנה בלבד (ללא אישור הגעה)?')) return
    setBulkUpdating(true)
    try {
      const res = await fetch('/api/guests', { method: 'PUT' })
      if (!res.ok) throw new Error('שגיאה בעדכון')
      const data = await res.json()
      alert(`עודכנו בהצלחה ${data.updated} מוזמנים להזמנה בלבד.`)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'שגיאה בעדכון')
    } finally {
      setBulkUpdating(false)
    }
  }

  const q = search.trim().toLowerCase()
  const filtered = guests.filter(g =>
    (filter === 'all' || g.status === filter) &&
    (!q || g.name.toLowerCase().includes(q) || g.phone.includes(q))
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">ניהול מוזמנים</h1>
        <div className="flex gap-2">
          {guests.some(g => !g.phone.includes('#info')) && (
            <button onClick={handleBulkToInfo} disabled={bulkUpdating}
              className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 px-4 py-2 rounded-xl font-bold text-sm transition-colors disabled:opacity-50">
              {bulkUpdating ? 'מעדכן...' : 'הפוך את כולם להזמנה בלבד 📱'}
            </button>
          )}
          <button onClick={() => { setEditGuest(undefined); setShowForm(true) }}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors">
            + הוסף מוזמן
          </button>
        </div>
      </div>

      {loadError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-sm text-red-300" dir="rtl">
          ⚠️ שגיאה: {loadError}
        </div>
      )}

      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
          <h2 className="font-bold text-slate-200 mb-4">{editGuest ? 'עריכת מוזמן' : 'מוזמן חדש'}</h2>
          <GuestForm guest={editGuest} onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditGuest(undefined) }} />
        </div>
      )}

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <h2 className="font-bold text-slate-200 ml-auto">רשימת מוזמנים ({filtered.length}{filtered.length !== guests.length ? ` מתוך ${guests.length}` : ''})</h2>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 חיפוש שם או טלפון..."
            className="border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 w-48"
            dir="rtl"
          />
          <button onClick={() => exportCsv(filtered)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
            ⬇️ ייצוא CSV
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                filter === f.key ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}>
              {f.label}{f.key !== 'all' ? ` (${guests.filter(g => g.status === f.key).length})` : ''}
            </button>
          ))}
        </div>
        <GuestTable guests={filtered} onEdit={g => { setEditGuest(g); setShowForm(true) }} onDelete={handleDelete} />
      </div>
    </div>
  )
}
