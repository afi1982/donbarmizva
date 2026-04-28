'use client'
import { useEffect, useState, useCallback } from 'react'
import { Guest } from '@/lib/types'

type Config = { whatsapp_message: string | null; reminder_message: string | null }
type SendStatus = 'idle' | 'loading' | 'sent' | 'error'
type ServerStatus = 'checking' | 'connected' | 'qr' | 'initializing' | 'error' | 'disconnected' | 'offline'

const LOCAL_SERVER = 'http://localhost:3333'

export default function SendPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking')
  const [statusMap, setStatusMap] = useState<Record<string, SendStatus>>({})
  const [errorMap, setErrorMap] = useState<Record<string, string>>({})
  const [bulkLoading, setBulkLoading] = useState<'invite' | 'reminder' | null>(null)
  const [bulkResult, setBulkResult] = useState<{ sent: number; failed: number; error?: string } | null>(null)

  const checkServer = useCallback(async () => {
    try {
      const res = await fetch(`${LOCAL_SERVER}/status`, { signal: AbortSignal.timeout(3000) })
      const data = await res.json()
      setServerStatus(data.status as ServerStatus)
    } catch {
      setServerStatus('offline')
    }
  }, [])

  useEffect(() => {
    Promise.all([
      fetch('/api/guests').then(r => r.json()),
      fetch('/api/config').then(r => r.json()),
    ]).then(([g, c]) => {
      setGuests(g)
      setConfig(c)
      setLoading(false)
    })
    checkServer()
    const interval = setInterval(checkServer, 5000)
    return () => clearInterval(interval)
  }, [checkServer])

  async function sendOne(guestId: string, mode: 'invite' | 'reminder') {
    setStatusMap(prev => ({ ...prev, [guestId]: 'loading' }))
    setErrorMap(prev => { const e = { ...prev }; delete e[guestId]; return e })
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

  async function sendAll(mode: 'invite' | 'reminder') {
    setBulkLoading(mode)
    setBulkResult(null)
    try {
      const res = await fetch(`${LOCAL_SERVER}/send-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'שגיאה')
      setBulkResult({ sent: data.sent, failed: data.failed })
      if (data.sent > 0) {
        const g = await fetch('/api/guests').then(r => r.json())
        setGuests(g)
      }
    } catch (err: unknown) {
      setBulkResult({ sent: 0, failed: -1, error: (err as Error).message })
    }
    setBulkLoading(null)
  }

  const pending = guests.filter(g => g.status === 'pending')
  const maybe = guests.filter(g => g.status === 'maybe' && !g.reminder_sent)

  function ServerBanner() {
    if (serverStatus === 'connected') {
      return (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-6 text-sm text-emerald-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          שרת WhatsApp פעיל ומחובר — ניתן לשלוח
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
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm" dir="rtl">
        <p className="font-bold text-red-800 mb-2">⚠️ שרת WhatsApp לא פעיל</p>
        <p className="text-red-600 mb-2">כדי לשלוח הודעות, הפעל את השרת המקומי:</p>
        <ol className="list-decimal list-inside space-y-1 text-red-700">
          <li>פתח את תיקיית <code className="bg-red-100 px-1 rounded font-mono">scripts</code></li>
          <li>לחץ פעמיים על <strong>שרת-ווצאפ.bat</strong></li>
          <li>סרוק QR עם הטלפון (פעם ראשונה בלבד)</li>
          <li>חזור לכאן ולחץ שלח</li>
        </ol>
      </div>
    )
  }

  if (loading) return <div className="text-stone-400 text-sm">טוען...</div>

  const canSend = serverStatus === 'connected'

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-bold text-stone-800 mb-1">שליחת הזמנות</h1>
      <p className="text-stone-400 text-sm mb-6">ההודעות נשלחות ישירות מהטלפון שלך ברקע</p>

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
          {pending.length > 1 && canSend && (
            <button
              onClick={() => sendAll('invite')}
              disabled={bulkLoading === 'invite'}
              className="text-xs bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg transition-colors"
            >
              {bulkLoading === 'invite' ? '⏳ שולח...' : `שלח לכולם (${pending.length})`}
            </button>
          )}
        </div>
        <p className="text-stone-400 text-xs mb-4">{pending.length} מוזמנים ממתינים</p>

        {bulkResult && bulkLoading === null && (
          <div className={`rounded-lg p-3 mb-3 text-sm ${bulkResult.error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
            {bulkResult.error
              ? `❌ שגיאה: ${bulkResult.error}`
              : `✅ נשלחו ${bulkResult.sent} הודעות${bulkResult.failed > 0 ? `, ${bulkResult.failed} נכשלו` : ''}`}
          </div>
        )}

        {pending.length === 0 ? (
          <p className="text-stone-300 text-sm text-center py-4">אין מוזמנים ממתינים</p>
        ) : (
          <div className="space-y-2">
            {pending.map(guest => {
              const s = statusMap[guest.id] ?? 'idle'
              return (
                <div key={guest.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                  <div>
                    <p className="font-medium text-stone-800 text-sm">{guest.name}</p>
                    <p className="text-stone-400 text-xs" dir="ltr">{guest.phone}</p>
                    {s === 'error' && <p className="text-red-500 text-xs mt-0.5">{errorMap[guest.id]}</p>}
                  </div>
                  <button
                    onClick={() => sendOne(guest.id, 'invite')}
                    disabled={!canSend || s === 'loading' || s === 'sent'}
                    className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
                      s === 'sent' ? 'bg-emerald-100 text-emerald-700 cursor-default' :
                      s === 'error' ? 'bg-red-100 text-red-600 hover:bg-red-200' :
                      s === 'loading' ? 'bg-green-300 text-white' :
                      canSend ? 'bg-green-500 hover:bg-green-600 text-white' :
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
          {maybe.length > 1 && canSend && (
            <button
              onClick={() => sendAll('reminder')}
              disabled={bulkLoading === 'reminder'}
              className="text-xs bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg transition-colors"
            >
              {bulkLoading === 'reminder' ? '⏳ שולח...' : `שלח לכולם (${maybe.length})`}
            </button>
          )}
        </div>
        <p className="text-stone-400 text-xs mb-4">{maybe.length} מוזמנים שטרם אישרו</p>

        {maybe.length === 0 ? (
          <p className="text-stone-300 text-sm text-center py-4">אין מוזמנים לתזכורת</p>
        ) : (
          <div className="space-y-2">
            {maybe.map(guest => {
              const s = statusMap[guest.id] ?? 'idle'
              return (
                <div key={guest.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                  <div>
                    <p className="font-medium text-stone-800 text-sm">{guest.name}</p>
                    <p className="text-stone-400 text-xs" dir="ltr">{guest.phone}</p>
                    {s === 'error' && <p className="text-red-500 text-xs mt-0.5">{errorMap[guest.id]}</p>}
                  </div>
                  <button
                    onClick={() => sendOne(guest.id, 'reminder')}
                    disabled={!canSend || s === 'loading' || s === 'sent'}
                    className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
                      s === 'sent' ? 'bg-emerald-100 text-emerald-700 cursor-default' :
                      s === 'error' ? 'bg-red-100 text-red-600 hover:bg-red-200' :
                      s === 'loading' ? 'bg-amber-300 text-white' :
                      canSend ? 'bg-amber-500 hover:bg-amber-600 text-white' :
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
