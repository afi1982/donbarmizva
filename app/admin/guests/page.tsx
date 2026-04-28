'use client'
import { useEffect, useState, useCallback } from 'react'
import { Guest } from '@/lib/types'
import GuestForm from '@/components/admin/GuestForm'
import GuestTable from '@/components/admin/GuestTable'

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editGuest, setEditGuest] = useState<Guest | undefined>()

  const load = useCallback(async () => {
    const res = await fetch('/api/guests')
    if (res.ok) setGuests(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-800">ניהול מוזמנים</h1>
        <button onClick={() => { setEditGuest(undefined); setShowForm(true) }}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors">
          + הוסף מוזמן
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-6">
          <h2 className="font-bold text-stone-700 mb-4">{editGuest ? 'עריכת מוזמן' : 'מוזמן חדש'}</h2>
          <GuestForm guest={editGuest} onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditGuest(undefined) }} />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-stone-200 p-4">
        <h2 className="font-bold text-stone-700 mb-4">רשימת מוזמנים ({guests.length})</h2>
        <GuestTable guests={guests} onEdit={g => { setEditGuest(g); setShowForm(true) }} onDelete={handleDelete} />
      </div>
    </div>
  )
}
