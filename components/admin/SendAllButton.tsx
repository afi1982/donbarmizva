'use client'
import { useState } from 'react'

const LOCAL_SERVER = 'http://localhost:3333'

export default function SendAllButton({ mode, count }: { mode: 'invite' | 'reminder'; count: number }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<string>('')

  if (count === 0) return null

  async function sendAll() {
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

  return (
    <div className="flex items-center gap-2">
      {result && (
        <span className={`text-xs ${state === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
          {result}
        </span>
      )}
      <button
        onClick={sendAll}
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
    </div>
  )
}
