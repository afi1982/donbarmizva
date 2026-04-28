'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RSVPButtons({ token }: { token: string }) {
  const [loading, setLoading] = useState<string | null>(null)
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

  return (
    <div className="flex flex-col gap-3 w-full max-w-xs mx-auto" dir="rtl">
      <button onClick={() => respond('coming')} disabled={!!loading}
        className="w-full py-3.5 rounded-full font-bold text-white text-sm transition-all bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-60 shadow-md shadow-emerald-200">
        {loading === 'coming' ? '...' : '✓  מגיע בשמחה!'}
      </button>
      <button onClick={() => respond('maybe')} disabled={!!loading}
        className="w-full py-3.5 rounded-full font-bold text-stone-600 text-sm transition-all border-2 border-dashed border-amber-300 bg-amber-50/60 hover:bg-amber-100/60 disabled:opacity-60">
        {loading === 'maybe' ? '...' : '🤔  עדיין לא בטוח'}
      </button>
      <button onClick={() => respond('not_coming')} disabled={!!loading}
        className="w-full py-3 rounded-full font-medium text-stone-400 text-sm transition-all border border-stone-200 hover:bg-stone-100 disabled:opacity-60">
        {loading === 'not_coming' ? '...' : '✕  לא אוכל להגיע'}
      </button>
    </div>
  )
}
