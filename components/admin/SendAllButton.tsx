'use client'
import { useEffect, useState } from 'react'
import { Guest } from '@/lib/types'
import { LOCAL_SERVER, MessageTemplates, buildWaText, checkLocalServer, markSent, openWa, pickTemplate } from '@/lib/wa'

interface Props {
  mode: 'invite' | 'reminder'
  guests: Guest[]
  alreadyInvited?: number
  config?: MessageTemplates | null
  onSent?: () => void
}

export default function SendAllButton({ mode, guests, alreadyInvited = 0, config, onSent }: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<string>('')
  const [confirming, setConfirming] = useState(false)
  const [serverOnline, setServerOnline] = useState(false)
  // Snapshot of the guests being sent one-by-one via wa.me, and the next index in it
  const [queue, setQueue] = useState<Guest[] | null>(null)
  const [queueIdx, setQueueIdx] = useState(0)

  const count = guests.length

  useEffect(() => {
    let active = true
    const check = () => checkLocalServer().then(ok => { if (active) setServerOnline(ok) })
    check()
    const id = setInterval(check, 10000)
    return () => { active = false; clearInterval(id) }
  }, [])

  if (count === 0 && alreadyInvited === 0 && !queue) return null

  function openForGuest(list: Guest[], idx: number) {
    const template = pickTemplate(config, mode)
    if (!template) {
      setResult('לא הוגדר נוסח הודעה — מלא בלשונית "הזמנה"')
      setState('error')
      setQueue(null)
      return
    }
    const guest = list[idx]
    openWa(guest.phone, buildWaText(template, guest, window.location.origin))
    markSent(guest.id, mode)
    onSent?.()
    if (idx + 1 >= list.length) {
      setQueue(null)
      setResult(`✅ נפתחו ${list.length} הודעות בווטסאפ`)
      setState('done')
    } else {
      setQueueIdx(idx + 1)
    }
  }

  function sendAll() {
    setConfirming(false)
    setResult('')
    if (!serverOnline) {
      const snapshot = [...guests]
      setQueue(snapshot)
      setQueueIdx(0)
      setState('idle')
      openForGuest(snapshot, 0)
      return
    }
    sendAllViaServer()
  }

  async function sendAllViaServer() {
    setState('loading')
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
      onSent?.()
    } catch (err: unknown) {
      const msg = (err as Error).message
      if (msg.includes('fetch')) {
        setServerOnline(false)
        setResult('השרת נותק — לחץ שוב לשליחה דרך ווטסאפ')
      } else {
        setResult(msg)
      }
      setState('error')
    }
  }

  if (queue) {
    const next = queue[queueIdx]
    return (
      <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-3 py-2">
        <span className="text-xs text-green-300 font-medium">
          {queueIdx}/{queue.length} נפתחו — הבא: {next.name}
        </span>
        <button
          onClick={() => openForGuest(queue, queueIdx)}
          className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg"
        >📱 פתח בווטסאפ</button>
        <button
          onClick={() => { setQueue(null); setResult(`נשלחו ${queueIdx} מתוך ${queue.length}`); setState('done') }}
          className="text-slate-400 hover:text-slate-200 text-xs px-1.5 py-1"
        >עצור</button>
      </div>
    )
  }

  if (confirming && alreadyInvited > 0) {
    return (
      <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
        <span className="text-xs text-amber-300 font-medium">
          {alreadyInvited} מוזמנים כבר קיבלו הזמנה. לשלוח רק ל-{count} הנותרים?
        </span>
        <button onClick={sendAll} className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">כן</button>
        <button onClick={() => setConfirming(false)} className="text-slate-400 hover:text-slate-200 text-xs px-1.5 py-1">ביטול</button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {result && (
        <span className={`text-xs ${state === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
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
