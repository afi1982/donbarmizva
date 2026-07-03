'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  token: string
  label?: string
  collapsed?: boolean
}

export default function RSVPButtons({ token, label, collapsed = false }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(!collapsed)
  const [comingStep, setComingStep] = useState(false)
  const [partySize, setPartySize] = useState(1)
  const [note, setNote] = useState('')
  const router = useRouter()

  async function respond(status: 'coming' | 'not_coming' | 'maybe') {
    setLoading(status)
    const res = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        status,
        party_size: status === 'coming' ? partySize : undefined,
        note: status === 'coming' ? note : undefined,
      }),
    })
    if (res.ok) {
      const redirect = { coming: 'confirmed', not_coming: 'declined', maybe: 'maybe' }[status]
      router.push(`/${redirect}/${token}`)
    } else {
      setLoading(null)
    }
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-xs underline transition-colors"
        style={{ color: '#b8963e' }}
      >
        {label || 'שינוי תשובה'}
      </button>
    )
  }

  if (comingStep) {
    return (
      <div className="flex flex-col gap-3 w-full max-w-xs mx-auto" dir="rtl">
        <p className="font-bold text-sm" style={{ color: '#3a3a3a' }}>כמה תגיעו בסך הכל?</p>
        <div className="flex flex-wrap justify-center gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <button
              key={n}
              onClick={() => setPartySize(n)}
              className="w-10 h-10 rounded-full font-bold text-sm transition-all"
              style={partySize === n
                ? { background: 'linear-gradient(135deg, #2d6a4f, #40916c)', color: '#fff', boxShadow: '0 2px 8px rgba(45,106,79,0.35)' }
                : { color: '#5a5347', border: '1.5px solid #d5cfc3', background: '#fff' }}
            >
              {n}
            </button>
          ))}
        </div>
        {partySize >= 8 && (
          <div className="flex items-center justify-center gap-2 text-sm" style={{ color: '#5a5347' }}>
            <button onClick={() => setPartySize(p => Math.max(8, p - 1))}
              className="w-8 h-8 rounded-full font-bold" style={{ border: '1.5px solid #d5cfc3' }}>−</button>
            <span className="font-bold w-8 text-center">{partySize}</span>
            <button onClick={() => setPartySize(p => Math.min(50, p + 1))}
              className="w-8 h-8 rounded-full font-bold" style={{ border: '1.5px solid #d5cfc3' }}>+</button>
          </div>
        )}
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="הערה (לא חובה) — למשל: כשר, צמחוני, הגעה מאוחרת..."
          className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none resize-none"
          style={{ border: '1.5px solid #d5cfc3', background: '#fffdf8', color: '#3a3a3a' }}
        />
        <button onClick={() => respond('coming')} disabled={!!loading}
          className="w-full py-3.5 rounded-full font-bold text-white text-sm transition-all disabled:opacity-60 shadow-md"
          style={{ background: 'linear-gradient(135deg, #2d6a4f, #40916c)' }}>
          {loading === 'coming' ? '...' : `✓  אישור הגעה (${partySize})`}
        </button>
        <button onClick={() => setComingStep(false)} className="text-xs transition-colors" style={{ color: '#9a8e7a' }}>
          חזרה
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-xs mx-auto" dir="rtl">
      <button onClick={() => setComingStep(true)} disabled={!!loading}
        className="w-full py-3.5 rounded-full font-bold text-white text-sm transition-all disabled:opacity-60 shadow-md"
        style={{ background: 'linear-gradient(135deg, #2d6a4f, #40916c)' }}>
        ✓  מגיע בשמחה!
      </button>
      <button onClick={() => respond('maybe')} disabled={!!loading}
        className="w-full py-3.5 rounded-full font-bold text-sm transition-all disabled:opacity-60"
        style={{ color: '#5a5347', border: '2px dashed #c4b48a', background: 'rgba(232, 201, 122, 0.08)' }}>
        {loading === 'maybe' ? '...' : '🤔  עדיין לא בטוח'}
      </button>
      <button onClick={() => respond('not_coming')} disabled={!!loading}
        className="w-full py-3 rounded-full font-medium text-sm transition-all disabled:opacity-60"
        style={{ color: '#9a8e7a', border: '1px solid #d5cfc3' }}>
        {loading === 'not_coming' ? '...' : '✕  לא אוכל להגיע'}
      </button>
      {collapsed && (
        <button
          onClick={() => setExpanded(false)}
          className="text-xs mt-1 transition-colors"
          style={{ color: '#9a8e7a' }}
        >
          ביטול
        </button>
      )}
    </div>
  )
}
