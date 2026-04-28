'use client'
import { useEffect, useState } from 'react'
import { Guest } from '@/lib/types'

type Config = { whatsapp_message: string | null; reminder_message: string | null }

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('972')) return digits
  if (digits.startsWith('0')) return '972' + digits.slice(1)
  return digits
}

function buildMessage(template: string, guest: Guest, baseUrl: string) {
  return template
    .replace(/{name}/g, guest.name)
    .replace(/{link}/g, `${baseUrl}/rsvp/${guest.token}`)
}

export default function SendPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [config, setConfig] = useState<Config | null>(null)
  const [sent, setSent] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const baseUrl = 'https://donbarmizva.vercel.app'

  useEffect(() => {
    Promise.all([
      fetch('/api/guests').then(r => r.json()),
      fetch('/api/config').then(r => r.json()),
    ]).then(([g, c]) => {
      setGuests(g)
      setConfig(c)
      setLoading(false)
    })
  }, [])

  async function markSent(guestId: string) {
    setSent(prev => new Set([...prev, guestId]))
  }

  function sendWhatsApp(guest: Guest, mode: 'invite' | 'reminder') {
    const template = mode === 'reminder' ? config?.reminder_message : config?.whatsapp_message
    if (!template) {
      alert('נוסח ההודעה ריק. עדכן אותו בלשונית "הזמנה".')
      return
    }
    const message = buildMessage(template, guest, baseUrl)
    const phone = normalizePhone(guest.phone)
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
    markSent(guest.id)
  }

  const pending = guests.filter(g => g.status === 'pending' && !sent.has(g.id))
  const maybe = guests.filter(g => g.status === 'maybe' && !g.reminder_sent && !sent.has(g.id))

  if (loading) return <div className="text-stone-400 text-sm">טוען...</div>

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-bold text-stone-800 mb-1">שליחת הזמנות</h1>
      <p className="text-stone-400 text-sm mb-8">לחץ על כפתור הוואטסאפ ליד כל מוזמן — תועבר לשיחה עם ההודעה מוכנה לשליחה</p>

      {!config?.whatsapp_message && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
          ⚠️ לא הוגדר נוסח הודעה. לך ללשונית <strong>הזמנה</strong> ומלא את שדה &quot;הודעת WhatsApp&quot;.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-6">
        <h2 className="font-bold text-stone-800 mb-1">📤 הזמנות ראשוניות</h2>
        <p className="text-stone-400 text-xs mb-4">{pending.length} מוזמנים ממתינים</p>

        {pending.length === 0 ? (
          <p className="text-stone-300 text-sm text-center py-4">אין מוזמנים ממתינים</p>
        ) : (
          <div className="space-y-2">
            {pending.map(guest => (
              <div key={guest.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                <div>
                  <p className="font-medium text-stone-800 text-sm">{guest.name}</p>
                  <p className="text-stone-400 text-xs" dir="ltr">{guest.phone}</p>
                </div>
                <button
                  onClick={() => sendWhatsApp(guest, 'invite')}
                  className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
                >
                  📱 שלח
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-amber-100 p-5">
        <h2 className="font-bold text-stone-800 mb-1">🔔 תזכורות ל&quot;לא בטוח&quot;</h2>
        <p className="text-stone-400 text-xs mb-4">{maybe.length} מוזמנים שטרם אישרו</p>

        {maybe.length === 0 ? (
          <p className="text-stone-300 text-sm text-center py-4">אין מוזמנים לתזכורת</p>
        ) : (
          <div className="space-y-2">
            {maybe.map(guest => (
              <div key={guest.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                <div>
                  <p className="font-medium text-stone-800 text-sm">{guest.name}</p>
                  <p className="text-stone-400 text-xs" dir="ltr">{guest.phone}</p>
                </div>
                <button
                  onClick={() => sendWhatsApp(guest, 'reminder')}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  🔔 תזכורת
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
