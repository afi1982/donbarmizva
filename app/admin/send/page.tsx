'use client'
import { useEffect, useState, useCallback } from 'react'
import { Guest } from '@/lib/types'
import SendAllButton from '@/components/admin/SendAllButton'
import { LOCAL_SERVER, buildWaText, markSent, openWa, pickTemplate } from '@/lib/wa'

type Config = { whatsapp_message: string | null; reminder_message: string | null }
type SendStatus = 'idle' | 'loading' | 'sent' | 'error'
type ServerStatus = 'checking' | 'connected' | 'qr' | 'initializing' | 'error' | 'disconnected' | 'offline'

export default function SendPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking')
  const [statusMap, setStatusMap] = useState<Record<string, SendStatus>>({})
  const [errorMap, setErrorMap] = useState<Record<string, string>>({})

  const checkServer = useCallback(async () => {
    try {
      const res = await fetch(`${LOCAL_SERVER}/status`, { signal: AbortSignal.timeout(3000) })
      const data = await res.json()
      setServerStatus(data.status as ServerStatus)
    } catch {
      setServerStatus('offline')
    }
  }, [])

  const loadGuests = useCallback(async () => {
    try {
      const res = await fetch('/api/guests', { cache: 'no-store' })
      if (res.ok) {
        const g = await res.json()
        setGuests(Array.isArray(g) ? g : [])
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    Promise.all([
      fetch('/api/guests').then(r => { if (!r.ok) throw new Error(`guests: ${r.status}`); return r.json() }).catch(() => []),
      fetch('/api/config').then(r => { if (!r.ok) throw new Error(`config: ${r.status}`); return r.json() }).catch(() => ({ id: 1 })),
    ]).then(([g, c]) => {
      setGuests(Array.isArray(g) ? g : [])
      setConfig(c)
      setLoading(false)
    })
    checkServer()
    const interval = setInterval(checkServer, 5000)
    return () => clearInterval(interval)
  }, [checkServer])

  const serverConnected = serverStatus === 'connected'

  function sendOne(guestId: string, mode: 'invite' | 'reminder') {
    setErrorMap(prev => { const e = { ...prev }; delete e[guestId]; return e })

    if (!serverConnected) {
      // Phone mode — open WhatsApp with the prepared message, no local server needed
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

    sendOneViaServer(guestId, mode)
  }

  async function sendOneViaServer(guestId: string, mode: 'invite' | 'reminder') {
    setStatusMap(prev => ({ ...prev, [guestId]: 'loading' }))
    try {
      const res = await fetch(`${LOCAL_SERVER}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId, mode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'שגיאה בשליחה')
      setStatusMap(prev => ({ ...prev, [guestId]: 'sent' }))
    } catch (err: unknown) {
      setStatusMap(prev => ({ ...prev, [guestId]: 'error' }))
      setErrorMap(prev => ({ ...prev, [guestId]: (err as Error).message }))
    }
  }

  const pending = guests.filter(g => g.status === 'pending')
  const pendingNotInvited = pending.filter(g => !g.invited_at)
  const alreadyInvited = pending.length - pendingNotInvited.length
  const maybe = guests.filter(g => g.status === 'maybe' && !g.reminder_sent)

  function ServerBanner() {
    if (serverConnected) {
      return (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-6 text-sm text-emerald-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          שרת WhatsApp פעיל ומחובר — ההודעות יישלחו אוטומטית עם תמונת ההזמנה
        </div>
      )
    }
    if (serverStatus === 'qr' || serverStatus === 'initializing') {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 text-sm text-amber-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
          ממתין לחיבור WhatsApp — סרוק את ה-QR בטרמינל
        </div>
      )
    }
    return (
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-6 text-sm" dir="rtl">
        <p className="font-bold text-sky-800 mb-1">📱 מצב שליחה מהטלפון</p>
        <p className="text-sky-700">
          לחיצה על &quot;שלח&quot; תפתח את ווטסאפ עם ההודעה והקישור האישי מוכנים — נשאר רק ללחוץ על חץ השליחה.
        </p>
        <p className="text-sky-600 text-xs mt-2">
          טיפ: לשליחה אוטומטית לכולם בבת אחת (כולל תמונת ההזמנה) אפשר להפעיל במחשב את <strong>שרת-ווצאפ.bat</strong>.
        </p>
      </div>
    )
  }

  if (loading) return <div className="text-stone-400 text-sm">טוען...</div>

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-bold text-stone-800 mb-1">שליחת הזמנות</h1>
      <p className="text-stone-400 text-sm mb-6">
        {serverConnected ? 'ההודעות נשלחות ישירות מהמחשב ברקע' : 'ההודעות נפתחות בווטסאפ — מוכנות לשליחה'}
      </p>

      <ServerBanner />

      {!config?.whatsapp_message && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
          ⚠️ לא הוגדר נוסח הודעה. לך ללשונית <strong>הזמנה</strong> ומלא את שדה &quot;הודעת WhatsApp&quot;.
        </div>
      )}

      {/* Invitations */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold text-stone-800">📤 הזמנות ראשוניות</h2>
          <SendAllButton mode="invite" guests={pendingNotInvited} alreadyInvited={alreadyInvited} config={config} onSent={loadGuests} />
        </div>
        <p className="text-stone-400 text-xs mb-4">{pending.length} מוזמנים ממתינים</p>

        {pending.length === 0 ? (
          <p className="text-stone-300 text-sm text-center py-4">אין מוזמנים ממתינים</p>
        ) : (
          <div className="space-y-2">
            {pending.map(guest => {
              const s = statusMap[guest.id] ?? 'idle'
              const hasTemplate = !!config?.whatsapp_message
              return (
                <div key={guest.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                  <div>
                    <p className="font-medium text-stone-800 text-sm flex items-center gap-1.5">
                      {guest.name}
                      {guest.phone.includes('#info') && (
                        <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-normal">
                          הזמנה בלבד
                        </span>
                      )}
                    </p>
                    <p className="text-stone-400 text-xs" dir="ltr">{guest.phone.split('#')[0]}</p>
                    {s === 'error' && <p className="text-red-500 text-xs mt-0.5">{errorMap[guest.id]}</p>}
                  </div>
                  <button
                    onClick={() => sendOne(guest.id, 'invite')}
                    disabled={!hasTemplate || s === 'loading' || s === 'sent'}
                    className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
                      s === 'sent' ? 'bg-emerald-100 text-emerald-700 cursor-default' :
                      s === 'error' ? 'bg-red-100 text-red-600 hover:bg-red-200' :
                      s === 'loading' ? 'bg-green-300 text-white' :
                      hasTemplate ? 'bg-green-500 hover:bg-green-600 text-white' :
                      'bg-stone-100 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    {s === 'loading' ? '⏳' : s === 'sent' ? '✓ נשלח' : s === 'error' ? '↻ שוב' : '📱 שלח'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Reminders */}
      <div className="bg-white rounded-2xl border border-amber-100 p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold text-stone-800">🔔 תזכורות ל&quot;לא בטוח&quot;</h2>
          <SendAllButton mode="reminder" guests={maybe} config={config} onSent={loadGuests} />
        </div>
        <p className="text-stone-400 text-xs mb-4">{maybe.length} מוזמנים שטרם אישרו</p>

        {maybe.length === 0 ? (
          <p className="text-stone-300 text-sm text-center py-4">אין מוזמנים לתזכורת</p>
        ) : (
          <div className="space-y-2">
            {maybe.map(guest => {
              const s = statusMap[guest.id] ?? 'idle'
              const hasTemplate = !!config?.reminder_message
              return (
                <div key={guest.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                  <div>
                    <p className="font-medium text-stone-800 text-sm flex items-center gap-1.5">
                      {guest.name}
                      {guest.phone.includes('#info') && (
                        <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-normal">
                          הזמנה בלבד
                        </span>
                      )}
                    </p>
                    <p className="text-stone-400 text-xs" dir="ltr">{guest.phone.split('#')[0]}</p>
                    {s === 'error' && <p className="text-red-500 text-xs mt-0.5">{errorMap[guest.id]}</p>}
                  </div>
                  <button
                    onClick={() => sendOne(guest.id, 'reminder')}
                    disabled={!hasTemplate || s === 'loading' || s === 'sent'}
                    className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
                      s === 'sent' ? 'bg-emerald-100 text-emerald-700 cursor-default' :
                      s === 'error' ? 'bg-red-100 text-red-600 hover:bg-red-200' :
                      s === 'loading' ? 'bg-amber-300 text-white' :
                      hasTemplate ? 'bg-amber-500 hover:bg-amber-600 text-white' :
                      'bg-stone-100 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    {s === 'loading' ? '⏳' : s === 'sent' ? '✓ נשלח' : s === 'error' ? '↻ שוב' : '🔔 תזכורת'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
