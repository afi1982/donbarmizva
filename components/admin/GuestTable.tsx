'use client'
import { useState } from 'react'
import { Guest, GuestStatus, InvitationConfig } from '@/lib/types'

const STATUS_BADGE: Record<GuestStatus, string> = {
  coming:     'bg-emerald-100 text-emerald-700',
  not_coming: 'bg-red-100 text-red-600',
  maybe:      'bg-amber-100 text-amber-700',
  pending:    'bg-slate-100 text-slate-500',
}
const STATUS_LABEL: Record<GuestStatus, string> = {
  coming:     'מגיע ✓',
  not_coming: 'לא אוכל',
  maybe:      'לא בטוח',
  pending:    'ממתין',
}

const LOCAL_SERVER = 'http://localhost:3333'
type SendStatus = 'idle' | 'loading' | 'sent' | 'error'

interface Props {
  guests: Guest[]
  config?: Partial<InvitationConfig> | null
  onEdit?: (guest: Guest) => void
  onDelete?: (id: string) => void
}

export default function GuestTable({ guests, config, onEdit, onDelete }: Props) {
  const [statusMap, setStatusMap] = useState<Record<string, SendStatus>>({})
  const [errorMap, setErrorMap] = useState<Record<string, string>>({})
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmResend, setConfirmResend] = useState<string | null>(null)

  async function send(guestId: string, mode: 'invite' | 'reminder') {
    setStatusMap(prev => ({ ...prev, [guestId]: 'loading' }))
    setErrorMap(prev => { const e = { ...prev }; delete e[guestId]; return e })
    try {
      const res = await fetch(`${LOCAL_SERVER}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId, mode }),
        signal: AbortSignal.timeout(15000),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'שגיאה')
      setStatusMap(prev => ({ ...prev, [guestId]: 'sent' }))
    } catch (err: unknown) {
      setStatusMap(prev => ({ ...prev, [guestId]: 'error' }))
      const msg = (err as Error).message
      setErrorMap(prev => ({
        ...prev,
        [guestId]: msg.includes('fetch') ? 'השרת לא פועל — הפעל שרת-ווצאפ.bat' : msg,
      }))
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    await onDelete?.(id)
    setDeleting(null)
    setConfirmDelete(null)
  }

  if (guests.length === 0) {
    return (
      <div className="text-center py-12 text-stone-400">
        <div className="text-4xl mb-2">👥</div>
        <p>אין מוזמנים עדיין. הוסף את הראשון!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {guests.map(guest => {
        const s = statusMap[guest.id] ?? 'idle'
        const showInvite = guest.status === 'pending' && !!config?.whatsapp_message
        const showReminder = guest.status === 'maybe' && !!config?.reminder_message
        const isConfirming = confirmDelete === guest.id
        const isDeleting = deleting === guest.id
        const isConfirmingResend = confirmResend === guest.id
        const alreadyInvited = !!guest.invited_at

        return (
          <div key={guest.id} className={`flex items-start gap-2 p-3 border rounded-xl transition-colors ${isConfirming ? 'bg-red-50 border-red-200' : 'bg-white border-stone-100 hover:border-stone-200'}`}>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-stone-800 truncate text-sm">{guest.name}</div>
              <div className="text-xs text-stone-400" dir="ltr">{guest.phone}</div>
              {guest.responded_at && (
                <div className="text-xs text-stone-300 mt-0.5">
                  אישר/ה {new Date(guest.responded_at).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
              {s === 'error' && <div className="text-red-400 text-xs mt-0.5 truncate">{errorMap[guest.id]}</div>}
              {isConfirming && (
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-red-600 text-xs font-medium">למחוק את {guest.name}?</span>
                  <button
                    onClick={() => handleDelete(guest.id)}
                    disabled={isDeleting}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? '...' : 'מחק'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="text-stone-500 hover:text-stone-700 text-xs px-2 py-1"
                  >
                    ביטול
                  </button>
                </div>
              )}
            </div>

            <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${STATUS_BADGE[guest.status]}`}>
              {STATUS_LABEL[guest.status]}
            </span>

            {(showInvite || showReminder) && !isConfirming && (
              s === 'sent' ? (
                <span className="text-xs text-emerald-600 font-bold px-2 py-1.5 flex-shrink-0">✓ נשלח</span>
              ) : isConfirmingResend ? (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-amber-600 text-xs font-medium whitespace-nowrap">נשלח כבר — שלח שוב?</span>
                  <button
                    onClick={() => { setConfirmResend(null); send(guest.id, 'invite') }}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded-lg"
                  >כן</button>
                  <button
                    onClick={() => setConfirmResend(null)}
                    className="text-stone-400 hover:text-stone-600 text-xs px-1.5 py-1"
                  >ביטול</button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (showInvite && alreadyInvited && s === 'idle') {
                      setConfirmResend(guest.id)
                    } else {
                      send(guest.id, showInvite ? 'invite' : 'reminder')
                    }
                  }}
                  disabled={s === 'loading'}
                  className={`text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex-shrink-0 disabled:opacity-60 ${
                    s === 'error' ? 'bg-red-400 hover:bg-red-500' :
                    showInvite ? 'bg-green-500 hover:bg-green-600' : 'bg-amber-500 hover:bg-amber-600'
                  }`}
                >
                  {s === 'loading' ? '⏳' : s === 'error' ? '↻' : showInvite ? '📱 שלח' : '🔔 תזכורת'}
                </button>
              )
            )}

            {onEdit && !isConfirming && (
              <button
                onClick={() => onEdit(guest)}
                className="text-stone-400 hover:text-stone-600 transition-colors text-sm p-1 flex-shrink-0"
              >
                ✏️
              </button>
            )}

            {onDelete && !isConfirming && (
              <button
                onClick={() => setConfirmDelete(guest.id)}
                className="text-stone-300 hover:text-red-400 transition-colors text-sm p-1 flex-shrink-0"
              >
                🗑️
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
