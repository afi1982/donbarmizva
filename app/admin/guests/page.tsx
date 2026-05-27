'use client'
import { useEffect, useState, useCallback } from 'react'
import { Guest } from '@/lib/types'
import GuestForm from '@/components/admin/GuestForm'
import GuestTable from '@/components/admin/GuestTable'

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editGuest, setEditGuest] = useState<Guest | undefined>()
  const [loadError, setLoadError] = useState('')

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-800">ניהול מוזמנים</h1>
        <div className="flex gap-2">
          {guests.some(g => !g.phone.includes('#info')) && (
            <button onClick={handleBulkToInfo} disabled={bulkUpdating}
              className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-xl font-bold text-sm transition-colors disabled:opacity-50">
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
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-800" dir="rtl">
          ⚠️ שגיאה: {loadError}
        </div>
      )}

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
