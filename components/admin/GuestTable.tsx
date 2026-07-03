'use client'
import { useEffect, useState } from 'react'
import { Guest, GuestStatus, InvitationConfig } from '@/lib/types'
import { LOCAL_SERVER, buildWaText, checkLocalServer, markSent, openWa, pickTemplate } from '@/lib/wa'

const STATUS_BADGE: Record<GuestStatus, string> = {
  coming:     'bg-emerald-500/15 text-emerald-300',
  not_coming: 'bg-red-500/15 text-red-400',
  maybe:      'bg-amber-500/15 text-amber-300',
  pending:    'bg-slate-700/60 text-slate-300',
}
const STATUS_LABEL: Record<GuestStatus, string> = {
  coming:     'מגיע ✓',
  not_coming: 'לא אוכל',
  maybe:      'לא בטוח',
  pending:    'ממתין',
}

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
  const [serverOnline, setServerOnline] = useState(false)

  useEffect(() => {
    let active = true
    const check = () => checkLocalServer().then(ok => { if (active) setServerOnline(ok) })
    check()
    const id = setInterval(check, 10000)
    return () => { active = false; clearInterval(id) }
  }, [])

  function send(guestId: string, mode: 'invite' | 'reminder') {
    setErrorMap(prev => { const e = { ...prev }; delete e[guestId]; return e })

    if (!serverOnline) {
      // No local server — open WhatsApp directly with the prepared message (works from the phone)
      const guest = guests.find(g => g.id === guestId)
      const template = pickTemplate(config, mode)
      if (!guest || !template) {
        setStatusMap(prev => ({ ...prev, [guestId]: 'error' }))
        setErrorMap(prev => ({ ...prev, [guestId]: 'לא הוגדר נוסח הודעה — מלא בלשונית "הזמנה"' }))
        return
      }
      openWa(guest.phone, buildWaText(template, guest, window.location.origin))
      markSent(guestId, mode)
      setStatusMap(prev => ({ ...prev, [guestId]: 'sent' }))
      return
    }

    sendViaServer(guestId, mode)
  }

  async function sendViaServer(guestId: string, mode: 'invite' | 'reminder') {
    setStatusMap(prev => ({ ...prev, [guestId]: 'loading' }))
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
      if (msg.includes('fetch')) {
        setServerOnline(false)
        setErrorMap(prev => ({ ...prev, [guestId]: 'השרת נותק — לחץ שוב לשליחה דרך ווטסאפ' }))
      } else {
        setErrorMap(prev => ({ ...prev, [guestId]: msg }))
      }
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
      <div className="text-center py-12 text-slate-400">
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

        const cleanPhone = guest.phone.split('#')[0]
        const isInfoOnly = guest.phone.includes('#info')

        return (
          <div key={guest.id} className={`flex items-start gap-2 p-3 border rounded-xl transition-colors ${isConfirming ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-900 border-slate-800 hover:border-slate-600'}`}>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-100 truncate text-sm flex items-center gap-1.5">
                {guest.name}
                {isInfoOnly && (
                  <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-normal">
                    הזמנה בלבד
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400" dir="ltr">{cleanPhone}</div>
              {guest.responded_at && (
                <div className="text-xs text-slate-500 mt-0.5">
                  אישר/ה {new Date(guest.responded_at).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
              {guest.status === 'coming' && (guest.party_size ?? 1) > 1 && (
                <div className="text-xs text-emerald-400 font-bold mt-0.5">👥 {guest.party_size} מגיעים</div>
              )}
              {guest.rsvp_note && (
                <div className="text-xs text-slate-400 mt-0.5 truncate" title={guest.rsvp_note}>💬 {guest.rsvp_note}</div>
              )}
              {s === 'error' && <div className="text-red-400 text-xs mt-0.5 truncate">{errorMap[guest.id]}</div>}
              {isConfirming && (
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-red-400 text-xs font-medium">למחוק את {guest.name}?</span>
                  <button
                    onClick={() => handleDelete(guest.id)}
                    disabled={isDeleting}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? '...' : 'מחק'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1"
                  >
                    ביטול
                  </button>
                </div>
              )}
            </div>

            <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${
              isInfoOnly && guest.status === 'pending'
                ? 'bg-amber-500/15 text-amber-300'
                : STATUS_BADGE[guest.status]
            }`}>
              {isInfoOnly && guest.status === 'pending' ? 'הזמנה בלבד' : STATUS_LABEL[guest.status]}
            </span>

            {(showInvite || showReminder) && !isConfirming && (
              s === 'sent' ? (
                <span className="text-xs text-emerald-400 font-bold px-2 py-1.5 flex-shrink-0">✓ נשלח</span>
              ) : isConfirmingResend ? (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-amber-400 text-xs font-medium whitespace-nowrap">נשלח כבר — שלח שוב?</span>
                  <button
                    onClick={() => { setConfirmResend(null); send(guest.id, 'invite') }}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded-lg"
                  >כן</button>
                  <button
                    onClick={() => setConfirmResend(null)}
                    className="text-slate-400 hover:text-slate-200 text-xs px-1.5 py-1"
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
                className="text-slate-400 hover:text-slate-200 transition-colors text-sm p-1 flex-shrink-0"
              >
                ✏️
              </button>
            )}

            {onDelete && !isConfirming && (
              <button
                onClick={() => setConfirmDelete(guest.id)}
                className="text-slate-500 hover:text-red-400 transition-colors text-sm p-1 flex-shrink-0"
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
