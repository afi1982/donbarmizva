'use client'
import { useEffect, useState, useCallback } from 'react'
import { Guest, InvitationConfig } from '@/lib/types'
import GuestTable from './GuestTable'
import SendAllButton from './SendAllButton'
import AutoRefresh from './AutoRefresh'

export default function LiveGuestTable({ config }: { config?: Partial<InvitationConfig> | null }) {
  const [guests, setGuests] = useState<Guest[]>([])

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/guests', { cache: 'no-store' })
      if (res.ok) setGuests(await res.json())
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 10000)
    return () => clearInterval(id)
  }, [load])

  const pendingGuests = guests.filter(g => g.status === 'pending')
  const notYetInvited = pendingGuests.filter(g => !g.invited_at).length
  const alreadyInvited = pendingGuests.filter(g => !!g.invited_at).length

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-stone-700 text-sm">כל המוזמנים ({guests.length})</h2>
          <AutoRefresh intervalMs={10000} onRefresh={load} />
        </div>
        <SendAllButton mode="invite" count={notYetInvited} alreadyInvited={alreadyInvited} />
      </div>
      <GuestTable guests={guests} config={config} />
    </div>
  )
}
