'use client'
import { useState } from 'react'

const LOCAL_SERVER = 'http://localhost:3333'

export default function SendAllButton({ mode, count, alreadyInvited = 0 }: { mode: 'invite' | 'reminder'; count: number; alreadyInvited?: number }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<string>('')
  const [confirming, setConfirming] = useState(false)

  if (count === 0 && alreadyInvited === 0) return null

  async function sendAll() {
    setConfirming(false)
    setState('loading')
    setResult('')
    try {
      const res = await fetch(`${LOCAL_SERVER}/send-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
        signal: AbortSignal.timeout(120000),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'שגיאה')
      setResult(`✅ נשלחו ${data.sent}${data.failed > 0 ? `, ${data.failed} נכשלו` : ''}`)
      setState('done')
    } catch (err: unknown) {
      const msg = (err as Error).message
      setResult(msg.includes('fetch') ? 'השרת לא פועל — הפעל שרת-ווצאפ.bat' : msg)
      setState('error')
    }
  }

  if (confirming && alreadyInvited > 0) {
    return (
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
        <span className="text-xs text-amber-700 font-medium">
          {alreadyInvited} מוזמנים כבר קיבלו הזמנה. לשלוח רק ל-{count} הנותרים?
        </span>
        <button onClick={sendAll} className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">כן</button>
        <button onClick={() => setConfirming(false)} className="text-stone-400 hover:text-stone-600 text-xs px-1.5 py-1">ביטול</button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {result && (
        <span className={`text-xs ${state === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
          {result}
        </span>
      )}
      {count > 0 && (
        <button
          onClick={() => alreadyInvited > 0 ? setConfirming(true) : sendAll()}
          disabled={state === 'loading'}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors text-white disabled:opacity-50 ${
            mode === 'reminder' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {state === 'loading'
            ? '⏳ שולח...'
            : mode === 'reminder'
            ? `🔔 שלח תזכורת לכולם (${count})`
            : `📱 שלח לכולם (${count})`}
        </button>
      )}
    </div>
  )
}
