'use client'
import { useState } from 'react'
import { Guest } from '@/lib/types'

interface Props {
  guest?: Guest
  onSave: (name: string, phone: string) => Promise<void>
  onCancel: () => void
}

export default function GuestForm({ guest, onSave, onCancel }: Props) {
  const [name, setName] = useState(guest?.name ?? '')
  const [phone, setPhone] = useState(guest?.phone ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) { setError('נא למלא שם וטלפון'); return }
    setLoading(true); setError('')
    try { await onSave(name.trim(), phone.trim()) }
    catch { setError('שגיאה בשמירה. נסה שוב.') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" dir="rtl">
      <div>
        <label className="text-sm font-medium text-stone-700 block mb-1">שם המוזמן / משפחה</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="משפחת כהן"
          className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-right focus:outline-none focus:ring-2 focus:ring-amber-400"
          dir="rtl" autoFocus />
      </div>
      <div>
        <label className="text-sm font-medium text-stone-700 block mb-1">מספר טלפון</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="0501234567"
          className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-amber-400"
          dir="ltr" type="tel" />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={loading}
          className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg py-2.5 font-bold transition-colors">
          {loading ? 'שומר...' : guest ? 'עדכן' : 'הוסף מוזמן'}
        </button>
        <button type="button" onClick={onCancel}
          className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg py-2.5 font-medium transition-colors">
          ביטול
        </button>
      </div>
    </form>
  )
}
