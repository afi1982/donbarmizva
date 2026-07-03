'use client'
import { useState } from 'react'
import { Guest } from '@/lib/types'

interface Props {
  guest?: Guest
  onSave: (name: string, phone: string) => Promise<void>
  onCancel: () => void
}

export default function GuestForm({ guest, onSave, onCancel }: Props) {
  const initialPhone = guest?.phone ?? ''
  const isInfo = initialPhone.includes('#info')
  const rawPhone = isInfo ? initialPhone.split('#')[0] : initialPhone

  const [name, setName] = useState(guest?.name ?? '')
  const [phone, setPhone] = useState(rawPhone)
  const [infoOnly, setInfoOnly] = useState(isInfo)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) { setError('נא למלא שם וטלפון'); return }
    setLoading(true); setError('')
    try {
      const finalPhone = phone.trim() + (infoOnly ? '#info' : '')
      await onSave(name.trim(), finalPhone)
    }
    catch (e) { setError(e instanceof Error ? e.message : 'שגיאה בשמירה. נסה שוב.') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" dir="rtl">
      <div>
        <label className="text-sm font-medium text-slate-200 block mb-1">שם המוזמן / משפחה</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="משפחת כהן"
          className="w-full border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 rounded-lg px-4 py-2.5 text-right focus:outline-none focus:ring-2 focus:ring-amber-400"
          dir="rtl" autoFocus />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-200 block mb-1">מספר טלפון</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="0501234567"
          className="w-full border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 rounded-lg px-4 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-amber-400"
          dir="ltr" type="tel" />
      </div>
      <div className="flex items-center gap-2 py-1">
        <input
          type="checkbox"
          id="infoOnly"
          checked={infoOnly}
          onChange={e => setInfoOnly(e.target.checked)}
          className="h-4.5 w-4.5 rounded border-slate-600 text-amber-400 focus:ring-amber-400"
        />
        <label htmlFor="infoOnly" className="text-sm font-medium text-slate-200 select-none">
          שליחת הזמנה בלבד ללא אישור הגעה (מידע בלבד)
        </label>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={loading}
          className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg py-2.5 font-bold transition-colors">
          {loading ? 'שומר...' : guest ? 'עדכן' : 'הוסף מוזמן'}
        </button>
        <button type="button" onClick={onCancel}
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg py-2.5 font-medium transition-colors">
          ביטול
        </button>
      </div>
    </form>
  )
}

