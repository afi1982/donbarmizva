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
  const router = useRouter()

  async function respond(status: 'coming' | 'not_coming' | 'maybe') {
    setLoading(status)
    const res = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, status }),
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

  return (
    <div className="flex flex-col gap-3 w-full max-w-xs mx-auto" dir="rtl">
      <button onClick={() => respond('coming')} disabled={!!loading}
        className="w-full py-3.5 rounded-full font-bold text-white text-sm transition-all disabled:opacity-60 shadow-md"
        style={{ background: 'linear-gradient(135deg, #2d6a4f, #40916c)' }}>
        {loading === 'coming' ? '...' : '✓  מגיע בשמחה!'}
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
